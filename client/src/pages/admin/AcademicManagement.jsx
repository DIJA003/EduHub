import { useState } from "react";
import Modal from "../../components/admin/Modal";

const INIT_DATA = [
  { id: 1, name: "Faculty of Engineering",    years: 5, semesters: 2, programs: 8,  status: "Active" },
  { id: 2, name: "Faculty of Science",        years: 4, semesters: 2, programs: 6,  status: "Active" },
  { id: 3, name: "Faculty of Business",       years: 4, semesters: 2, programs: 5,  status: "Active" },
  { id: 4, name: "Faculty of Arts",           years: 4, semesters: 2, programs: 7,  status: "Inactive" },
];

const EMPTY = { name: "", years: "", semesters: "", programs: "", status: "Active" };

function AcademicManagement() {
  const [colleges, setColleges]   = useState(INIT_DATA);
  const [search,   setSearch]     = useState("");
  const [modal,    setModal]      = useState(false);
  const [form,     setForm]       = useState(EMPTY);
  const [editId,   setEditId]     = useState(null);

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = ()           => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (col)        => { setForm(col);   setEditId(col.id); setModal(true); };
  const closeModal = ()         => setModal(false);

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setColleges((prev) => prev.map((c) => (c.id === editId ? { ...form, id: editId } : c)));
    } else {
      setColleges((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setColleges((prev) => prev.filter((c) => c.id !== id));

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Academic Management</h1>
          <p>Manage faculties, colleges and their academic structure.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Add College</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span className="table-toolbar-title">Colleges ({filtered.length})</span>
          <input
            className="table-search"
            placeholder="Search colleges..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏫</div>
            <h3>No colleges found</h3>
            <p>Try adjusting your search or add a new college.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>College Name</th>
                <th>Duration</th>
                <th>Semesters/Year</th>
                <th>Programs</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((col) => (
                <tr key={col.id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar" style={{ borderRadius: "6px", background: "var(--accent-glow)", color: "var(--accent-light)" }}>
                        {col.name[0]}
                      </div>
                      <span className="user-cell-name">{col.name}</span>
                    </div>
                  </td>
                  <td>{col.years} years</td>
                  <td>{col.semesters}</td>
                  <td>{col.programs}</td>
                  <td>
                    <span className={`badge ${col.status === "Active" ? "badge-success" : "badge-default"}`}>
                      {col.status}
                    </span>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(col)}>Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(col.id)}>Delete</button>
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
          title={editId ? "Edit College" : "Add New College"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>
                {editId ? "Save Changes" : "Add College"}
              </button>
            </>
          }
        >
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">College Name</label>
              <input
                className="form-input"
                placeholder="e.g. Faculty of Engineering"
                value={form.name}
                onChange={(e) => handleChange("name", e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Duration (Years)</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="4"
                  value={form.years}
                  onChange={(e) => handleChange("years", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Semesters / Year</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="2"
                  value={form.semesters}
                  onChange={(e) => handleChange("semesters", e.target.value)}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Programs Count</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="6"
                  value={form.programs}
                  onChange={(e) => handleChange("programs", e.target.value)}
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
                  <option>Inactive</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AcademicManagement;