import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { programsApi } from "../../../lib/api/programs.api";
import { facultiesApi } from "../../../lib/api/faculties.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const EMPTY_FORM = {
  code: "",
  name: "",
  description: "",
  faculty: "",
  durationYears: 4,
  status: "Active",
};

export default function ProgramsPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [facultyFilter, setFacultyFilter] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();

  // Check for query params from request navigation
  useEffect(() => {
    const code = searchParams.get("code");
    const name = searchParams.get("name");
    const description = searchParams.get("description");
    const facultyId = searchParams.get("faculty");
    
    if (code || name || facultyId) {
      setForm({
        ...EMPTY_FORM,
        code: code || "",
        name: name || "",
        description: description || "",
        faculty: facultyId || "",
      });
      setModal(true);
    }
  }, [searchParams]);

  const set = useCallback((key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value })), []);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-programs", { page, search, faculty: facultyFilter, showDeleted }],
    queryFn: () => programsApi.getAll({ page, search, faculty: facultyFilter, showDeleted }),
  });
  const programs = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  // Fetch faculties for dropdown
  const { data: facultiesData } = useQuery({
    queryKey: ["faculties"],
    queryFn: () => facultiesApi.getAll({ limit: 100 }),
    enabled: modal || !facultyFilter,
  });
  const faculties = useMemo(() => {
    const data = facultiesData?.data || facultiesData?.data?.data || [];
    return Array.isArray(data) ? data : [];
  }, [facultiesData]);

  const createMutation = useMutation({
    mutationFn: programsApi.create,
    onSuccess: () => {
      qc.invalidateQueries(["admin-programs"]);
      toast.success("Program created");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => programsApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["admin-programs"]);
      toast.success("Program updated");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: programsApi.remove,
    onSuccess: () => {
      qc.invalidateQueries(["admin-programs"]);
      toast.success("Program removed");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });

  const restoreMutation = useMutation({
    mutationFn: programsApi.restore,
    onSuccess: () => {
      qc.invalidateQueries(["admin-programs"]);
      toast.success("Program restored");
    },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal(true);
  };

  const openEdit = (p) => {
    setForm({
      code: p.code || "",
      name: p.name || "",
      description: p.description || "",
      faculty: p.faculty?._id || p.faculty || "",
      durationYears: p.durationYears || 4,
      status: p.status || "Active",
    });
    setEditTarget(p);
    setModal(true);
  };

  const handleSave = () => {
    const payload = {
      ...form,
      durationYears: parseInt(form.durationYears, 10),
    };

    if (editTarget)
      updateMutation.mutate({ id: editTarget._id, data: payload }, { onSuccess: () => setModal(false) });
    else
      createMutation.mutate(payload, { onSuccess: () => setModal(false) });
  };

  const handleCloseModal = useCallback(() => setModal(false), []);

  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage]
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
      render: (p) => (
        <div className="flex items-center gap-2">
          <Badge variant="blue">{p.code}</Badge>
          {p.isDeleted && <Badge variant="red">Deleted</Badge>}
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (p) => <span className="font-medium text-[var(--color-text)]">{p.name}</span>,
    },
    {
      key: "faculty",
      label: "Faculty",
      render: (p) => (
        <span className="text-[var(--color-text-3)] text-[var(--text-xs)]">
          {p.faculty?.code || p.faculty?.name || "—"}
        </span>
      ),
    },
    {
      key: "durationYears",
      label: "Duration",
      render: (p) => <span className="text-[var(--color-text-3)]">{p.durationYears} years</span>,
    },
    {
      key: "status",
      label: "Status",
      render: (p) => <Badge variant={statusBadge(p.status)}>{p.status}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (p) => (
        <div className="flex items-center gap-2 justify-end">
          {p.isDeleted ? (
            <Button size="xs" variant="secondary" onClick={() => restoreMutation.mutate(p._id)}>
              Restore
            </Button>
          ) : (
            <>
              <Button size="xs" variant="secondary" onClick={() => openEdit(p)}>
                Edit
              </Button>
              <Button size="xs" variant="danger" onClick={() => setDeleteTarget(p)}>
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
          <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">Program Management</h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Create and manage academic programs for each faculty.
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          {["all", "Active", "Inactive"].map((s) => (
            <button
              key={s}
              onClick={() => {
                // Reset filter or set status
                if (s === "all") {
                  // Just refresh
                }
                setPage(1);
              }}
              className={filterBtnClass(false)}
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
            {faculties.map((f) => (
              <option key={f._id} value={f._id}>
                {f.code}
              </option>
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
          title="All Programs"
          data={programs}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={openAdd}
          addLabel="Add Program"
          emptyIcon="📋"
          emptyTitle="No programs found"
          emptyDescription="Try a different filter or create a new program."
        />
      </div>

      <Modal
        open={modal}
        onClose={handleCloseModal}
        title={editTarget ? "Edit Program" : "Add New Program"}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={createMutation.isPending || updateMutation.isPending}>
              {editTarget ? "Save Changes" : "Create Program"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Program Code"
              required
              value={form.code}
              onChange={set("code")}
              placeholder="CS-BS"
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
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <Input
            label="Program Name"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Bachelor of Science in Computer Science"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Faculty <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                value={form.faculty}
                onChange={set("faculty")}
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
              >
                <option value="">Select Faculty...</option>
                {faculties.map((f) => (
                  <option key={f._id} value={f._id}>
                    {f.code} - {f.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Duration (Years)"
              type="number"
              value={form.durationYears}
              onChange={set("durationYears")}
              min={1}
              max={7}
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={set("description")}
            placeholder="Brief program description"
          />
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove Program"
        message={`Remove "${deleteTarget?.name}"? This will not delete associated courses.`}
        confirmLabel="Remove"
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
