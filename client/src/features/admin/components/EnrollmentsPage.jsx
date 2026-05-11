import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "../../../lib/api/enrollments.api";
import { usersApi } from "../../../lib/api/users.api";
import { coursesApi } from "../../../lib/api/courses.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "./DataTable";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import SearchableDropdown from "../../../components/ui/SearchableDropdown";
import { formatDate } from "../../../lib/utils";

export default function EnrollmentsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [dropTarget, setDropTarget] = useState(null);
  const qc = useQueryClient();

  // Stable callback to prevent modal defocusing on input
  const handleCloseModal = useCallback(() => {
    setModal(false);
    setForm({ studentId: "", courseId: "" });
  }, []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enrollments", { page, search }],
    queryFn: () => enrollmentsApi.getAll({ page, search }).then((r) => r.data),
  });
  const enrollments = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data],
  );
  const meta = data?.meta;

  const { data: studentsData } = useQuery({
    queryKey: ["students-list"],
    enabled: modal,
    queryFn: () =>
      usersApi.getAll({ role: "student", limit: 200 }).then((r) => r.data),
  });
  const students = useMemo(
    () => (Array.isArray(studentsData) ? studentsData : studentsData?.data || []),
    [studentsData],
  );

  // Filter out students already enrolled in the selected course
  const enrolledStudentIds = useMemo(() => {
    if (!form.courseId) return new Set();
    return new Set(
      enrollments
        .filter((e) => e.course?._id === form.courseId || e.course === form.courseId)
        .map((e) => e.student?._id || e.student)
    );
  }, [enrollments, form.courseId]);

  const availableStudents = useMemo(() => {
    return students.filter((s) => !enrolledStudentIds.has(s._id));
  }, [students, enrolledStudentIds]);

  const { data: coursesData } = useQuery({
    queryKey: ["courses-published"],
    enabled: modal,
    queryFn: () =>
      coursesApi
        .getAll({ status: "Published", limit: 200 })
        .then((r) => r.data),
  });
  const courses = useMemo(
    () => (Array.isArray(coursesData) ? coursesData : coursesData?.data || []),
    [coursesData],
  );

  const enrollMutation = useMutation({
    mutationFn: enrollmentsApi.adminEnroll,
    onSuccess: () => {
      qc.invalidateQueries(["admin-enrollments"]);
      toast.success("Student enrolled successfully");
      setModal(false);
      setForm({ studentId: "", courseId: "" });
    },
    onError: (e) => toast.error(e.message),
  });
  const unenrollMutation = useMutation({
    mutationFn: ({ studentId, courseId }) =>
      enrollmentsApi.adminUnenroll(studentId, courseId),
    onSuccess: () => {
      qc.invalidateQueries(["admin-enrollments"]);
      toast.success("Enrollment removed");
      setDropTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage],
  );

  const COLUMNS = [
    {
      key: "student",
      label: "Student",
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[var(--color-accent)] text-white text-[var(--text-xs)] font-bold flex items-center justify-center">
            {e.student?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">
              {e.student?.name || "—"}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              {e.student?.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (e) =>
        e.course?.title ? <Badge variant="blue">{e.course.title}</Badge> : "—",
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (e) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {e.course?.instructor || "—"}
        </span>
      ),
    },
    {
      key: "enrolledAt",
      label: "Enrolled",
      render: (e) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {formatDate(e.enrolledAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "80px",
      render: (e) => (
        <div className="flex justify-end">
          <Button size="xs" variant="danger" onClick={() => setDropTarget(e)}>
            Remove
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 animate-fade-up">
        <div>
          <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
            Enrollment Management
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Enroll and manage students in courses.
          </p>
        </div>
        <DataTable
          title="Active Enrollments"
          data={enrollments}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={() => setModal(true)}
          addLabel="Enroll Student"
          emptyIcon="🎓"
          emptyTitle="No enrollments"
          emptyDescription="Enroll students using the button above."
        />
      </div>

      <Modal
        open={modal}
        onClose={handleCloseModal}
        title="Enroll Student"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              onClick={() => enrollMutation.mutate(form)}
              loading={enrollMutation.isPending}
              disabled={!form.studentId || !form.courseId}
            >
              Enroll
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SearchableDropdown
            label="Student"
            required
            showAvatar
            options={availableStudents}
            value={form.studentId}
            onChange={(id) => setForm((p) => ({ ...p, studentId: id }))}
            placeholder="Select a student…"
            emptyMessage={form.courseId && availableStudents.length === 0 ? "All students already enrolled in this course" : "No students found"}
            getOptionKey={(s) => s._id}
            getOptionLabel={(s) => s.name}
            getOptionSubtitle={(s) => s.email}
            getOptionAvatar={(s) => s.photoURL}
          />

          <SearchableDropdown
            label="Course"
            required
            options={courses}
            value={form.courseId}
            onChange={(id) => setForm((p) => ({ ...p, courseId: id }))}
            placeholder="Select a course…"
            emptyMessage="No courses found"
            getOptionKey={(c) => c._id}
            getOptionLabel={(c) => `${c.code}: ${c.title}`}
            getOptionSubtitle={(c) => c.instructor || "No instructor"}
          />

          {form.studentId && form.courseId && (
            <div className="p-3 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] border border-[var(--color-accent)]/20">
              <p className="text-[var(--text-sm)] text-[var(--color-text)]">
                <span className="font-semibold">Ready to enroll:</span>{" "}
                {students.find((s) => s._id === form.studentId)?.name} →{" "}
                {courses.find((c) => c._id === form.courseId)?.title}
              </p>
            </div>
          )}

          <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
            If a student was previously removed, they will be re-enrolled
            automatically.
          </p>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!dropTarget}
        title="Remove Enrollment"
        message={`Remove "${dropTarget?.student?.name}" from "${dropTarget?.course?.title}"?`}
        confirmLabel="Remove"
        onConfirm={() =>
          unenrollMutation.mutate({
            studentId: dropTarget.student?._id,
            courseId: dropTarget.course?._id,
          })
        }
        onCancel={() => setDropTarget(null)}
        loading={unenrollMutation.isPending}
      />
    </>
  );
}
