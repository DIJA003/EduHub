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
import { collegesApi } from "../../services/api";

const EMPTY = {
  name: "",
  years: "",
  semesters: "",
  programs: "",
  status: "Active",
};

function AcademicManagement() {
  const { confirmDialog, confirm } = useConfirm();

  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadColleges();
  }, []);

  const loadColleges = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await collegesApi.getAll();
      setColleges(res.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filtered = colleges.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );
  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  };
  const openEdit = (col) => {
    setForm(col);
    setEditId(col._id);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSaving(false);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await collegesApi.update(editId, form);
        setColleges((p) => p.map((c) => (c._id === editId ? res.data : c)));
      } else {
        const res = await collegesApi.create(form);
        setColleges((p) => [...p, res.data]);
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
      "This action cannot be undone. Delete this college?",
      "Delete College",
    );
    if (!ok) return;
    try {
      await collegesApi.remove(id);
      setColleges((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      {confirmDialog}
      <PageHeader
        title="Academic Management"
        subtitle="Manage faculties, colleges and their academic structure."
        actions={
          <BtnPrimary onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add College
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={loadColleges}>
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
              Colleges ({filtered.length})
            </span>
            <TableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search colleges..."
            />
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
            icon="🏫"
            title="No colleges found"
            description="Try adjusting your search or add a new college."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                {[
                  "College Name",
                  "Duration",
                  "Semesters/Year",
                  "Programs",
                  "Status",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className={tw.th}
                    style={{
                      color: "var(--text-muted)",
                      borderBottomColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((col) => (
                <tr
                  key={col._id}
                  className={tw.trHover}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: "var(--accent-glow)",
                          color: "var(--accent-light)",
                          border: "1px solid var(--border-focus)",
                        }}
                      >
                        {col.name[0]}
                      </div>
                      <span className="font-medium">{col.name}</span>
                    </div>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {col.years} years
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {col.semesters}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  >
                    {col.programs}
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <Badge
                      variant={col.status === "Active" ? "success" : "default"}
                    >
                      {col.status}
                    </Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-2 justify-end">
                      <BtnSecondary
                        className={tw.btnSm}
                        onClick={() => openEdit(col)}
                      >
                        Edit
                      </BtnSecondary>
                      <BtnDanger
                        className={tw.btnSm}
                        onClick={() => handleDelete(col._id)}
                      >
                        Delete
                      </BtnDanger>
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
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add College"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="College Name">
              <FormInput
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Faculty of Engineering"
              />
            </FormGroup>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Duration (Years)">
                <FormInput
                  type="number"
                  value={form.years}
                  onChange={(e) => set("years", e.target.value)}
                  placeholder="4"
                />
              </FormGroup>
              <FormGroup label="Semesters / Year">
                <FormInput
                  type="number"
                  value={form.semesters}
                  onChange={(e) => set("semesters", e.target.value)}
                  placeholder="2"
                />
              </FormGroup>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Programs Count">
                <FormInput
                  type="number"
                  value={form.programs}
                  onChange={(e) => set("programs", e.target.value)}
                  placeholder="6"
                />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                </FormSelect>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default AcademicManagement;
