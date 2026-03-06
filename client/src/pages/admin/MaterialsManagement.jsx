import { useState } from "react";
import Modal from "../../components/admin/Modal";
import {
  Badge, FormGroup, FormInput, FormSelect,
  PageHeader, TableWrap, TableSearch, EmptyState,
  BtnPrimary, BtnSecondary, BtnDanger, tw
} from "../../components/admin/adminUtils";

const INIT_MATERIALS = [
  { id: 1, title: "React Hooks Cheatsheet",      course: "CS101",  type: "PDF",   size: "1.2 MB",  uploader: "Dr. Mona Salem",  uploaded: "2026-02-10", status: "Active"   },
  { id: 2, title: "Engineering Math - Week 3",   course: "ENG201", type: "Slides",size: "4.8 MB",  uploader: "Dr. Tarek Nasser", uploaded: "2026-02-14", status: "Active"   },
  { id: 3, title: "Business Case Study Pack",    course: "BUS301", type: "ZIP",   size: "12 MB",   uploader: "Prof. Hana Samir", uploaded: "2026-01-28", status: "Active"   },
  { id: 4, title: "Sorting Algorithms Video",    course: "CS302",  type: "Video", size: "220 MB",  uploader: "Dr. Yasser Fathi", uploaded: "2026-02-20", status: "Draft"    },
  { id: 5, title: "Art History Reference Guide", course: "ART101", type: "PDF",   size: "3.1 MB",  uploader: "Dr. Nadia Hassan", uploaded: "2026-01-15", status: "Archived" },
];
const EMPTY     = { title: "", course: "", type: "PDF", size: "", uploader: "", uploaded: "", status: "Draft" };
const TYPE_ICON = { PDF: "📄", Slides: "📊", ZIP: "🗜️", Video: "🎬", Other: "📁" };
const statusVariant = (s) => s === "Active" ? "success" : s === "Draft" ? "warning" : "default";

function MaterialsManagement() {
  const [materials, setMaterials] = useState(INIT_MATERIALS);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY);
  const [editId,    setEditId]    = useState(null);

  const filtered   = materials.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase()) ||
    m.course.toLowerCase().includes(search.toLowerCase())
  );
  const openAdd    = ()   => { setForm(EMPTY); setEditId(null); setModal(true); };
  const openEdit   = (m)  => { setForm(m); setEditId(m.id); setModal(true); };
  const closeModal = ()   => setModal(false);
  const set        = (k,v)=> setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editId) setMaterials((p) => p.map((m) => m.id === editId ? { ...form, id: editId } : m));
    else        setMaterials((p) => [...p, { ...form, id: Date.now() }]);
    closeModal();
  };
  const handleDelete = (id) => setMaterials((p) => p.filter((m) => m.id !== id));

  const TH = ({ children }) => (
    <th className={tw.th} style={{ color: "var(--text-muted)", borderBottomColor: "var(--border)" }}>{children}</th>
  );
  const TD = ({ children, style }) => (
    <td className={tw.td} style={{ borderBottomColor: "var(--border-light)", color: "var(--text-primary)", ...style }}>
      {children}
    </td>
  );

  return (
    <div>
      <PageHeader
        title="Materials Management"
        subtitle="Upload and manage course learning materials."
        actions={
          <BtnPrimary onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">upload</span>
            Upload Material
          </BtnPrimary>
        }
      />

      <TableWrap
        toolbar={
          <>
            <span className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
              All Materials ({filtered.length})
            </span>
            <TableSearch value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search materials..." />
          </>
        }
      >
        {filtered.length === 0 ? (
          <EmptyState icon="📂" title="No materials found" description="Upload your first learning material." />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                <TH>Title</TH><TH>Course</TH><TH>Type</TH><TH>Size</TH>
                <TH>Uploaded By</TH><TH>Date</TH><TH>Status</TH><TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className={tw.trHover}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <TD><span className="font-medium"><span className="mr-2">{TYPE_ICON[m.type] || "📁"}</span>{m.title}</span></TD>
                  <TD><Badge variant="blue" mono>{m.course}</Badge></TD>
                  <TD style={{ color: "var(--text-secondary)" }}>{m.type}</TD>
                  <TD><span className="font-mono text-[12px]" style={{ color: "var(--text-secondary)" }}>{m.size}</span></TD>
                  <TD style={{ color: "var(--text-secondary)", fontSize: "13px" }}>{m.uploader}</TD>
                  <TD><span className="font-mono text-[12px]" style={{ color: "var(--text-muted)" }}>{m.uploaded}</span></TD>
                  <TD><Badge variant={statusVariant(m.status)}>{m.status}</Badge></TD>
                  <TD>
                    <div className="flex items-center gap-2 justify-end">
                      <BtnSecondary className={tw.btnSm} onClick={() => openEdit(m)}>Edit</BtnSecondary>
                      <BtnDanger    className={tw.btnSm} onClick={() => handleDelete(m.id)}>Delete</BtnDanger>
                    </div>
                  </TD>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <Modal title={editId ? "Edit Material" : "Upload New Material"} onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary   onClick={handleSave}>{editId ? "Save Changes" : "Upload"}</BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="Title">
              <FormInput value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Material title" />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <FormInput value={form.course} onChange={(e) => set("course", e.target.value)} placeholder="e.g. CS101" />
              </FormGroup>
              <FormGroup label="Type">
                <FormSelect value={form.type} onChange={(e) => set("type", e.target.value)}>
                  {["PDF","Slides","Video","ZIP","Other"].map((t) => <option key={t}>{t}</option>)}
                </FormSelect>
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Uploader">
                <FormInput value={form.uploader} onChange={(e) => set("uploader", e.target.value)} placeholder="Dr. Name" />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect value={form.status} onChange={(e) => set("status", e.target.value)}>
                  <option>Draft</option><option>Active</option><option>Archived</option>
                </FormSelect>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MaterialsManagement;