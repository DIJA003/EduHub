import { useState } from "react";
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
import { formatDate } from "../../../lib/utils";

export default function EnrollmentsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [dropTarget, setDropTarget] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-enrollments", { page, search }],
    queryFn: () => enrollmentsApi.getAll({ page, search }).then((r) => r.data),
  });

  const enrollments = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const { data: studentsData } = useQuery({
    queryKey: ["students-list"],
    queryFn: () =>
      usersApi.getAll({ role: "student", limit: 200 }).then((r) => r.data),
    enabled: modal,
  });
  const students = Array.isArray(studentsData)
    ? studentsData
    : studentsData?.data || [];

  const { data: coursesData } = useQuery({
    queryKey: ["courses-published"],
    queryFn: () =>
      coursesApi
        .getAll({ status: "Published", limit: 200 })
        .then((r) => r.data),
    enabled: modal,
  });
  const courses = Array.isArray(coursesData)
    ? coursesData
    : coursesData?.data || [];

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

  const COLUMNS = [
    {
      key: "student",
      label: "Student",
      render: (e) => (
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
            {e.student?.name?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {e.student?.name || "—"}
            </p>
            <p className="text-xs text-slate-400">{e.student?.email}</p>
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
        <span className="text-xs text-slate-500">
          {e.course?.instructor || "—"}
        </span>
      ),
    },
    {
      key: "enrolledAt",
      label: "Enrolled",
      render: (e) => (
        <span className="text-xs text-slate-400">
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
      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Enrollment Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
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
          onSearch={(s) => {
            setSearch(s);
            setPage(1);
          }}
          onAdd={() => setModal(true)}
          addLabel="Enroll Student"
          emptyIcon="🎓"
          emptyTitle="No enrollments"
          emptyDescription="Enroll students using the button above."
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Enroll Student"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
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
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Student <span className="text-red-500">*</span>
            </label>
            <select
              value={form.studentId}
              onChange={(e) =>
                setForm((p) => ({ ...p, studentId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select student…</option>
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} — {s.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              value={form.courseId}
              onChange={(e) =>
                setForm((p) => ({ ...p, courseId: e.target.value }))
              }
              className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select course…</option>
              {courses.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs text-slate-400">
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
