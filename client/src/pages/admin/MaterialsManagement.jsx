import { useState, useEffect } from "react";
import Modal from "../../components/admin/Modal";
import { useConfirm } from "../../hooks/useConfirm";
import {
  Badge,
  FormGroup,
  FormInput,
  FormSelect,
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
  tw,
} from "../../components/admin/adminUtils";
import { materialsApi } from "../../services/api";

const EMPTY = {
  title: "",
  course: "",
  type: "PDF",
  size: "",
  uploader: "",
  status: "Draft",
};

const TYPE_ICON = {
  PDF: "📄",
  Slides: "📊",
  ZIP: "🗜️",
  Video: "🎬",
  Other: "📁",
};

const statusVariant = (s) =>
  s === "Active" ? "success" : s === "Draft" ? "warning" : "default";

function MaterialsManagement() {
  const { confirmDialog, confirm } = useConfirm();

  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [showDeleted]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await materialsApi.getAll(showDeleted);
      setMaterials(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = materials.filter(
    (m) =>
      m.title?.toLowerCase().includes(search.toLowerCase()) ||
      m.course?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  };
  const openEdit = (m) => {
    setForm(m);
    setEditId(m._id);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSaving(false);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title?.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await materialsApi.update(editId, form);
        setMaterials((p) => p.map((m) => (m._id === editId ? res.data : m)));
      } else {
        const res = await materialsApi.create(form);
        setMaterials((p) => [...p, res.data]);
      }
      closeModal();
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm(
      "This will mark the material as deleted. You can restore it later.",
      "Delete Material",
    );
    if (!ok) return;
    try {
      await materialsApi.remove(id);
      setMaterials((p) =>
        showDeleted
          ? p.map((m) =>
              m._id === id
                ? { ...m, isDeleted: true, deletedAt: new Date() }
                : m,
            )
          : p.filter((m) => m._id !== id),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await materialsApi.restore(id);
      if (showDeleted) {
        setMaterials((p) =>
          p.map((m) =>
            m._id === id ? { ...m, isDeleted: false, deletedAt: null } : m,
          ),
        );
      } else {
        setMaterials((p) => [...p, res.data]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const formatDate = (m) => {
    if (m.createdAt) return new Date(m.createdAt).toISOString().split("T")[0];
    return m.uploaded || "—";
  };

  const TH = ({ children }) => (
    <th
      className={tw.th}
      style={{ color: "var(--text-muted)", borderBottomColor: "var(--border)" }}
    >
      {children}
    </th>
  );

  const TD = ({ children, style }) => (
    <td
      className={tw.td}
      style={{
        borderBottomColor: "var(--border-light)",
        color: "var(--text-primary)",
        ...style,
      }}
    >
      {children}
    </td>
  );

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Materials Management"
        subtitle="Upload and manage course learning materials."
        actions={
          <BtnPrimary onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">
              upload
            </span>
            Upload Material
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={loadMaterials}>
            Retry
          </button>
        </div>
      )}

      <TableWrap
        toolbar={
          <>
            <span
              className="text-[13.5px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              All Materials ({filtered.length})
              {showDeleted && (
                <span
                  className="ml-2 text-[11px] font-normal"
                  style={{ color: "var(--text-muted)" }}
                >
                  — including deleted
                </span>
              )}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowDeleted((v) => !v)}
                className="inline-flex items-center gap-1.5 px-3 py-[6px] rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer"
                style={
                  showDeleted
                    ? {
                        background: "var(--danger-bg)",
                        borderColor: "var(--danger)",
                        color: "var(--danger)",
                      }
                    : {
                        background: "var(--bg-card)",
                        borderColor: "var(--border)",
                        color: "var(--text-secondary)",
                      }
                }
              >
                <span className="material-symbols-outlined text-[14px]">
                  {showDeleted ? "visibility_off" : "visibility"}
                </span>
                {showDeleted ? "Hide Deleted" : "Show Deleted"}
              </button>
              <TableSearch
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search materials..."
              />
            </div>
          </>
        }
      >
        {loading ? (
          <div
            className="flex items-center justify-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="material-symbols-outlined animate-spin mr-2">
              progress_activity
            </span>
            Loading…
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="📂"
            title="No materials found"
            description="Upload your first learning material."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                <TH>Title</TH>
                <TH>Course</TH>
                <TH>Type</TH>
                <TH>Size</TH>
                <TH>Uploaded By</TH>
                <TH>Date</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => {
                const deleted = m.isDeleted;
                return (
                  <tr
                    key={m._id}
                    className={tw.trHover}
                    style={{
                      opacity: deleted ? 0.6 : 1,
                      background: deleted ? "var(--danger-bg)" : "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = deleted
                        ? "var(--danger-bg)"
                        : "var(--bg-hover)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = deleted
                        ? "var(--danger-bg)"
                        : "transparent")
                    }
                  >
                    {/* Title */}
                    <TD>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">
                          <span className="mr-2">
                            {TYPE_ICON[m.type] || "📁"}
                          </span>
                          {m.title}
                        </span>
                        {deleted && (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              background: "var(--danger-bg)",
                              color: "var(--danger)",
                              border: "1px solid var(--danger)",
                            }}
                          >
                            <span className="material-symbols-outlined text-[10px]">
                              delete
                            </span>
                            Deleted
                          </span>
                        )}
                      </div>
                    </TD>

                    {/* Course */}
                    <TD>
                      <Badge variant="blue" mono>
                        {m.course}
                      </Badge>
                    </TD>

                    {/* Type */}
                    <TD style={{ color: "var(--text-secondary)" }}>{m.type}</TD>

                    {/* Size */}
                    <TD>
                      <span
                        className="font-mono text-[12px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {m.size || "—"}
                      </span>
                    </TD>

                    {/* Uploader */}
                    <TD
                      style={{
                        color: "var(--text-secondary)",
                        fontSize: "13px",
                      }}
                    >
                      {m.uploader}
                    </TD>

                    {/* Date */}
                    <TD>
                      <span
                        className="font-mono text-[12px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {formatDate(m)}
                      </span>
                    </TD>

                    {/* Status */}
                    <TD>
                      <Badge variant={statusVariant(m.status)}>
                        {m.status}
                      </Badge>
                    </TD>

                    {/* Actions */}
                    <TD>
                      <div className="flex items-center gap-2 justify-end">
                        {deleted ? (
                          <BtnSecondary
                            className={tw.btnSm}
                            onClick={() => handleRestore(m._id)}
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              restore
                            </span>
                            Restore
                          </BtnSecondary>
                        ) : (
                          <>
                            <BtnSecondary
                              className={tw.btnSm}
                              onClick={() => openEdit(m)}
                            >
                              Edit
                            </BtnSecondary>
                            <BtnDanger
                              className={tw.btnSm}
                              onClick={() => handleDelete(m._id)}
                            >
                              Delete
                            </BtnDanger>
                          </>
                        )}
                      </div>
                    </TD>
                  </tr>
                );
              })}
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
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Upload"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="Title">
              <FormInput
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="Material title"
              />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <FormInput
                  value={form.course}
                  onChange={(e) => set("course", e.target.value)}
                  placeholder="e.g. CS101"
                />
              </FormGroup>
              <FormGroup label="Type">
                <FormSelect
                  value={form.type}
                  onChange={(e) => set("type", e.target.value)}
                >
                  {["PDF", "Slides", "Video", "ZIP", "Other"].map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </FormSelect>
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="File Size (optional)">
                <FormInput
                  value={form.size}
                  onChange={(e) => set("size", e.target.value)}
                  placeholder="e.g. 2.4 MB"
                />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Draft</option>
                  <option>Active</option>
                  <option>Archived</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Uploader">
              <FormInput
                value={form.uploader}
                onChange={(e) => set("uploader", e.target.value)}
                placeholder="Dr. Name"
              />
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default MaterialsManagement;
