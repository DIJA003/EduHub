import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../../../lib/api/users.api";
import { usePagination } from "../../../hooks/usePagination";
import { toast } from "../../../hooks/useToasts";
import DataTable from "./DataTable";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import Input from "../../../components/ui/Input";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { formatDate, initials } from "../../../lib/utils";

const EMPTY_FORM = {
  name: "",
  email: "",
  password: "",
  role: "student",
  college: "",
  status: "Active",
};

export default function UsersPage() {
  const { page, limit, setPage } = usePagination();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: [
      "admin-users",
      { page, limit, search, role: roleFilter, showDeleted },
    ],
    queryFn: () =>
      usersApi
        .getAll({ page, limit, search, role: roleFilter, showDeleted })
        .then((r) => r.data),
  });
  const users = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const createMutation = useMutation({
    mutationFn: usersApi.create,
    onSuccess: () => {
      qc.invalidateQueries(["admin-users"]);
      toast.success("User created");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries(["admin-users"]);
      toast.success("User updated");
      setModal(false);
    },
    onError: (e) => toast.error(e.message),
  });
  const deleteMutation = useMutation({
    mutationFn: usersApi.remove,
    onSuccess: () => {
      qc.invalidateQueries(["admin-users"]);
      toast.success("User removed");
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.message),
  });
  const restoreMutation = useMutation({
    mutationFn: usersApi.restore,
    onSuccess: () => {
      qc.invalidateQueries(["admin-users"]);
      toast.success("User restored");
    },
    onError: (e) => toast.error(e.message),
  });

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditTarget(null);
    setModal(true);
  };
  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      role: u.role,
      college: u.college || "",
      status: u.status,
      password: "",
    });
    setEditTarget(u);
    setModal(true);
  };
  const handleSave = () => {
    if (!form.name?.trim() || !form.email?.trim())
      return toast.error("Name and email are required");
    if (!editTarget && (!form.password || form.password.length < 8))
      return toast.error("Password must be at least 8 characters");
    if (editTarget)
      updateMutation.mutate({
        id: editTarget._id,
        data: {
          name: form.name,
          role: form.role,
          college: form.college,
          status: form.status,
        },
      });
    else createMutation.mutate(form);
  };

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
      key: "name",
      label: "User",
      render: (u) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[var(--color-accent)] text-white text-[var(--text-xs)] font-bold flex items-center justify-center shrink-0">
            {initials(u.name)}
          </div>
          <div>
            <p className="font-medium text-[var(--color-text)]">{u.name}</p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              {u.email}
            </p>
          </div>
          {u.isDeleted && <Badge variant="red">Removed</Badge>}
        </div>
      ),
    },
    {
      key: "role",
      label: "Role",
      render: (u) => (
        <Badge
          variant={
            u.role === "admin"
              ? "yellow"
              : u.role === "mentor"
                ? "green"
                : "blue"
          }
          className="capitalize"
        >
          {u.role}
        </Badge>
      ),
    },
    {
      key: "college",
      label: "College",
      render: (u) => (
        <span className="text-[var(--color-text-3)] text-[var(--text-xs)]">
          {u.college || "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (u) => <Badge variant={statusBadge(u.status)}>{u.status}</Badge>,
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (u) => (
        <span className="text-[var(--color-text-3)] text-[var(--text-xs)]">
          {formatDate(u.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      width: "120px",
      render: (u) => (
        <div className="flex items-center gap-2 justify-end">
          {u.isDeleted ? (
            <Button
              size="xs"
              variant="secondary"
              onClick={() => restoreMutation.mutate(u._id)}
            >
              Restore
            </Button>
          ) : (
            <>
              <Button size="xs" variant="secondary" onClick={() => openEdit(u)}>
                Edit
              </Button>
              <Button
                size="xs"
                variant="danger"
                onClick={() => setDeleteTarget(u)}
              >
                Remove
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const selectClass =
    "w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]";

  return (
    <>
      <div className="space-y-4 animate-fade-up">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
              Users Management
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Manage students, mentors, and administrators.
            </p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["all", "student", "mentor", "admin"].map((r) => (
            <button
              key={r}
              onClick={() => {
                setRoleFilter(r);
                setPage(1);
              }}
              className={filterBtnClass(roleFilter === r)}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => setShowDeleted((v) => !v)}
            className={`px-3 py-1.5 rounded-[var(--radius-md)] text-[var(--text-xs)] font-semibold ml-auto border transition-colors ${showDeleted ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)] border-opacity-30" : "bg-[var(--color-surface-2)] border-[var(--color-border-2)] text-[var(--color-text-3)]"}`}
          >
            {showDeleted ? "Hide Removed" : "Show Removed"}
          </button>
        </div>
        <DataTable
          title="All Users"
          data={users}
          columns={COLUMNS}
          loading={isLoading}
          meta={meta}
          page={page}
          onPage={setPage}
          onSearch={handleSearch}
          onAdd={openAdd}
          addLabel="Add User"
          emptyIcon="👥"
          emptyTitle="No users found"
          emptyDescription="Try a different filter or add a new user."
        />
      </div>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title={editTarget ? "Edit User" : "Add New User"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {editTarget ? "Save Changes" : "Create User"}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Full Name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="Jane Smith"
            />
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Role <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((p) => ({ ...p, role: e.target.value }))
                }
                className={selectClass}
              >
                <option value="student">Student</option>
                <option value="mentor">Mentor</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <Input
            label="Email Address"
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
            placeholder="jane@university.edu"
            disabled={!!editTarget}
          />
          {!editTarget && (
            <Input
              label="Password"
              required
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm((p) => ({ ...p, password: e.target.value }))
              }
              placeholder="Min 8 characters"
            />
          )}
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="College / Faculty"
              value={form.college}
              onChange={(e) =>
                setForm((p) => ({ ...p, college: e.target.value }))
              }
              placeholder="Faculty of Science"
            />
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((p) => ({ ...p, status: e.target.value }))
                }
                className={selectClass}
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Suspended</option>
              </select>
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove User"
        message={`Remove "${deleteTarget?.name}"? They can be restored later.`}
        confirmLabel="Remove"
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
