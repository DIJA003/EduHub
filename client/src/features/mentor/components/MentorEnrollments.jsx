import { useState, useCallback, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Trash2 } from "lucide-react";
import { enrollmentsApi } from "../../../lib/api/enrollments.api";
import { usersApi } from "../../../lib/api/users.api";
import { coursesApi } from "../../../lib/api/courses.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "../../admin/components/DataTable";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Badge from "../../../components/ui/Badges";

export default function MentorEnrollments() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [enrollModal, setEnrollModal] = useState(false);
  const [unenrollTarget, setUnenrollTarget] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const qc = useQueryClient();

  // Fetch all enrollments
  const { data, isLoading } = useQuery({
    queryKey: ["mentor-enrollments", { page, search }],
    queryFn: () => enrollmentsApi.getAll({ page, search, limit: 20 }),
  });
  const enrollments = useMemo(() => {
    const d = data?.data || data;
    return Array.isArray(d) ? d : [];
  }, [data]);
  const meta = data?.meta;

  // Fetch students for enrollment
  const { data: studentsData } = useQuery({
    queryKey: ["students"],
    queryFn: () => usersApi.getAll({ role: "student", limit: 100 }),
    enabled: enrollModal,
  });
  const students = useMemo(() => {
    const d = studentsData?.data?.data || studentsData?.data || [];
    return Array.isArray(d) ? d : [];
  }, [studentsData]);

  // Fetch courses for enrollment
  const { data: coursesData } = useQuery({
    queryKey: ["courses"],
    queryFn: () => coursesApi.getAll({ status: "Published", limit: 100 }),
    enabled: enrollModal,
  });
  const courses = useMemo(() => {
    const d = coursesData?.data || coursesData?.data?.data || [];
    return Array.isArray(d) ? d : [];
  }, [coursesData]);

  // Enroll mutation
  const enrollMutation = useMutation({
    mutationFn: enrollmentsApi.mentorEnroll,
    onSuccess: () => {
      qc.invalidateQueries(["mentor-enrollments"]);
      toast.success("Student enrolled successfully");
      setEnrollModal(false);
      setSelectedStudent("");
      setSelectedCourse("");
    },
    onError: (e) => toast.error(e.message),
  });

  // Unenroll mutation
  const unenrollMutation = useMutation({
    mutationFn: ({ studentId, courseId }) => enrollmentsApi.mentorUnenroll(studentId, courseId),
    onSuccess: () => {
      qc.invalidateQueries(["mentor-enrollments"]);
      toast.success("Student unenrolled successfully");
      setUnenrollTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const handleEnroll = () => {
    if (!selectedStudent || !selectedCourse) {
      toast.error("Please select both student and course");
      return;
    }
    enrollMutation.mutate({ studentId: selectedStudent, courseId: selectedCourse });
  };

  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage]
  );

  const COLUMNS = [
    {
      key: "student",
      label: "Student",
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-[var(--color-accent)] font-semibold text-sm">
            {(e.student?.name || "?").charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{e.student?.name}</p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">{e.student?.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "course",
      label: "Course",
      render: (e) => (
        <div>
          <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)]">{e.course?.title}</p>
          <Badge variant="blue" className="text-[var(--text-xs)]">{e.course?.code}</Badge>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (e) => <Badge variant={e.status === "active" ? "success" : "default"}>{e.status}</Badge>,
    },
    {
      key: "enrolledAt",
      label: "Enrolled",
      render: (e) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {e.enrolledAt ? new Date(e.enrolledAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "100px",
      render: (e) => (
        <Button
          size="xs"
          variant="danger"
          onClick={() => setUnenrollTarget(e)}
          className="flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Unenroll
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">Enrollment Management</h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Enroll or unenroll students from courses.
        </p>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setEnrollModal(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Enroll Student
        </Button>
      </div>

      <DataTable
        title="Student Enrollments"
        data={enrollments}
        columns={COLUMNS}
        loading={isLoading}
        meta={meta}
        page={page}
        onPage={setPage}
        onSearch={handleSearch}
        emptyIcon={<Users className="w-12 h-12 text-[var(--color-text-3)]" />}
        emptyTitle="No enrollments found"
        emptyDescription="Enroll students to see them here."
      />

      {/* Enroll Modal */}
      <Modal
        open={enrollModal}
        onClose={() => setEnrollModal(false)}
        title="Enroll Student in Course"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEnrollModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnroll} loading={enrollMutation.isPending}>
              Enroll Student
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
              Select Student
            </label>
            <select
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
              Select Course
            </label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="">Choose a course...</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} - {c.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Modal>

      {/* Unenroll Confirmation */}
      <ConfirmDialog
        open={!!unenrollTarget}
        title="Unenroll Student"
        message={`Unenroll "${unenrollTarget?.student?.name}" from "${unenrollTarget?.course?.title}"?`}
        confirmLabel="Unenroll"
        confirmVariant="danger"
        onConfirm={() =>
          unenrollMutation.mutate({
            studentId: unenrollTarget?.student?._id,
            courseId: unenrollTarget?.course?._id,
          })
        }
        onCancel={() => setUnenrollTarget(null)}
        loading={unenrollMutation.isPending}
      />
    </div>
  );
}
