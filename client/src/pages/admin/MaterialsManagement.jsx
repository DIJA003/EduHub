import { useState } from "react";
import Modal from "../../components/admin/Modal";

const INIT_MATERIALS = [
  { id: 1, title: "React Hooks Cheatsheet",       course: "CS101",  type: "PDF",   size: "1.2 MB", uploader: "Dr. Mona Salem",  uploaded: "2026-02-10", status: "Active" },
  { id: 2, title: "Engineering Math - Week 3",    course: "ENG201", type: "Slides",size: "4.8 MB", uploader: "Dr. Tarek Nasser","uploaded": "2026-02-14", status: "Active" },
  { id: 3, title: "Business Case Study Pack",     course: "BUS301", type: "ZIP",   size: "12 MB",  uploader: "Prof. Hana Samir", uploaded: "2026-01-28", status: "Active" },
  { id: 4, title: "Sorting Algorithms Video",     course: "CS302",  type: "Video", size: "220 MB", uploader: "Dr. Yasser Fathi", uploaded: "2026-02-20", status: "Draft" },
  { id: 5, title: "Art History Reference Guide",  course: "ART101", type: "PDF",   size: "3.1 MB", uploader: "Dr. Nadia Hassan","uploaded": "2026-01-15", status: "Archived" },
];

const EMPTY = { title: "", course: "", type: "PDF", size: "", uploader: "", uploaded: "", status: "Draft" };

const TYPE_ICON = { PDF: "📄", Slides: "📊", ZIP: "🗜️", Video: "🎬", Other: "📁" };

function MaterialsManagement() {
  const [materials,  setMaterials]  = useState(INIT_MATERIALS);
  const [search,     setSearch]     = useState("");
  const [modal,      setModal]      = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [editId,     setEditId]     = useState(null);

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.course.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = ()    => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (m)   => { setForm(m);     setEditId(m.id); setModal(true); };
  const closeModal = ()  => setModal(false);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setMaterials((prev) => prev.map((m) => (m.id === editId ? { ...form, id: editId } : m)));
    } else {
      setMaterials((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setMaterials((prev) => prev.filter((m) => m.id !== id));

  const statusClass = (s) =>
    s === "Active" ? "badge-success" : s === "Draft" ? "badge-warning" : "badge-default";

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Materials Management</h1>
          <p>Upload and manage course learning materials.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Upload Material</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span className="table-toolbar-title">All Materials ({filtered.length})</span>
          <input
            className="table-search"
            placeholder="Search materials..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>No materials found</h3>
            <p>Upload your first learning material.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Type</th>
                <th>Size</th>
                <th>Uploaded By</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td style={{ fontWeight: 500 }}>
                    {TYPE_ICON[m.type] || "📁"} {m.title}
                  </td>
                  <td>
                    <span className="badge badge-blue" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {m.course}
                    </span>
                  </td>
                  <td style={{ color: "var(--text-secondary)" }}>{m.type}</td>
                  <td style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: "12px" }}>{m.size}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{m.uploader}</td>
                  <td style={{ color: "var(--text-muted)", fontSize: "12px" }}>{m.uploaded}</td>
                  <td><span className={`badge ${statusClass(m.status)}`}>{m.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(m)}>Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(m.id)}>Delete</button>
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
          title={editId ? "Edit Material" : "Upload New Material"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>
                {editId ? "Save Changes" : "Upload"}
              </button>
            </>
          }
        >
          <div className="admin-form">
            <div className="form-group">
              <label className="form-label">Title</label>
              <input
                className="form-input"
                placeholder="Material title"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. CS101"
                  value={form.course}
                  onChange={(e) => handleChange("course", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
                >
                  {["PDF", "Slides", "Video", "ZIP", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Uploader</label>
                <input
                  className="form-input"
                  placeholder="Dr. Name"
                  value={form.uploader}
                  onChange={(e) => handleChange("uploader", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => handleChange("status", e.target.value)}
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MaterialsManagement;