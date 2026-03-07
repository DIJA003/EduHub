import { useState, useEffect } from "react";

function CollegeForm({ onSubmit, edit, onClose }) {
  const [form, setForm] = useState({
    name: "",
    year: "2024-25",
    semester: "Semester 1",
    email: "",
  });

  useEffect(() => {
    if (edit) {
      setForm({
        name:     edit.name     || "",
        year:     edit.year     || "2024-25",
        semester: edit.semester || "Semester 1",
        email:    edit.email    || "",
      });
    } else {
      setForm({ name: "", year: "2024-25", semester: "Semester 1", email: "" });
    }
  }, [edit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    setForm({ name: "", year: "2024-25", semester: "Semester 1", email: "" });
  };

  return (
    <>
      {/* Header */}
      <div className="modal-header">
        <h3>{edit ? "Edit Institution" : "Add New Institution"}</h3>
        <button className="btn-close" onClick={onClose}>
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Body */}
      <div className="modal-body">
        <div className="form-group">
          <label>College Name</label>
          <input
            type="text"
            placeholder="Enter formal name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Academic Year</label>
            <select
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            >
              <option>2023-24</option>
              <option>2024-25</option>
            </select>
          </div>
          <div className="form-group">
            <label>Current Semester</label>
            <select
              value={form.semester}
              onChange={(e) => setForm({ ...form, semester: e.target.value })}
            >
              <option>Semester 1</option>
              <option>Semester 2</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Administrator Email</label>
          <input
            type="email"
            placeholder="admin@college.edu"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="modal-footer">
        <button className="btn-cancel" type="button" onClick={onClose}>
          Cancel
        </button>
        <button className="btn-submit" type="button" onClick={handleSubmit}>
          {edit ? "Update Institution" : "Create Institution"}
        </button>
      </div>
    </>
  );
}

export default CollegeForm;
