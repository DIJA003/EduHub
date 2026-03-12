import { useState } from "react";
import { PageHeader, TableWrap, EmptyState, BtnPrimary, BtnDanger, BtnSecondary, Badge, FormGroup, FormInput, FormSelect, tw } from "../../components/admin/adminUtils";

const COURSES = ["Data Structures", "Web Dev", "Algorithms", "Databases", "Programming"];
const TYPES   = ["PDF", "Slides", "Video", "ZIP", "Other"];
const TYPE_ICON = { PDF: "📄", Slides: "📊", Video: "🎬", ZIP: "🗜️", Other: "📁" };

const MOCK_MATERIALS = [
  { _id: "1", title: "Lecture 1 Notes",        course: "Data Structures", type: "PDF",    size: "1.2 MB", uploadedAt: "2025-03-01" },
  { _id: "2", title: "Week 3 Slides",           course: "Web Dev",         type: "Slides", size: "3.5 MB", uploadedAt: "2025-03-08" },
  { _id: "3", title: "Algorithm Cheat Sheet",   course: "Algorithms",      type: "PDF",    size: "0.8 MB", uploadedAt: "2025-03-10" },
];

const EMPTY_FORM = { title: "", course: COURSES[0], type: TYPES[0], file: null };

function UploadMaterial() {
  const [materials, setMaterials] = useState(MOCK_MATERIALS);
  const [modal,     setModal]     = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [saving,    setSaving]    = useState(false);
  const [dragOver,  setDragOver]  = useState(false);

  const openModal = () => { setForm(EMPTY_FORM); setModal(true); };

  const handleFile = (file) => {
    if (file) setForm((f) => ({ ...f, file, title: f.title || file.name.replace(/\.[^.]+$/, "") }));
  };

  const handleSave = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    // TODO: POST /api/mentor/materials (FormData with file)
    await new Promise((r) => setTimeout(r, 700));
    setMaterials((prev) => [
      ...prev,
      {
        _id: String(Date.now()),
        title: form.title,
        course: form.course,
        type: form.type,
        size: form.file ? `${(form.file.size / 1048576).toFixed(1)} MB` : "—",
        uploadedAt: new Date().toISOString().split("T")[0],
      },
    ]);
    setSaving(false);
    setModal(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Material"
        subtitle="Share study materials with your students."
        actions={
          <BtnPrimary onClick={openModal}>
            <span className="material-symbols-outlined text-[16px]">upload_file</span>
            Upload New Material
          </BtnPrimary>
        }
      />

      <TableWrap
        toolbar={
          <span className="text-[13px] font-semibold" style={{ color: "var(--text-primary)" }}>
            {materials.length} material{materials.length !== 1 ? "s" : ""} uploaded
          </span>
        }
      >
        {materials.length === 0 ? (
          <EmptyState icon="📁" title="No materials yet" description="Upload your first material using the button above." />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                {["Title", "Course", "Type", "Size", "Uploaded", ""].map((h, i) => (
                  <th key={i} className={tw.th} style={{ color: "var(--text-secondary)", borderColor: "var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr
                  key={m._id}
                  className={tw.trHover}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-hover)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <td className={tw.td} style={{ color: "var(--text-primary)", borderColor: "var(--border)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">{TYPE_ICON[m.type] || "📁"}</span>
                      <span className="font-medium">{m.title}</span>
                    </div>
                  </td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}><Badge variant="blue">{m.course}</Badge></td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}><Badge variant="default">{m.type}</Badge></td>
                  <td className={tw.td} style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>{m.size}</td>
                  <td className={tw.td} style={{ color: "var(--text-muted)", borderColor: "var(--border)" }}>{m.uploadedAt}</td>
                  <td className={tw.td} style={{ borderColor: "var(--border)" }}>
                    <div className="flex justify-end">
                      <BtnDanger
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() => setMaterials((prev) => prev.filter((x) => x._id !== m._id))}
                      >
                        <span className="material-symbols-outlined text-[14px]">delete</span>
                      </BtnDanger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {/* Upload Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div
            className="w-full max-w-[480px] rounded-xl overflow-hidden"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", boxShadow: "0 20px 48px rgba(0,0,0,0.4)" }}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4" style={{ borderBottom: "1px solid var(--border)" }}>
              <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>Upload New Material</h3>
              <button onClick={() => setModal(false)} className="text-[20px] cursor-pointer" style={{ color: "var(--text-muted)" }}>×</button>
            </div>

            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-150"
                style={{
                  borderColor: dragOver ? "var(--accent)" : "var(--border)",
                  background: dragOver ? "var(--accent-glow)" : "var(--bg-card)",
                }}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
                onClick={() => document.getElementById("file-input").click()}
              >
                <input
                  id="file-input"
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <span className="material-symbols-outlined text-[36px] mb-2 block" style={{ color: "var(--accent-light)" }}>
                  cloud_upload
                </span>
                {form.file ? (
                  <p className="text-[13.5px] font-semibold" style={{ color: "var(--success)" }}>
                    ✅ {form.file.name}
                  </p>
                ) : (
                  <>
                    <p className="text-[13.5px] font-semibold" style={{ color: "var(--text-primary)" }}>
                      Drag & drop or click to browse
                    </p>
                    <p className="text-[12px] mt-1" style={{ color: "var(--text-muted)" }}>
                      PDF, Slides, Videos, ZIP — max 100 MB
                    </p>
                  </>
                )}
              </div>

              <FormGroup label="Title">
                <FormInput
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Week 4 Lecture Notes"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Course">
                  <FormSelect value={form.course} onChange={(e) => setForm((f) => ({ ...f, course: e.target.value }))}>
                    {COURSES.map((c) => <option key={c}>{c}</option>)}
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Type">
                  <FormSelect value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
                    {TYPES.map((t) => <option key={t}>{t}</option>)}
                  </FormSelect>
                </FormGroup>
              </div>
            </div>

            <div className="flex justify-end gap-2 px-6 py-4" style={{ borderTop: "1px solid var(--border)", background: "var(--bg-card)" }}>
              <BtnSecondary onClick={() => setModal(false)}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave}>
                {saving ? "Uploading…" : "Upload Material"}
              </BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UploadMaterial;
