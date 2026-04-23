import { useState, useEffect } from "react";
import Modal from "../../components/admin/Modal";
import { useConfirm } from "../../hooks/useConfirm";
import {
  Badge,
  FormGroup,
  FormInput,
  FormSelect,
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
  tw,
} from "../../components/admin/adminUtils";
import { adminUsersApi } from "../../services/api";

const EMPTY = {
  name: "",
  email: "",
  role: "Student",
  college: "",
  status: "Active",
  password: "",
};

const ROLE_VARIANT = { Student: "blue", Mentor: "success", Admin: "warning" };

const AVATAR_STYLES = [
  { bg: "var(--accent-glow)", color: "var(--accent-light)" },
  { bg: "var(--success-bg)", color: "var(--success)" },
  { bg: "var(--warning-bg)", color: "var(--warning)" },
  { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
];

function UsersManagement() {
  const { confirmDialog, confirm } = useConfirm();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUsers();
  }, [showDeleted]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await adminUsersApi.getAll(showDeleted);
      setUsers(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = users.filter(
    (u) =>
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase())) &&
      (roleFilter === "All" || u.role === roleFilter),
  );

  const openEdit = (u) => {
    setForm(u);
    setEditId(u._id);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSaving(false);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name?.trim() || !form.email?.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await adminUsersApi.update(editId, form);
        setUsers((p) =>
          p.map((u) => (u._id === editId ? { ...u, ...res.data } : u)),
        );
      } else {
        const res = await adminUsersApi.create(form);
        setUsers((p) => [res.data, ...p]);
      }
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm(
      "This will mark the user as removed. You can restore them later.",
      "Remove User",
    );
    if (!ok) return;
    try {
      await adminUsersApi.remove(id);
      setUsers((p) =>
        showDeleted
          ? p.map((u) =>
              u._id === id
                ? { ...u, isDeleted: true, deletedAt: new Date() }
                : u,
            )
          : p.filter((u) => u._id !== id),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await adminUsersApi.restore(id);
      if (showDeleted) {
        setUsers((p) =>
          p.map((u) =>
            u._id === id ? { ...u, isDeleted: false, deletedAt: null } : u,
          ),
        );
      } else {
        setUsers((p) => [...p, res.data]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const statusVariant = (s) =>
    s === "Active" ? "success" : s === "Pending" ? "warning" : "default";

  const TH = ({ children }) => (
    <th
      className={tw.th}
      style={{ color: "var(--text-muted)", borderBottomColor: "var(--border)" }}
    >
      {children}
    </th>
  );

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Users Management"
        subtitle="Manage students, mentors and administrators."
        actions={
          <div className="flex items-center gap-2 flex-wrap">
            <BtnPrimary
              onClick={() => {
                setForm(EMPTY);
                setEditId(null);
                setModal(true);
              }}
            >
              <span className="material-symbols-outlined text-[14px]">
                person_add
              </span>
              Add User
            </BtnPrimary>
            {["All", "Student", "Mentor", "Admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97]"
                style={
                  roleFilter === r
                    ? {
                        background: "var(--accent)",
                        borderColor: "var(--accent)",
                        color: "#fff",
                      }
                    : {
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
                onMouseEnter={(e) => {
                  if (roleFilter !== r) {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (roleFilter !== r) {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
              >
                {r}
              </button>
            ))}
          </div>
        }
      />

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={loadUsers}>
            Retry
          </button>
        </div>
      )}

      <TableWrap
        toolbar={
          <>
            <span
              className="text-[13.5px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              Users ({filtered.length})
              {showDeleted && (
                <span
                  className="ml-2 text-[11px] font-normal"
                  style={{ color: "var(--text-muted)" }}
                >
                  — including removed
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleted((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-[6px] rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer"
                style={
                  showDeleted
                    ? {
                        background: "var(--danger-bg)",
                        borderColor: "var(--danger)",
                        color: "var(--danger)",
                      }
                    : {
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                <span className="material-symbols-outlined text-[14px]">
                  {showDeleted ? "visibility_off" : "visibility"}
                </span>
                {showDeleted ? "Hide Removed" : "Show Removed"}
              </button>
              <TableSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
              />
            </div>
          </>
        }
      >
        {loading ? (
          <div
            className="flex items-center justify-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="material-symbols-outlined animate-spin mr-2">
              progress_activity
            </span>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No users found"
            description="Try a different filter."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                <TH>User</TH>
                <TH>Role</TH>
                <TH>College</TH>
                <TH>Joined</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const av = AVATAR_STYLES[i % AVATAR_STYLES.length];
                const deleted = u.isDeleted;
                return (
                  <tr
                    key={u._id}
                    className={tw.trHover}
                    style={{
                      opacity: deleted ? 0.6 : 1,
                      background: deleted ? "var(--danger-bg)" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = deleted
                        ? "var(--danger-bg)"
                        : "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = deleted
                        ? "var(--danger-bg)"
                        : "transparent")
                    }
                  >
                    {/* User */}
                    <td
                      className={tw.td}
                      style={{ borderBottomColor: "var(--border-light)" }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{
                            background: av.bg,
                            color: av.color,
                            border: "1.5px solid var(--border)",
                          }}
                        >
                          {u.name?.[0] || "?"}
                        </div>
                        <div>
                          <div
                            className="text-[13.5px] font-medium flex items-center gap-2 flex-wrap"
                            style={{ color: "var(--text-primary)" }}
                          >
                            {u.name}
                            {deleted && (
                              <span
                                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                                style={{
                                  background: "var(--danger-bg)",
                                  color: "var(--danger)",
                                  border: "1px solid var(--danger)",
                                }}
                              >
                                <span className="material-symbols-outlined text-[10px]">
                                  person_off
                                </span>
                                Removed
                              </span>
                            )}
                          </div>
                          <div
                            className="text-[11px] mt-0.5"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {u.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td
                      className={tw.td}
                      style={{ borderBottomColor: "var(--border-light)" }}
                    >
                      <Badge variant={ROLE_VARIANT[u.role] || "default"}>
                        {u.role}
                      </Badge>
                    </td>

                    {/* College */}
                    <td
                      className={tw.td}
                      style={{
                        borderBottomColor: "var(--border-light)",
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
                      {u.college}
                    </td>

                    {/* Joined */}
                    <td
                      className={tw.td}
                      style={{ borderBottomColor: "var(--border-light)" }}
                    >
                      <span
                        className="font-mono text-[12px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {u.joined}
                      </span>
                    </td>

                    {/* Status */}
                    <td
                      className={tw.td}
                      style={{ borderBottomColor: "var(--border-light)" }}
                    >
                      <Badge variant={statusVariant(u.status)}>
                        {u.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td
                      className={tw.td}
                      style={{ borderBottomColor: "var(--border-light)" }}
                    >
                      <div className="flex items-center gap-2 justify-end">
                        {deleted ? (
                          <BtnSecondary
                            className={tw.btnSm}
                            onClick={() => handleRestore(u._id)}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              person_add
                            </span>
                            Restore
                          </BtnSecondary>
                        ) : (
                          <>
                            <BtnSecondary
                              className={tw.btnSm}
                              onClick={() => openEdit(u)}
                            >
                              Edit
                            </BtnSecondary>
                            <BtnDanger
                              className={tw.btnSm}
                              onClick={() => handleDelete(u._id)}
                            >
                              Remove
                            </BtnDanger>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal
          title={editId ? "Edit User" : "Add New User"}
          onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save Changes"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Full Name">
                <FormInput
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Full name"
                />
              </FormGroup>
              <FormGroup label="Role">
                <FormSelect
                  value={form.role}
                  onChange={(e) => set("role", e.target.value)}
                >
                  <option>Student</option>
                  <option>Mentor</option>
                  <option>Admin</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Email">
              <FormInput
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="user@eduhub.com"
              />
            </FormGroup>
            {!editId && (
              <FormGroup label="Password">
                <FormInput
                  type="password"
                  value={form.password || ""}
                  onChange={(e) => set("password", e.target.value)}
                  placeholder="Password (min 8 chars)"
                />
              </FormGroup>
            )}

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="College">
                <FormInput
                  value={form.college}
                  onChange={(e) => set("college", e.target.value)}
                  placeholder="Faculty of..."
                />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </FormSelect>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UsersManagement;