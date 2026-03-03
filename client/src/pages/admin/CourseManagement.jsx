import { useState } from "react";
import Modal from "../../components/admin/Modal";

const INIT_COURSES = [
  { id: 1, code: "CS101", title: "Introduction to Computer Science", college: "Faculty of Science",      instructor: "Dr. Mona Salem",    students: 84, status: "Published" },
  { id: 2, code: "ENG201", title: "Engineering Mathematics II",      college: "Faculty of Engineering", instructor: "Dr. Tarek Nasser",  students: 62, status: "Published" },
  { id: 3, code: "BUS301", title: "Business Strategy",               college: "Faculty of Business",    instructor: "Prof. Hana Samir",  students: 55, status: "Draft" },
  { id: 4, code: "CS302", title: "Data Structures & Algorithms",     college: "Faculty of Science",      instructor: "Dr. Yasser Fathi",  students: 71, status: "Published" },
  { id: 5, code: "ART101", title: "History of Art",                  college: "Faculty of Arts",        instructor: "Dr. Nadia Hassan",  students: 38, status: "Archived" },
];

const EMPTY = { code: "", title: "", college: "", instructor: "", students: "", status: "Draft" };

const COLLEGES = [
  "Faculty of Engineering",
  "Faculty of Science",
  "Faculty of Business",
  "Faculty of Arts",
];

function CourseManagement() {
  const [courses,  setCourses]  = useState(INIT_COURSES);
  const [search,   setSearch]   = useState("");
  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [editId,   setEditId]   = useState(null);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd  = ()      => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit = (c)     => { setForm(c);     setEditId(c.id); setModal(true); };
  const closeModal = ()    => setModal(false);

  const handleChange = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim() || !form.code.trim()) return;
    if (editId) {
      setCourses((prev) => prev.map((c) => (c.id === editId ? { ...form, id: editId } : c)));
    } else {
      setCourses((prev) => [...prev, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setCourses((prev) => prev.filter((c) => c.id !== id));

  const statusClass = (s) =>
    s === "Published" ? "badge-success" : s === "Draft" ? "badge-warning" : "badge-default";

  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Course Management</h1>
          <p>Create and manage courses across all faculties.</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary" onClick={openAdd}>+ Add Course</button>
        </div>
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span className="table-toolbar-title">All Courses ({filtered.length})</span>
          <input
            className="table-search"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No courses found</h3>
            <p>Try a different search or add a new course.</p>
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Title</th>
                <th>College</th>
                <th>Instructor</th>
                <th>Students</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span className="badge badge-blue" style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                      {c.code}
                    </span>
                  </td>
                  <td style={{ fontWeight: 500 }}>{c.title}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{c.college}</td>
                  <td style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{c.instructor}</td>
                  <td>{c.students}</td>
                  <td><span className={`badge ${statusClass(c.status)}`}>{c.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)}>Edit</button>
                      <button className="btn btn-danger btn-sm"    onClick={() => handleDelete(c.id)}>Delete</button>
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
          title={editId ? "Edit Course" : "Add New Course"}
          onClose={closeModal}
          footer={
            <>
              <button className="btn btn-secondary" onClick={closeModal}>Cancel</button>
              <button className="btn btn-primary"   onClick={handleSave}>
                {editId ? "Save Changes" : "Add Course"}
              </button>
            </>
          }
        >
          <div className="admin-form">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Course Code</label>
                <input
                  className="form-input"
                  placeholder="e.g. CS101"
                  value={form.code}
                  onChange={(e) => handleChange("code", e.target.value)}
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
                  <option>Published</option>
                  <option>Archived</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                className="form-input"
                placeholder="e.g. Introduction to Computer Science"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">College</label>
              <select
                className="form-select"
                value={form.college}
                onChange={(e) => handleChange("college", e.target.value)}
              >
                <option value="">Select college...</option>
                {COLLEGES.map((col) => (
                  <option key={col}>{col}</option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Instructor</label>
                <input
                  className="form-input"
                  placeholder="Dr. Name"
                  value={form.instructor}
                  onChange={(e) => handleChange("instructor", e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Enrolled Students</label>
                <input
                  className="form-input"
                  type="number"
                  placeholder="0"
                  value={form.students}
                  onChange={(e) => handleChange("students", e.target.value)}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CourseManagement;