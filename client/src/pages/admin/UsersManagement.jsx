import { useState } from "react";
import Modal from "../../components/admin/Modal";
import { tw, Badge, FormGroup, PageHeader, TableWrap, EmptyState } from "../../components/admin/adminUtils";

const INIT_USERS = [
  { id: 1, name: "Sara Ahmed",    email: "sara@eduhub.com",   role: "Student", college: "Faculty of Science",     joined: "2025-09-01", status: "Active"  },
  { id: 2, name: "Omar Khalid",   email: "omar@eduhub.com",   role: "Student", college: "Faculty of Engineering", joined: "2025-09-01", status: "Active"  },
  { id: 3, name: "Dr. Mona Salem",email: "mona@eduhub.com",   role: "Mentor",  college: "Faculty of Science",     joined: "2024-01-15", status: "Active"  },
  { id: 4, name: "Karim Ali",     email: "karim@eduhub.com",  role: "Student", college: "Faculty of Business",    joined: "2025-09-01", status: "Pending" },
  { id: 5, name: "Dr. Tarek N.", email: "tarek@eduhub.com",  role: "Mentor",  college: "Faculty of Engineering", joined: "2023-08-20", status: "Active"  },
  { id: 6, name: "Layla Hassan",  email: "layla@eduhub.com",  role: "Admin",   college: "—",                      joined: "2023-01-10", status: "Active"  },
];

const EMPTY = { name: "", email: "", role: "Student", college: "", joined: "", status: "Active" };

const ROLE_VARIANT  = { Student: "blue", Mentor: "success", Admin: "warning" };
const AVATAR_COLORS = [
  "bg-[var(--accent-glow)] text-accent-light",
  "bg-success-bg text-success",
  "bg-warning-bg text-warning",
  "bg-[rgba(139,92,246,0.15)] text-purple-400",
];

function UsersManagement() {
  const [users,      setUsers]      = useState(INIT_USERS);
  const [search,     setSearch]     = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd    = ()   => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (u)  => { setForm(u); setEditId(u.id); setModal(true); };
  const closeModal = ()   => setModal(false);
  const set        = (k,v)=> setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editId) {
      setUsers((p) => p.map((u) => u.id === editId ? { ...form, id: editId } : u));
    } else {
      setUsers((p) => [...p, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setUsers((p) => p.filter((u) => u.id !== id));

  const statusVariant = (s) => s === "Active" ? "success" : s === "Pending" ? "warning" : "default";

  return (
    <div>
      <PageHeader
        title="Users Management"
        subtitle="Manage students, mentors and administrators."
        actions={
          <div className="flex items-center gap-2">
            {["All", "Student", "Mentor", "Admin"].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer active:scale-[0.97] ` +
                  (roleFilter === r
                    ? "bg-accent border-accent text-white shadow-xs"
                    : "bg-card border-border text-text-secondary hover:bg-hover hover:text-text-primary hover:border-text-muted")}
              >
                {r}
              </button>
            ))}
            <button className={tw.btnPrimary} onClick={openAdd}>
              <span className="material-symbols-outlined text-[14px]">add</span>
              Add User
            </button>
          </div>
        }
      />

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold text-text-primary">Users ({filtered.length})</span>
            <input
              className="bg-card border border-border text-text-primary px-3 py-[6px] rounded-sm text-[12.5px] w-[220px] outline-none placeholder:text-text-muted transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(36,99,235,0.15)]"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="👥" title="No users found" description="Try a different filter or add a new user." />
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-card">
              <tr>
                <th className={tw.th}>User</th>
                <th className={tw.th}>Role</th>
                <th className={tw.th}>College</th>
                <th className={tw.th}>Joined</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id} className={tw.trHover}>
                  <td className={tw.td}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border ${AVATAR_COLORS[i % AVATAR_COLORS.length]} border-[rgba(255,255,255,0.08)]`}>
                        {u.name[0]}
                      </div>
                      <div>
                        <div className="text-[13.5px] font-medium text-text-primary">{u.name}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className={tw.td}><Badge variant={ROLE_VARIANT[u.role] || "default"}>{u.role}</Badge></td>
                  <td className={tw.td + " !text-text-secondary !text-[13px]"}>{u.college}</td>
                  <td className={tw.td}>
                    <span className="font-mono text-[12px] text-text-muted">{u.joined}</span>
                  </td>
                  <td className={tw.td}><Badge variant={statusVariant(u.status)}>{u.status}</Badge></td>
                  <td className={tw.td}>
                    <div className="flex items-center gap-2 justify-end">
                      <button className={tw.btnSecondary + " " + tw.btnSm} onClick={() => openEdit(u)}>Edit</button>
                      <button className={tw.btnDanger    + " " + tw.btnSm} onClick={() => handleDelete(u.id)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
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
              <button className={tw.btnSecondary} onClick={closeModal}>Cancel</button>
              <button className={tw.btnPrimary}   onClick={handleSave}>
                {editId ? "Save Changes" : "Add User"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Full Name">
                <input className={tw.formInput} placeholder="Full name"
                  value={form.name} onChange={(e) => set("name", e.target.value)} />
              </FormGroup>
              <FormGroup label="Role">
                <div className="relative">
                  <select className={tw.formSelect} value={form.role} onChange={(e) => set("role", e.target.value)}>
                    <option>Student</option><option>Mentor</option><option>Admin</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">▼</span>
                </div>
              </FormGroup>
            </div>
            <FormGroup label="Email">
              <input className={tw.formInput} type="email" placeholder="user@eduhub.com"
                value={form.email} onChange={(e) => set("email", e.target.value)} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="College">
                <input className={tw.formInput} placeholder="Faculty of..."
                  value={form.college} onChange={(e) => set("college", e.target.value)} />
              </FormGroup>
              <FormGroup label="Status">
                <div className="relative">
                  <select className={tw.formSelect} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option>Active</option><option>Pending</option><option>Suspended</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">▼</span>
                </div>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UsersManagement;