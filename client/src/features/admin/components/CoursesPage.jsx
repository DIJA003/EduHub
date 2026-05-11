import { useState, useCallback, useMemo } from "react";
import {
  useCourses,
  useCreateCourse,
  useUpdateCourse,
  useDeleteCourse,
  useRestoreCourse,
} from "../../courses/hooks/useCourses";
import { useQuery } from "@tanstack/react-query";
import { usePagination } from "../../../hooks/usePagination";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import SearchableDropdown from "../../../components/ui/SearchableDropdown";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { usersApi } from "../../../lib/api/users.api";
import { facultiesApi } from "../../../lib/api/faculties.api";
import { programsApi } from "../../../lib/api/programs.api";

const EMPTY_FORM = {
  code: "",
  title: "",
  description: "",
  faculty: "",
  program: "",
  yearId: "",
  semester: "",
  creditHours: 3,
  status: "Draft",
  instructor: "",
};

export default function CoursesPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data, isLoading } = useCourses({
    page,
    search,
    status: statusFilter !== "all" ? statusFilter : "",
    faculty: facultyFilter,
    showDeleted,
  });
  const courses = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  // Fetch mentors for instructor dropdown
  const { data: mentorsData } = useQuery({
    queryKey: ["users", "mentors"],
    queryFn: () => usersApi.getAll({ role: "mentor", limit: 1000 }),
    enabled: modal,
  });
  const mentors = useMemo(() => {
    const data = mentorsData?.data?.data || mentorsData?.data || mentorsData;
    return Array.isArray(data) ? data : [];
  }, [mentorsData]);

  // Fetch faculties for dropdown
  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => facultiesApi.getAll({ limit: 100 }),
    enabled: modal,
  });
  const faculties = useMemo(() => {
    const data = facultiesData?.data || facultiesData?.data?.data || [];
    return Array.isArray(data) ? data : [];
  }, [facultiesData]);

  // Fetch programs for dropdown (filter by selected faculty)
  const { data: programsData } = useQuery({
    queryKey: ["programs", form.faculty],
    queryFn: () => programsApi.getByFaculty(form.faculty),
    enabled: modal && !!form.faculty,
  });
  const programs = useMemo(() => {
    const data = programsData?.data || programsData?.data?.data || [];
    return Array.isArray(data) ? data : [];
  }, [programsData]);

  const selectedFaculty = faculties.find(f => f._id === form.faculty);
  const availableYears = selectedFaculty?.years?.filter(y => y.active) || [];
  const selectedYear = availableYears.find(y => y.year === parseInt(form.yearId));
  const availableSemesters = selectedYear?.semesters?.filter(s => s.active) || [];


  const createMutation = useCreateCourse();
  const updateMutation = useUpdateCourse();
  const deleteMutation = useDeleteCourse();
  const restoreMutation = useRestoreCourse();

  const set = useCallback((key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value })), []);
  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal(true);
  };
  const openEdit = (c) => {
    setForm({
      code: c.code || "",
      title: c.title || "",
      description: c.description || "",
      faculty: c.faculty?._id || c.faculty || "",
      program: c.program?._id || c.program || "",
      yearId: c.yearId || "",
      semester: c.semester || "",
      creditHours: c.creditHours || 3,
      status: c.status || "Draft",
      instructor: c.instructorRef || "",
    });
    setEditTarget(c);
    setModal(true);
  };
  const handleSave = () => {
    // Find selected mentor to get the name
    const selectedMentor = mentors.find((m) => m._id === form.instructor);
    const payload = {
      ...form,
      yearId: form.yearId ? parseInt(form.yearId, 10) : undefined,
      semester: form.semester ? parseInt(form.semester, 10) : undefined,
      creditHours: parseInt(form.creditHours, 10),
      instructorId: form.instructor || undefined,
      instructor: selectedMentor?.name || form.instructor || "",
    };

    if (editTarget)
      updateMutation.mutate(
        { id: editTarget._id, data: payload },
        { onSuccess: () => setModal(false) },
      );
    else createMutation.mutate(payload, { onSuccess: () => setModal(false) });
  };

  const handleCloseModal = useCallback(() => {
    setModal(false);
  }, []);
  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage],
  );

  const filterBtnClass = (active) =>
    `px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold transition-colors capitalize ${
      active
        ? "bg-[var(--color-accent)] text-white"
        : "bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)]"
    }`;

  const COLUMNS = [
    {
      key: "code",
      label: "Code",
      render: (c) => (
        <div className="flex items-center gap-2">
          <Badge variant="blue">{c.code}</Badge>
          {c.isDeleted && <Badge variant="red">Deleted</Badge>}
        </div>
      ),
    },
    {
      key: "title",
      label: "Title",
      render: (c) => (
        <span className="font-medium text-[var(--color-text)]">{c.title}</span>
      ),
    },
    {
      key: "faculty",
      label: "Faculty / Program",
      render: (c) => (
        <div className="text-[var(--text-xs)]">
          <span className="text-[var(--color-text-2)] font-medium">
            {c.faculty?.code || c.faculty?.name || "—"}
          </span>
          {c.program && (
            <span className="text-[var(--color-text-3)] ml-1">
              • {c.program?.code || c.program?.name}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "yearId",
      label: "Year/Sem",
      render: (c) =>
        c.yearId ? (
          <span className="text-[var(--text-xs)]">
            Y{c.yearId}
            {c.semester && `/S${c.semester}`}
          </span>
        ) : "—",
    },
    {
      key: "creditHours",
      label: "Credits",
      render: (c) => (
        <span className="text-[var(--color-text-3)]">{c.creditHours} cr</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (c) => <Badge variant={statusBadge(c.status)}>{c.status}</Badge>,
    },
    {
      key: "instructor",
      label: "Instructor",
      render: (c) => (
        <span className="text-[var(--color-text-3)] text-[var(--text-sm)]">
          {c.instructor || "—"}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (c) => (
        <div className="flex items-center gap-2 justify-end">
          {c.isDeleted ? (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => restoreMutation.mutate(c._id)}
            >
              Restore
            </Button>
          ) : (
            <>
              <Button size="xs" variant="secondary" onClick={() => openEdit(c)}>
                Edit
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => setDeleteTarget(c)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="space-y-4 animate-fade-up">
        <div>
          <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
            Course Management
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Create and manage courses across all faculties.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "Draft", "Published", "Archived"].map((s) => (
            <button
              key={s}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={filterBtnClass(statusFilter === s)}
            >
              {s}
            </button>
          ))}
          <select
            value={facultyFilter}
            onChange={(e) => {
              setFacultyFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold bg-[var(--color-surface-2)] border border-[var(--color-border-2)] text-[var(--color-text)]"
          >
            <option value="">All Faculties</option>
            {faculties.map(f => (
              <option key={f._id} value={f._id}>{f.code}</option>
            ))}
          </select>
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold ml-auto border transition-colors ${
              showDeleted
                ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)] border-opacity-30"
                : "bg-[var(--color-surface-2)] border-[var(--color-border-2)] text-[var(--color-text-3)]"
            }`}
          >
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>
        </div>
        <DataTable
          title="All Courses"
          data={courses}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={openAdd}
          addLabel="Add Course"
          emptyIcon="📚"
          emptyTitle="No courses found"
          emptyDescription="Try a different filter or create a new course."
        />
      </div>

      <Modal
        open={modal}
        onClose={handleCloseModal}
        title={editTarget ? "Edit Course" : "Add New Course"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? "Save Changes" : "Create Course"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Course Code"
              required
              value={form.code}
              onChange={set("code")}
              placeholder="CS101"
              disabled={!!editTarget}
            />
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={set("status")}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option>Draft</option>
                <option>Published</option>
                <option>Archived</option>
              </select>
            </div>
          </div>
          <Input
            label="Course Title"
            required
            value={form.title}
            onChange={set("title")}
            placeholder="Introduction to Computer Science"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Faculty
              </label>
              <select
                value={form.faculty}
                onChange={(e) => {
                  setForm((p) => ({ ...p, faculty: e.target.value, program: "" }));
                }}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Select Faculty...</option>
                {faculties.map(f => (
                  <option key={f._id} value={f._id}>{f.code} - {f.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Program
              </label>
              <select
                value={form.program}
                onChange={set("program")}
                disabled={!form.faculty}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">{form.faculty ? "Select Program..." : "Select Faculty First"}</option>
                {programs.map(p => (
                  <option key={p._id} value={p._id}>{p.code} - {p.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Instructor
              </label>
              <SearchableDropdown
                value={form.instructor}
                onChange={(val) => setForm((p) => ({ ...p, instructor: val }))}
                placeholder="Select an instructor..."
                options={mentors}
                getOptionKey={(m) => m._id || m.name}
                getOptionLabel={(m) => m.name}
                getOptionSubtitle={(m) => m.email}
                emptyMessage="No instructors found"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Year
              </label>
              <select
                value={form.yearId}
                onChange={set("yearId")}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">None</option>
                {availableYears.map((y) => (
                  <option key={y.year} value={y.year}>
                    {y.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Semester
              </label>
              <select
                value={form.semester}
                onChange={set("semester")}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">None</option>
                {availableSemesters.map((s) => (
                  <option key={s.number} value={s.number}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Credit Hours"
              type="number"
              value={form.creditHours}
              onChange={set("creditHours")}
              min={1}
              max={6}
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={set("description")}
            placeholder="Brief course description"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Course"
        message={`Delete "${deleteTarget?.title}"? It can be restored later.`}
        confirmLabel="Delete"
        onConfirm={() =>
          deleteMutation.mutate(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
