import { useState, useCallback, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import { facultiesApi } from "../../../lib/api/faculties.api";
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
  years: [{ year: 1, name: "Year 1", semesters: [
    { number: 1, name: "Fall" },
    { number: 2, name: "Spring" },
    { number: 3, name: "Summer" }
  ] }],
  status: "active",
};

export default function FacultiesPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [yearCount, setYearCount] = useState(1);
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();

  // Check for query params from request navigation
  useEffect(() => {
    const code = searchParams.get("code");
    const name = searchParams.get("name");
    const description = searchParams.get("description");
    
    if (code || name) {
      setForm({
        ...EMPTY_FORM,
        code: code || "",
        name: name || "",
        description: description || "",
      });
      setModal(true);
    }
  }, [searchParams]);

  const { data, isLoading } = useQuery({
    queryKey: ["faculties", { page, search, showDeleted }],
    queryFn: () => facultiesApi.getAll({ page, search, showDeleted }),
  });

  const faculties = Array.isArray(data?.data) ? data.data : data?.data?.data || [];
  const meta = data?.meta || data?.data?.meta;

  const createMutation = useMutation({
    mutationFn: facultiesApi.create,
    onSuccess: () => {
      qc.invalidateQueries(["faculties"]);
      toast.success("Faculty created");
      setModal(false);
    },
    onError: (e) => toast.error(e.message || "Failed to create"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => facultiesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["faculties"]);
      toast.success("Faculty updated");
      setModal(false);
    },
    onError: (e) => toast.error(e.message || "Failed to update"),
  });

  const deleteMutation = useMutation({
    mutationFn: facultiesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries(["faculties"]);
      toast.success("Faculty deleted");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message || "Failed to delete"),
  });

  const set = useCallback((key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value })), []);

  const generateYears = (count) => {
    const years = [];
    for (let i = 1; i <= count; i++) {
      years.push({
        year: i,
        name: `Year ${i}`,
        semesters: [
          { number: 1, name: "Fall" },
          { number: 2, name: "Spring" },
          { number: 3, name: "Summer" },
        ],
      });
    }
    return years;
  };

  const handleYearCountChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setYearCount(count);
    setForm((p) => ({ ...p, years: generateYears(count) }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setYearCount(1);
    setEditTarget(null);
    setModal(true);
  };

  const openEdit = (f) => {
    setForm({
      code: f.code || "",
      name: f.name || "",
      description: f.description || "",
      years: f.years || EMPTY_FORM.years,
      status: f.status || "active",
    });
    setYearCount(f.years?.length || 1);
    setEditTarget(f);
    setModal(true);
  };

  const handleSave = () => {
    if (!form.code?.trim()) return toast.error("Faculty code is required");
    if (!form.name?.trim()) return toast.error("Faculty name is required");
    const payload = {
      ...form,
      code: form.code.toUpperCase(),
    };
    if (editTarget)
      updateMutation.mutate({ id: editTarget._id, data: payload });
    else createMutation.mutate(payload);
  };

  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage],
  );

  const handleCloseModal = useCallback(() => {
    setModal(false);
  }, []);

  const COLUMNS = [
    {
      key: "code",
      label: "Code",
      render: (f) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] text-[var(--text-sm)] font-bold flex items-center justify-center">
            {f.code}
          </div>
          <div>
            <span className="font-medium text-[var(--color-text)] block">{f.name}</span>
            <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">{f.years?.length || 0} years</span>
          </div>
          {f.isDeleted && <Badge variant="red">Deleted</Badge>}
        </div>
      ),
    },
    {
      key: "years",
      label: "Structure",
      render: (f) => (
        <span className="text-[var(--text-xs)] text-[var(--color-text-3)]">
          {f.years?.length || 0} years × {f.years?.[0]?.semesters?.length || 0} semesters
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (f) => <Badge variant={statusBadge(f.status)}>{f.status}</Badge>,
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (f) => (
        <div className="flex items-center gap-2 justify-end">
          {f.isDeleted ? (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => deleteMutation.mutate(f._id)}
            >
              Restore
            </Button>
          ) : (
            <>
              <Button size="xs" variant="secondary" onClick={() => openEdit(f)}>
                Edit
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => setDeleteTarget(f)}
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
              Faculty Management
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Manage faculties and their academic structure (years & semesters).
            </p>
          </div>
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold border transition-colors ${
              showDeleted
                ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)] border-opacity-30"
                : "bg-[var(--color-surface-2)] border-[var(--color-border-2)] text-[var(--color-text-3)] hover:text-[var(--color-text)]"
            }`}
          >
            {showDeleted ? "Hide Deleted" : "Show Deleted"}
          </button>
        </div>

        <DataTable
          title="Faculties"
          data={faculties}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={openAdd}
          addLabel="Add Faculty"
          emptyIcon="🏛️"
          emptyTitle="No faculties found"
        />
      </div>

      <Modal
        open={modal}
        onClose={handleCloseModal}
        title={editTarget ? "Edit Faculty" : "Add New Faculty"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? "Save Changes" : "Add Faculty"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Faculty Code"
              required
              value={form.code}
              onChange={set("code")}
              placeholder="ENG"
            />
            <Input
              label="Faculty Name"
              required
              value={form.name}
              onChange={set("name")}
              placeholder="Faculty of Engineering"
            />
          </div>
          <Input
            label="Description"
            value={form.description}
            onChange={set("description")}
            placeholder="Brief description..."
          />
          <div>
            <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
              Number of Years
            </label>
            <Input
              type="number"
              value={yearCount}
              onChange={handleYearCountChange}
              min={1}
              max={7}
            />
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-1">
              Generates {yearCount} year(s) with 3 semesters each (Fall, Spring, Summer)
            </p>
          </div>
          <div>
            <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
              Status
            </label>
            <select
              value={form.status}
              onChange={set("status")}
              className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Faculty"
        message={`Delete "${deleteTarget?.name}" (${deleteTarget?.code})? It can be restored later.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
