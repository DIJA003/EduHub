import { useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { usePendingMaterials } from "../../materials/hooks/useMaterials";
import { useAuth } from "../../../hooks/useAuth";
import { mentorApi } from "../../../lib/api/mentor.api";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { timeAgo } from "../../../lib/utils";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import ReviewModal from "../../../components/common/ReviewModel";

export default function MentorHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Mentor";

  const review = useMaterialReview();

  // Stable callbacks to prevent modal defocusing
  const handleConfirmReview = useCallback(() => review.submitReview(), [review]);
  const handleCloseReview = useCallback(() => review.closeReview(), [review]);

  const { data, isLoading } = usePendingMaterials({ limit: 10 });
  const pending = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data],
  );

  // Fetch mentor's assigned courses
  const { data: coursesData } = useQuery({
    queryKey: ["mentor-my-courses"],
    queryFn: () => mentorApi.getMyCourses().then((r) => r.data?.data ?? r.data ?? []),
  });
  const myCourses = useMemo(() => coursesData || [], [coursesData]);

  // Fetch students enrolled in mentor's courses
  const { data: studentsData } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => mentorApi.getStudents().then((r) => r.data?.data ?? r.data ?? []),
    enabled: myCourses.length > 0,
  });
  const myStudents = useMemo(() => studentsData || [], [studentsData]);

  // Group students by course
  const studentsByCourse = useMemo(() => {
    const grouped = {};
    myStudents.forEach((student) => {
      const courseName = student.course || "Unknown Course";
      if (!grouped[courseName]) {
        grouped[courseName] = [];
      }
      grouped[courseName].push(student);
    });
    return grouped;
  }, [myStudents]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[var(--color-text)]">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-[var(--color-text-3)] mt-1">
          Here's what needs your attention today.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Reviews",
            value: pending.length,
            icon: "⏳",
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Approved Today",
            value: "—",
            icon: "✅",
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Rejected Today",
            value: "—",
            icon: "❌",
            color: "bg-red-50 text-red-600",
          },
          {
            label: "My Students",
            value: myStudents.length,
            icon: "🎓",
            color: "bg-blue-50 text-blue-600",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="surface-2 p-5 hover-lift"
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]">
                {s.label}
              </p>
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${s.color}`}
              >
                {s.icon}
              </div>
            </div>
            <p className="text-3xl font-black text-[var(--color-text)]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* My Assigned Courses */}
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            My Assigned Courses
            {myCourses.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold">
                {myCourses.length}
              </span>
            )}
          </h2>
        </div>
        {myCourses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No courses assigned"
            description="You are not currently assigned as an instructor to any courses. Contact an admin to assign you to courses."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {myCourses.map((course) => (
              <div key={course._id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[var(--color-text)]">{course.title}</p>
                  <p className="text-xs text-[var(--color-text-3)]">{course.code} • {course.creditHours} credits</p>
                </div>
                <Badge variant={course.status === "Published" ? "success" : "default"}>
                  {course.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Students by Course */}
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            My Students
            {myStudents.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-accent)] text-white text-[10px] font-bold">
                {myStudents.length}
              </span>
            )}
          </h2>
        </div>
        {myStudents.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No students enrolled"
            description="Students enrolled in your courses will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {Object.entries(studentsByCourse).map(([courseName, students]) => (
              <div key={courseName} className="p-5">
                <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)] mb-3">
                  {courseName}
                  <span className="ml-2 text-[var(--color-text-3)] font-normal">({students.length} students)</span>
                </h3>
                <div className="space-y-2">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center justify-between py-2 px-3 bg-[var(--color-surface-2)] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-xs font-bold flex items-center justify-center">
                          {student.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-[var(--color-text)]">{student.name}</p>
                          <p className="text-xs text-[var(--color-text-3)]">{student.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-[var(--color-text-3)]">{student.college || "—"}</p>
                        <p className="text-xs text-[var(--color-text-3)]">Enrolled: {student.enrolledAt}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Reviews Table */}
      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)] flex items-center justify-between">
          <h2 className="text-sm font-bold text-[var(--color-text)]">
            Pending Material Reviews
            {pending.length > 0 && (
              <span className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold">
                {pending.length}
              </span>
            )}
          </h2>
        </div>

        {isLoading ? (
          <div className="p-4">
            <CardSkeleton count={3} />
          </div>
        ) : pending.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            description="No pending materials to review right now."
          />
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {[
                  "Material",
                  "Uploaded By",
                  "Course",
                  "Uploaded",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-[var(--color-border)]">
              {pending.map((m) => (
                <tr key={m._id} className="hover:bg-[var(--color-surface-2)] transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-[var(--color-text)]">
                    {m.title}
                  </td>

                  <td className="px-5 py-3.5 text-sm text-[var(--color-text-2)]">
                    {m.uploadedBy?.name || "—"}
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{m.courseRef?.title || "—"}</Badge>
                  </td>

                  <td className="px-5 py-3.5 text-xs text-[var(--color-text-3)]">
                    {timeAgo(m.createdAt)}
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2 justify-end">
                      <Button
                        size="xs"
                        onClick={() => review.openReview(m, "approve")}
                      >
                        Approve
                      </Button>

                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => review.openReview(m, "reject")}
                      >
                        Reject
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        open={!!review.reviewTarget}
        action={review.reviewAction}
        feedback={review.feedback}
        onFeedbackChange={review.setFeedback}
        onConfirm={handleConfirmReview}
        onCancel={handleCloseReview}
        loading={review.isLoading}
      />
    </div>
  );
}
