import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { enrollmentsApi } from "../../../lib/api/enrollments.api";
import { usersApi } from "../../../lib/api/users.api";
import { coursesApi } from "../../../lib/api/courses.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "../../../components/ui/DataTable";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import PageHeader from "../../../components/ui/PageHeader";
import SearchableSelect from "../../../components/ui/SearchableSelect";
import { formatDate } from "../../../lib/utils";

export default function EnrollmentsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [formError, setFormError] = useState("");
  const [dropTarget, setDropTarget] = useState(null);
  const qc = useQueryClient();

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
    queryFn: () =>
      usersApi.getAll({ role: "student", limit: 500 }).then((r) => r.data),
    enabled: modal,
  });

  const students = useMemo(
    () =>
      Array.isArray(studentsData)
        ? studentsData
        : studentsData?.data || [],
    [studentsData],
  );

  const { data: coursesData } = useQuery({
    queryKey: ["courses-published-admin-enroll"],
    queryFn: () =>
      coursesApi
        .getAll({ status: "Published", limit: 500 })
        .then((r) => r.data),
    enabled: modal,
  });

  const courses = useMemo(
    () =>
      Array.isArray(coursesData)
        ? coursesData
        : coursesData?.data || [],
    [coursesData],
  );

  const studentOptions = useMemo(
    () =>
      students.map((s) => ({
        value: s._id,
        label: s.name || "Student",
        description: s.email,
      })),
    [students],
  );

  const courseOptions = useMemo(
    () =>
      courses.map((c) => ({
        value: c._id,
        label: `${c.code ? `${c.code} — ` : ""}${c.title}`,
        description: c.instructor || undefined,
      })),
    [courses],
  );

  const activePairs = useMemo(() => {
    const keys = new Set();
    enrollments.forEach((e) => {
      if (e.student?._id && e.course?._id) {
        keys.add(`${e.student._id}::${e.course._id}`);
      }
    });
    return keys;
  }, [enrollments]);

  const alreadyListed =
    form.studentId &&
    form.courseId &&
    activePairs.has(`${form.studentId}::${form.courseId}`);

  const enrollMutation = useMutation({
    mutationFn: enrollmentsApi.adminEnroll,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast.success("Student enrolled successfully");
      setModal(false);
      setForm({ studentId: "", courseId: "" });
      setFormError("");
    },
    onError: (e) => {
      const msg =
        typeof e.message === "string" ? e.message : "Enrollment failed.";
      if (e.status === 409) toast.warning(msg);
      else toast.error(msg);
      setFormError(msg);
    },
  });

  const unenrollMutation = useMutation({
    mutationFn: ({ studentId, courseId }) =>
      enrollmentsApi.adminUnenroll(studentId, courseId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-enrollments"] });
      toast.success("Enrollment removed");
      setDropTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const COLUMNS = [
    {
      key: "student",
      label: "Student",
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--text-xs)] font-bold text-[var(--color-accent)]">
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
        e.course?.title ? (
          <Badge variant="blue">{e.course.title}</Badge>
        ) : (
          "—"
        ),
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
        <span className="tabular-nums text-[var(--text-xs)] text-[var(--color-text-3)]">
          {formatDate(e.enrolledAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "110px",
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
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin"
          title="Enrollment Management"
          description="Enroll students into published courses. Duplicate pairings are rejected by the server."
        />

        <DataTable
          title="Active Enrollments"
          data={enrollments}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onAdd={() => {
            setForm({ studentId: "", courseId: "" });
            setFormError("");
            setModal(true);
          }}
          addLabel="Enroll Student"
          emptyIcon="🎓"
          emptyTitle="No enrollments"
          emptyDescription="Enroll students using the button above."
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Enroll student"
        subtitle="Search student and published course."
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                setFormError("");
                enrollMutation.mutate(form);
              }}
              loading={enrollMutation.isPending}
              disabled={!form.studentId || !form.courseId}
            >
              Enroll
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <SearchableSelect
            label="Student"
            required
            value={form.studentId}
            onChange={(v) => setForm((p) => ({ ...p, studentId: v }))}
            options={studentOptions}
            placeholder="Pick a student…"
            searchPlaceholder="Search by name or email…"
          />
          <SearchableSelect
            label="Course"
            required
            value={form.courseId}
            onChange={(v) => setForm((p) => ({ ...p, courseId: v }))}
            options={courseOptions}
            placeholder="Pick a course…"
            searchPlaceholder="Search by code or title…"
          />
          {form.studentId && form.courseId && alreadyListed && (
            <p className="text-[var(--text-xs)] font-medium text-[var(--color-warning)]">
              This pairing is already in your active enrollment list—the server will return a conflict instead of inserting a duplicate row.
            </p>
          )}
          {formError ? (
            <p className="text-[var(--text-xs)] text-[var(--color-danger)]">{formError}</p>
          ) : (
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              Dropped learners are re‑activated automatically; active duplicates remain blocked by the backend.
            </p>
          )}
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
