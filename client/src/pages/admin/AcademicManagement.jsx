import { useState } from "react";
import Modal from "../../components/admin/Modal";
import { tw, Badge, FormGroup, PageHeader, TableWrap, EmptyState } from "../../components/admin/adminUtils";

const INIT_DATA = [
  { id: 1, name: "Faculty of Engineering", years: 5, semesters: 2, programs: 8,  status: "Active"   },
  { id: 2, name: "Faculty of Science",     years: 4, semesters: 2, programs: 6,  status: "Active"   },
  { id: 3, name: "Faculty of Business",    years: 4, semesters: 2, programs: 5,  status: "Active"   },
  { id: 4, name: "Faculty of Arts",        years: 4, semesters: 2, programs: 7,  status: "Inactive" },
];

const EMPTY = { name: "", years: "", semesters: "", programs: "", status: "Active" };

function AcademicManagement() {
  const [colleges,  setColleges] = useState(INIT_DATA);
  const [search,    setSearch]   = useState("");
  const [modal,     setModal]    = useState(false);
  const [form,      setForm]     = useState(EMPTY);
  const [editId,    setEditId]   = useState(null);

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd    = ()    => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (col) => { setForm(col); setEditId(col.id); setModal(true); };
  const closeModal = ()    => setModal(false);
  const set        = (k,v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editId) {
      setColleges((p) => p.map((c) => c.id === editId ? { ...form, id: editId } : c));
    } else {
      setColleges((p) => [...p, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setColleges((p) => p.filter((c) => c.id !== id));

  return (
    <div>
      <PageHeader
        title="Academic Management"
        subtitle="Manage faculties, colleges and their academic structure."
        actions={
          <button className={tw.btnPrimary} onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add College
          </button>
        }
      />

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold text-text-primary">
              Colleges ({filtered.length})
            </span>
            <input
              className="bg-card border border-border text-text-primary px-3 py-[6px] rounded-sm text-[12.5px] w-[220px] outline-none placeholder:text-text-muted transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(36,99,235,0.15)]"
              placeholder="Search colleges..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="🏫" title="No colleges found" description="Try adjusting your search or add a new college." />
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-card">
              <tr>
                <th className={tw.th}>College Name</th>
                <th className={tw.th}>Duration</th>
                <th className={tw.th}>Semesters/Year</th>
                <th className={tw.th}>Programs</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((col) => (
                <tr key={col.id} className={tw.trHover}>
                  <td className={tw.td}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-sm bg-[var(--accent-glow)] text-accent-light flex items-center justify-center text-xs font-bold flex-shrink-0 border border-accent/20">
                        {col.name[0]}
                      </div>
                      <span className="font-medium text-text-primary">{col.name}</span>
                    </div>
                  </td>
                  <td className={tw.td + " !text-text-secondary"}>{col.years} years</td>
                  <td className={tw.td + " !text-text-secondary"}>{col.semesters}</td>
                  <td className={tw.td}>{col.programs}</td>
                  <td className={tw.td}>
                    <Badge variant={col.status === "Active" ? "success" : "default"}>
                      {col.status}
                    </Badge>
                  </td>
                  <td className={tw.td}>
                    <div className="flex items-center gap-2 justify-end">
                      <button className={tw.btnSecondary + " " + tw.btnSm} onClick={() => openEdit(col)}>Edit</button>
                      <button className={tw.btnDanger    + " " + tw.btnSm} onClick={() => handleDelete(col.id)}>Delete</button>
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
          title={editId ? "Edit College" : "Add New College"}
          onClose={closeModal}
          footer={
            <>
              <button className={tw.btnSecondary} onClick={closeModal}>Cancel</button>
              <button className={tw.btnPrimary}   onClick={handleSave}>
                {editId ? "Save Changes" : "Add College"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="College Name">
              <input className={tw.formInput} placeholder="e.g. Faculty of Engineering"
                value={form.name} onChange={(e) => set("name", e.target.value)} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Duration (Years)">
                <input className={tw.formInput} type="number" placeholder="4"
                  value={form.years} onChange={(e) => set("years", e.target.value)} />
              </FormGroup>
              <FormGroup label="Semesters / Year">
                <input className={tw.formInput} type="number" placeholder="2"
                  value={form.semesters} onChange={(e) => set("semesters", e.target.value)} />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Programs Count">
                <input className={tw.formInput} type="number" placeholder="6"
                  value={form.programs} onChange={(e) => set("programs", e.target.value)} />
              </FormGroup>
              <FormGroup label="Status">
                <div className="relative">
                  <select className={tw.formSelect} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option>Active</option>
                    <option>Inactive</option>
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

export default AcademicManagement;