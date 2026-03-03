import { useState } from "react";
import CollegeForm from "../../components/admin/CollegeForm";

let nextId = 5;

const INITIAL = [
  { id: 1, name: "Global Tech University", year: "2024-25", semester: "Semester 1", students: "4,210", email: "admin@globaltech.edu", status: "active" },
  { id: 2, name: "North Arts Academy",     year: "2024-25", semester: "Semester 2", students: "1,850", email: "admin@northarts.edu",  status: "active" },
  { id: 3, name: "East Medical School",    year: "2024-25", semester: "Semester 2", students: "920",   email: "admin@eastmed.edu",    status: "maintenance" },
  { id: 4, name: "South Business School",  year: "2024-25", semester: "Semester 1", students: "2,400", email: "admin@southbiz.edu",   status: "active" },
];

function Colleges({ modalOpen, onCloseModal }) {
  const [colleges, setColleges] = useState(INITIAL);
  const [edit, setEdit] = useState(null);
  const [localModal, setLocalModal] = useState(false);

  const isOpen = modalOpen || localModal;

  const openEdit = (college) => {
    setEdit(college);
    setLocalModal(true);
  };

  const closeModal = () => {
    setEdit(null);
    setLocalModal(false);
    if (onCloseModal) onCloseModal();
  };

  const handleSubmit = (form) => {
    if (edit) {
      setColleges(colleges.map((c) => c.id === edit.id ? { ...c, ...form } : c));
    } else {
      setColleges([...colleges, { ...form, id: nextId++, students: "0", status: "active" }]);
    }
    closeModal();
  };

  const deleteCollege = (id) => {
    setColleges(colleges.filter((c) => c.id !== id));
  };

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <h2>Colleges</h2>
        <p>Manage all registered institutions and their configurations.</p>
      </div>

      {/* Table Card */}
      <div className="card">
        <div className="card-header">
          <h4>Institution Management</h4>
          <div className="card-actions">
            <button className="btn-outline">Filter</button>
            <button className="btn-outline">Export</button>
            <button className="btn-primary" onClick={() => { setEdit(null); setLocalModal(true); }}>
              <span className="material-symbols-outlined sm">add</span>
              New College
            </button>
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>College Name</th>
                <th>Year/Sem</th>
                <th>Students</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {colleges.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: "center", color: "var(--slate-400)", padding: "40px" }}>
                    No colleges added yet.
                  </td>
                </tr>
              ) : (
                colleges.map((c) => (
                  <tr key={c.id}>
                    <td className="td-name">{c.name}</td>
                    <td className="td-muted">{`${c.year}, ${c.semester}`}</td>
                    <td className="td-muted">{c.students}</td>
                    <td>
                      <span className={`status-badge ${c.status}`}>
                        {c.status === "active" ? "Active" : "Maintenance"}
                      </span>
                    </td>
                    <td className="td-right">
                      <button className="btn-icon" onClick={() => openEdit(c)} title="Edit">
                        <span className="material-symbols-outlined">edit</span>
                      </button>
                      <button className="btn-icon danger" onClick={() => deleteCollege(c.id)} title="Delete">
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="card-footer">
          <span>Showing {colleges.length} institution{colleges.length !== 1 ? "s" : ""}</span>
          <div className="pagination">
            <button>Previous</button>
            <button>Next</button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <div className={`modal-overlay ${isOpen ? "open" : ""}`} onClick={(e) => e.target === e.currentTarget && closeModal()}>
        <div className="modal">
          <CollegeForm onSubmit={handleSubmit} edit={edit} onClose={closeModal} />
        </div>
      </div>
    </>
  );
}

export default Colleges;
