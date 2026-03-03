import { useState } from "react";
import Modal from "../../components/admin/Modal";

const INIT_USERS = [
  { id: 1, name: "Sara Ahmed",   email: "sara@eduhub.com",  role: "Student", college: "Faculty of Science",      joined: "2025-09-01", status: "Active" },
  { id: 2, name: "Omar Khalid",  email: "omar@eduhub.com",  role: "Student", college: "Faculty of Engineering",  joined: "2025-09-01", status: "Active" },
  { id: 3, name: "Dr. Mona Salem",email:"mona@eduhub.com",  role: "Mentor",  college: "Faculty of Science",      joined: "2024-01-15", status: "Active" },
  { id: 4, name: "Karim Ali",    email: "karim@eduhub.com", role: "Student", college: "Faculty of Business",     joined: "2025-09-01", status: "Pending" },
  { id: 5, name: "Dr. Tarek N.", email: "tarek@eduhub.com", role: "Mentor",  college: "Faculty of Engineering",  joined: "2023-08-20", status: "Active" },
  { id: 6, name: "Layla Hassan", email: "layla@eduhub.com", role: "Admin",   college: "—",                       joined: "2023-01-10", status: "Active" },
];

const EMPTY = { name: "", email: "", role: "Student", college: "", joined: "", status: "Active" };

const ROLE_BADGE = {
  Student: "badge-blue",
  Mentor:  "badge-success",
  Admin:   "badge-warning",
};

function UsersManagement() {
  const [users,    setUsers]    = useState(INIT_USERS);
  const [search,   setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const openAdd  = ()    => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (u)   => { setForm(u);     setEditId(u.id); setModal(true); };
  const closeModal = ()  => setModal(false);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim() || !form.email.trim()) return;
    if (editId) {
      setUsers((prev) => prev.map((u) => (u.id === editId ? { ...form, id: editId } : u)));
    } else {
      setUsers((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const avatarColors = ["", "green", "amber", "purple"];
  const getColor = (i) => avatarColors[i % avatarColors.length];

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Users Management</h1>
          <p>Manage students, mentors and administrators.</p>
        </div>
        <div className="page-header-actions">
          {["All", "Student", "Mentor", "Admin"].map((r) => (
            <button
              key={r}
              className={`btn btn-sm ${roleFilter === r ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setRoleFilter(r)}
            >
              {r}
            </button>
          ))}
          <button className="btn btn-primary" onClick={openAdd}>+ Add User</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span className="table-toolbar-title">Users ({filtered.length})</span>
          <input
            className="table-search"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>Try a different filter or add a new user.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>College</th>
                <th>Joined</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.id}>
                  <td>
                    <div className="user-cell">
                      <div className={`user-avatar ${getColor(i)}`}>{u.name[0]}</div>
                      <div>
                        <div className="user-cell-name">{u.name}</div>
                        <div className="user-cell-email">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span className={`badge ${ROLE_BADGE[u.role] || "badge-default"}`}>{u.role}</span></td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{u.college}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>{u.joined}</td>
                  <td>
                    <span className={`badge ${u.status === "Active" ? "badge-success" : u.status === "Pending" ? "badge-warning" : "badge-default"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}>Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(u.id)}>Remove</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modal && (
        <Modal
          title={editId ? "Edit User" : "Add New User"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>
                {editId ? "Save Changes" : "Add User"}
              </button>
            </>
          }
        >
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  placeholder="Full name"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => handleChange("role", e.target.value)}
                >
                  <option>Student</option>
                  <option>Mentor</option>
                  <option>Admin</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="user@eduhub.com"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">College</label>
                <input
                  className="form-input"
                  placeholder="Faculty of..."
                  value={form.college}
                  onChange={(e) => handleChange("college", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default UsersManagement;