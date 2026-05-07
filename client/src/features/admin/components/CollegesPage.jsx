import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { collegesApi } from "../../../lib/api/college.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";

const EMPTY_FORM = {
  name: "",
  years: 4,
  semesters: 2,
  programs: 0,
  status: "Active",
};

export default function CollegesPage() {
  const { page, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["colleges", { page, search, showDeleted }],
    queryFn: () =>
      collegesApi.getAll({ page, search, showDeleted }).then((r) => r.data),
  });

  const colleges = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const createMutation = useMutation({
    mutationFn: collegesApi.create,
    onSuccess: () => {
      qc.invalidateQueries(["colleges"]);
      toast.success("College created");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => collegesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["colleges"]);
      toast.success("College updated");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: collegesApi.remove,
    onSuccess: () => {
      qc.invalidateQueries(["colleges"]);
      toast.success("College deleted");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const restoreMutation = useMutation({
    mutationFn: collegesApi.restore,
    onSuccess: () => {
      qc.invalidateQueries(["colleges"]);
      toast.success("College restored");
    },
  });

  const set = (key) => (e) => setForm((p) => ({ ...p, [key]: e.target.value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal(true);
  };
  const openEdit = (c) => {
    setForm(c);
    setEditTarget(c);
    setModal(true);
  };

  const handleSave = () => {
    if (!form.name?.trim()) return toast.error("College name is required");
    const payload = {
      ...form,
      years: parseInt(form.years),
      semesters: parseInt(form.semesters),
      programs: parseInt(form.programs),
    };
    if (editTarget)
      updateMutation.mutate({ id: editTarget._id, data: payload });
    else createMutation.mutate(payload);
  };

  // Stable callback — won't cause DataTable to re-run its search effect
  const handleSearch = useCallback(
    (s) => {
      setSearch(s);
      setPage(1);
    },
    [setPage],
  );

  const COLUMNS = [
    {
      key: "name",
      label: "College Name",
      render: (c) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[var(--radius-md)] bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] text-[var(--text-sm)] font-bold flex items-center justify-center">
            {c.name[0]}
          </div>
          <span className="font-medium text-[var(--color-text)]">{c.name}</span>
          {c.isDeleted && <Badge variant="red">Deleted</Badge>}
        </div>
      ),
    },
    { key: "years", label: "Duration", render: (c) => `${c.years} years` },
    { key: "semesters", label: "Semesters/Year", render: (c) => c.semesters },
    { key: "programs", label: "Programs", render: (c) => c.programs },
    {
      key: "status",
      label: "Status",
      render: (c) => <Badge variant={statusBadge(c.status)}>{c.status}</Badge>,
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
              Academic Management
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Manage faculties, colleges and academic structure.
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
          title="Colleges"
          data={colleges}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={openAdd}
          addLabel="Add College"
          emptyIcon="🏫"
          emptyTitle="No colleges found"
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTarget ? "Edit College" : "Add New College"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? "Save Changes" : "Add College"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label="College Name"
            required
            value={form.name}
            onChange={set("name")}
            placeholder="Faculty of Engineering"
          />
          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Duration (Years)"
              type="number"
              value={form.years}
              onChange={set("years")}
              min={1}
              max={10}
            />
            <Input
              label="Semesters/Year"
              type="number"
              value={form.semesters}
              onChange={set("semesters")}
              min={1}
            />
            <Input
              label="Programs"
              type="number"
              value={form.programs}
              onChange={set("programs")}
              min={0}
            />
          </div>
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
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete College"
        message={`Delete "${deleteTarget?.name}"? It can be restored later.`}
        confirmLabel="Delete"
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
