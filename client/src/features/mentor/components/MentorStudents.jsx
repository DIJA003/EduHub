import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { mentorApi } from "../../../lib/api/mentor.api";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import PageHeader from "../../../components/ui/PageHeader";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { Card } from "../../../components/ui/Card";
import { formatDate } from "../../../lib/utils";
import { toast } from "../../../hooks/useToasts";

export default function MentorStudents() {
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-students"],
    queryFn: () => mentorApi.getStudents().then((r) => r.data?.data || []),
  });

  const { data: studentsData } = useQuery({
    queryKey: ["mentor-enrollable-students"],
    queryFn: () => mentorApi.getEnrollableStudents().then((r) => r.data?.data || []),
    enabled: modal,
  });

  const { data: coursesData } = useQuery({
    queryKey: ["mentor-my-courses-modal"],
    queryFn: () => mentorApi.getMyCourses().then((r) => r.data?.data || []),
    enabled: modal,
  });

  const students = useMemo(
    () =>
      Array.isArray(studentsData)
        ? studentsData
        : studentsData?.data || [],
    [studentsData],
  );
  const courses = useMemo(
    () =>
      Array.isArray(coursesData) ? coursesData : coursesData?.data || [],
    [coursesData],
  );
  const roster = data || [];

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: s._id,
        label: s.name || "Student",
        description: `${s.email || ""}${s.college ? ` · ${s.college}` : ""}`,
      })),
    [students],
  );

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: c._id,
        label: `${c.code ? `${c.code} — ` : ""}${c.title}`,
        description: `${c.students ?? 0} learner(s) enrolled`,
      })),
    [courses],
  );

  const enrollMutation = useMutation({
    mutationFn: mentorApi.enrollStudent,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentor-students"] });
      toast.success("Enrollment saved.");
      setModal(false);
      setForm({ studentId: "", courseId: "" });
    },
    onError: (e) => {
      if (e.status === 409) toast.warning(e.message);
      else toast.error(e.message || "Could not enroll");
    },
  });

  const selectedCourse = courses.find(
    (c) => String(c._id) === String(form.courseId),
  );

  const alreadyHasPair =
    Boolean(form.studentId && selectedCourse) &&
    roster.some(
      (row) =>
        String(row._id) === String(form.studentId) &&
        row.courseCode === selectedCourse.code,
    );

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Mentor"
          title="My Students"
          description="Anyone enrolled for at least one of your courses surfaces here—including rows per course pairing."
          actions={
            <Button size="sm" onClick={() => setModal(true)}>
              Assign student to course
            </Button>
          }
        />

        <Card variant="glass" padding={false} className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
            <span className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
              {roster.length} learner row{roster.length !== 1 ? "s" : ""}{" "}
              <span className="font-normal text-[var(--color-text-3)]">
                (includes duplicates across multiple courses)
              </span>
            </span>
          </div>

          {isLoading ? (
            <TableSkeleton rows={5} cols={4} />
          ) : roster.length === 0 ? (
            <EmptyState
              icon="🎓"
              title="No students yet"
              description="Invite learners by assigning them to one of your published courses."
              action={() => setModal(true)}
              actionLabel="Assign student"
              compact
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px] text-left">
                <thead className="bg-[var(--color-surface-2)]/80">
                  <tr>
                    {["Student", "Email", "Course", "Enrolled"].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-[var(--text-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-3)] sm:px-6"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {roster.map((row, i) => {
                    const cid = `${row.email || row.name}-${row.courseCode}-${i}`;
                    return (
                      <tr
                        key={cid}
                        className="hover:bg-[var(--color-surface-2)]/40"
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--text-xs)] font-semibold uppercase text-[var(--color-accent)]">
                              {(row.name || "?")[0]}
                            </div>
                            <span className="font-medium text-[var(--color-text)]">
                              {row.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-[var(--text-sm)] text-[var(--color-text-2)] sm:px-6">
                          {row.email}
                        </td>
                        <td className="px-4 py-3.5 text-[var(--text-sm)] sm:px-6">
                          <Badge variant="blue">{row.course}</Badge>
                          <span className="ml-2 text-[var(--text-xs)] text-[var(--color-text-3)]">
                            {row.courseCode}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-[var(--text-xs)] tabular-nums text-[var(--color-text-3)] sm:px-6">
                          {formatDate(row.enrolledAt)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Assign student"
        subtitle="Only your own mentor courses appear here."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => enrollMutation.mutate(form)}
              loading={enrollMutation.isPending}
              disabled={
                !form.studentId ||
                !form.courseId ||
                Boolean(alreadyHasPair)
              }
            >
              Enroll now
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Student"
            required
            options={studentOptions}
            placeholder="Pick a learner…"
            searchPlaceholder="Search students…"
            value={form.studentId}
            onChange={(studentId) => setForm((p) => ({ ...p, studentId }))}
          />
          <SearchableSelect
            label="Course"
            required
            options={courseOptions}
            placeholder="Pick your course…"
            searchPlaceholder="Search by code/title…"
            value={form.courseId}
            onChange={(courseId) => setForm((p) => ({ ...p, courseId }))}
          />
          {alreadyHasPair && (
            <p className="text-[var(--text-xs)] font-medium text-[var(--color-warning)]">
              This learner already maps to this course in your roster. Use “Material Reviews” to track other work—they don’t need a duplicate enrollment row.
            </p>
          )}
          <p className="text-[var(--text-xs)] text-[var(--color-text-3)] leading-relaxed">
            Server-side checks ensure you cannot assign mentors to strangers’ offerings. Conflicts reuse the same graceful message as admins.
          </p>
        </div>
      </Modal>
    </>
  );
}
