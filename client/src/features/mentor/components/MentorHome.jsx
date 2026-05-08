import { useCallback, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Clock, CheckCircle, XCircle, Users, BookOpen, FileText, Upload } from "lucide-react";
import { usePendingMaterials } from "../../materials/hooks/useMaterials";
import { useAuth } from "../../../context/AuthContext";
import { mentorApi } from "../../../lib/api/mentor.api";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import StatsCard, { StatsGrid, StatsCardSkeleton } from "../../../components/ui/StatsCard";
import { SkeletonList } from "../../../components/ui/Skeleton";
import { timeAgo } from "../../../lib/utils";
import { useMaterialReview } from "../../../hooks/useMaterialReview";
import ReviewModal from "../../../components/common/ReviewModel";
import MentorUploadModal from "./MentorUploadModal";

function WelcomeSection({ name }) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[var(--radius-2xl)] p-6 sm:p-8 bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-500"
    >
      <div
  className="absolute inset-0 opacity-50"
  style={{
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
  }}
/>
      <div className="relative z-10">
        <p className="text-white/70 text-[var(--text-sm)] font-medium mb-1">
          {greeting}
        </p>
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-2">
          {name || "Mentor"}
        </h1>
        <p className="text-white/80 text-[var(--text-sm)] max-w-lg">
          Review student submissions, track progress, and support your students.
        </p>
      </div>
    </motion.div>
  );
}

function PendingReviewCard({ material, onApprove, onReject }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)] hover:border-[var(--color-border-2)] transition-all"
    >
      <div className="w-10 h-10 rounded-[var(--radius-md)] bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0">
        <FileText className="w-5 h-5" strokeWidth={1.75} />
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate mb-0.5">
          {material.title}
        </h4>
        <div className="flex items-center gap-2 text-[var(--text-xs)] text-[var(--color-text-3)]">
          <span>{material.uploadedBy?.name || "Unknown"}</span>
          <span>in</span>
          <Badge variant="blue">{material.courseRef?.title || "Unknown"}</Badge>
        </div>
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-1">
          {timeAgo(material.createdAt)}
        </p>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <Button
          size="xs"
          variant="success"
          onClick={() => onApprove(material)}
        >
          Approve
        </Button>
        <Button
          size="xs"
          variant="danger"
          onClick={() => onReject(material)}
        >
          Reject
        </Button>
      </div>
    </motion.div>
  );
}

function CourseCard({ course }) {
  return (
    <div className="flex items-center justify-between p-4 rounded-[var(--radius-lg)] bg-[var(--color-surface-2)] border border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
          <BookOpen className="w-5 h-5" strokeWidth={1.75} />
        </div>
        <div>
          <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">{course.title}</p>
          <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">{course.code} - {course.creditHours} credits</p>
        </div>
      </div>
      <Badge variant={course.status === "Published" ? "success" : "default"}>
        {course.status}
      </Badge>
    </div>
  );
}

function StudentCard({ student }) {
  const initials = (student.name || "?").charAt(0).toUpperCase();
  const hash = [...(student.name ?? "")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;

  return (
    <div className="flex items-center justify-between py-3 px-4 bg-[var(--color-surface-2)] rounded-[var(--radius-lg)] border border-[var(--color-border)]">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
          style={{ background: `hsl(${hue},55%,45%)` }}
        >
          {initials}
        </div>
        <div>
          <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{student.name}</p>
          <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">{student.email}</p>
        </div>
      </div>
      <div className="text-right text-[var(--text-xs)] text-[var(--color-text-3)]">
        <p>{student.college || "No college"}</p>
      </div>
    </div>
  );
}

export default function MentorHome() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "Mentor";
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  const review = useMaterialReview();

  const handleConfirmReview = useCallback(() => review.submitReview(), [review]);
  const handleCloseReview = useCallback(() => review.closeReview(), [review]);

  const { data, isLoading } = usePendingMaterials({ limit: 10 });
  const pending = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data],
  );

  const { data: coursesData, isLoading: coursesLoading } = useQuery({
    queryKey: ["mentor-my-courses"],
    queryFn: () => mentorApi.getMyCourses().then((r) => r.data?.data ?? r.data ?? []),
  });
  const myCourses = useMemo(() => coursesData || [], [coursesData]);

  const { data: studentsData, isLoading: studentsLoading } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => mentorApi.getStudents().then((r) => r.data?.data ?? r.data ?? []),
    enabled: myCourses.length > 0,
  });
  const myStudents = useMemo(() => studentsData || [], [studentsData]);

  return (
    <div className="space-y-6">
      <WelcomeSection name={firstName} />

      {/* Stats */}
      {isLoading || studentsLoading ? (
        <StatsGrid>
          {[1, 2, 3, 4].map((i) => <StatsCardSkeleton key={i} />)}
        </StatsGrid>
      ) : (
        <StatsGrid>
          <StatsCard
            label="Pending Reviews"
            value={pending.length}
            icon={Clock}
            color="amber"
          />
          <StatsCard
            label="Approved Today"
            value="--"
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            label="Rejected Today"
            value="--"
            icon={XCircle}
            color="red"
          />
          <StatsCard
            label="My Students"
            value={myStudents.length}
            icon={Users}
            color="blue"
          />
        </StatsGrid>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Reviews */}
        <div className="lg:col-span-2">
          <div className="surface p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text)]">
                  Pending Reviews
                </h2>
                {pending.length > 0 && (
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-white text-[var(--text-xs)] font-bold flex items-center justify-center">
                    {pending.length}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setUploadModalOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload Material
              </Button>
            </div>

            {isLoading ? (
              <SkeletonList items={3} />
            ) : pending.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="w-8 h-8" strokeWidth={1.5} />}
                title="All caught up!"
                description="No pending materials to review."
              />
            ) : (
              <div className="space-y-3">
                {pending.slice(0, 5).map((m, i) => (
                  <motion.div
                    key={m._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <PendingReviewCard
                      material={m}
                      onApprove={(material) => review.openReview(material, "approve")}
                      onReject={(material) => review.openReview(material, "reject")}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Courses */}
          <div className="surface p-5">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)] uppercase tracking-wider mb-4">
              My Courses ({myCourses.length})
            </h2>
            {coursesLoading ? (
              <SkeletonList items={2} />
            ) : myCourses.length === 0 ? (
              <EmptyState
                icon={<BookOpen className="w-6 h-6" strokeWidth={1.5} />}
                title="No courses"
                description="Contact admin to get assigned."
                className="py-6"
              />
            ) : (
              <div className="space-y-3">
                {myCourses.slice(0, 3).map((course) => (
                  <CourseCard key={course._id} course={course} />
                ))}
              </div>
            )}
          </div>

          {/* Students Preview */}
          <div className="surface p-5">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)] uppercase tracking-wider mb-4">
              Recent Students ({myStudents.length})
            </h2>
            {studentsLoading ? (
              <SkeletonList items={2} />
            ) : myStudents.length === 0 ? (
              <EmptyState
                icon={<Users className="w-6 h-6" strokeWidth={1.5} />}
                title="No students"
                description="Students will appear here."
                className="py-6"
              />
            ) : (
              <div className="space-y-2">
                {myStudents.slice(0, 4).map((student) => (
                  <StudentCard key={student._id} student={student} />
                ))}
              </div>
            )}
          </div>
        </div>
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

      {/* Upload Modal */}
      <MentorUploadModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        courses={myCourses}
      />
    </div>
  );
}
