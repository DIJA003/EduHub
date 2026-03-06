import { useState } from "react";
import Modal from "../../components/admin/Modal";
import { tw, Badge, FormGroup, PageHeader, TableWrap, EmptyState } from "../../components/admin/adminUtils";

const INIT_MATERIALS = [
  { id: 1, title: "React Hooks Cheatsheet",      course: "CS101",  type: "PDF",   size: "1.2 MB",  uploader: "Dr. Mona Salem",   uploaded: "2026-02-10", status: "Active"   },
  { id: 2, title: "Engineering Math - Week 3",   course: "ENG201", type: "Slides",size: "4.8 MB",  uploader: "Dr. Tarek Nasser",  uploaded: "2026-02-14", status: "Active"   },
  { id: 3, title: "Business Case Study Pack",    course: "BUS301", type: "ZIP",   size: "12 MB",   uploader: "Prof. Hana Samir",  uploaded: "2026-01-28", status: "Active"   },
  { id: 4, title: "Sorting Algorithms Video",    course: "CS302",  type: "Video", size: "220 MB",  uploader: "Dr. Yasser Fathi",  uploaded: "2026-02-20", status: "Draft"    },
  { id: 5, title: "Art History Reference Guide", course: "ART101", type: "PDF",   size: "3.1 MB",  uploader: "Dr. Nadia Hassan",  uploaded: "2026-01-15", status: "Archived" },
];

const EMPTY      = { title: "", course: "", type: "PDF", size: "", uploader: "", uploaded: "", status: "Draft" };
const TYPE_ICON  = { PDF: "📄", Slides: "📊", ZIP: "🗜️", Video: "🎬", Other: "📁" };
const statusVariant = (s) => s === "Active" ? "success" : s === "Draft" ? "warning" : "default";

function MaterialsManagement() {
  const [materials, setMaterials] = useState(INIT_MATERIALS);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);

  const filtered = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.course.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd    = ()   => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (m)  => { setForm(m); setEditId(m.id); setModal(true); };
  const closeModal = ()   => setModal(false);
  const set        = (k,v)=> setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) {
      setMaterials((p) => p.map((m) => m.id === editId ? { ...form, id: editId } : m));
    } else {
      setMaterials((p) => [...p, { ...form, id: Date.now() }]);
    }
    closeModal();
  };

  const handleDelete = (id) => setMaterials((p) => p.filter((m) => m.id !== id));

  return (
    <div>
      <PageHeader
        title="Materials Management"
        subtitle="Upload and manage course learning materials."
        actions={
          <button className={tw.btnPrimary} onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">upload</span>
            Upload Material
          </button>
        }
      />

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold text-text-primary">All Materials ({filtered.length})</span>
            <input
              className="bg-card border border-border text-text-primary px-3 py-[6px] rounded-sm text-[12.5px] w-[220px] outline-none placeholder:text-text-muted transition-all focus:border-border-focus focus:shadow-[0_0_0_3px_rgba(36,99,235,0.15)]"
              placeholder="Search materials..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📂" title="No materials found" description="Upload your first learning material." />
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-card">
              <tr>
                <th className={tw.th}>Title</th>
                <th className={tw.th}>Course</th>
                <th className={tw.th}>Type</th>
                <th className={tw.th}>Size</th>
                <th className={tw.th}>Uploaded By</th>
                <th className={tw.th}>Date</th>
                <th className={tw.th}>Status</th>
                <th className={tw.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className={tw.trHover}>
                  <td className={tw.td + " !font-medium"}>
                    <span className="mr-2">{TYPE_ICON[m.type] || "📁"}</span>{m.title}
                  </td>
                  <td className={tw.td}><Badge variant="blue" mono>{m.course}</Badge></td>
                  <td className={tw.td + " !text-text-secondary"}>{m.type}</td>
                  <td className={tw.td}>
                    <span className="font-mono text-[12px] text-text-secondary">{m.size}</span>
                  </td>
                  <td className={tw.td + " !text-text-secondary !text-[13px]"}>{m.uploader}</td>
                  <td className={tw.td}>
                    <span className="font-mono text-[12px] text-text-muted">{m.uploaded}</span>
                  </td>
                  <td className={tw.td}><Badge variant={statusVariant(m.status)}>{m.status}</Badge></td>
                  <td className={tw.td}>
                    <div className="flex items-center gap-2 justify-end">
                      <button className={tw.btnSecondary + " " + tw.btnSm} onClick={() => openEdit(m)}>Edit</button>
                      <button className={tw.btnDanger    + " " + tw.btnSm} onClick={() => handleDelete(m.id)}>Delete</button>
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
          title={editId ? "Edit Material" : "Upload New Material"}
          onClose={closeModal}
          footer={
            <>
              <button className={tw.btnSecondary} onClick={closeModal}>Cancel</button>
              <button className={tw.btnPrimary}   onClick={handleSave}>
                {editId ? "Save Changes" : "Upload"}
              </button>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="Title">
              <input className={tw.formInput} placeholder="Material title"
                value={form.title} onChange={(e) => set("title", e.target.value)} />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <input className={tw.formInput} placeholder="e.g. CS101"
                  value={form.course} onChange={(e) => set("course", e.target.value)} />
              </FormGroup>
              <FormGroup label="Type">
                <div className="relative">
                  <select className={tw.formSelect} value={form.type} onChange={(e) => set("type", e.target.value)}>
                    {["PDF", "Slides", "Video", "ZIP", "Other"].map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted text-[10px]">▼</span>
                </div>
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Uploader">
                <input className={tw.formInput} placeholder="Dr. Name"
                  value={form.uploader} onChange={(e) => set("uploader", e.target.value)} />
              </FormGroup>
              <FormGroup label="Status">
                <div className="relative">
                  <select className={tw.formSelect} value={form.status} onChange={(e) => set("status", e.target.value)}>
                    <option>Draft</option><option>Active</option><option>Archived</option>
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

export default MaterialsManagement;