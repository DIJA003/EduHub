import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
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
import { coursesApi, collegesApi } from "../../services/api";
import { academicYearsApi } from "../../services/api";
import { adminUsersApi } from "../../services/api";
import { useCourses } from "../../context/CourseContext";

const EMPTY = {
  code: "",
  title: "",
  college: "",
  instructor: "",
  students: "",
  status: "Draft",
};
const statusVariant = (s) =>
  s === "Published" ? "success" : s === "Draft" ? "warning" : "default";

function CourseManagement() {
  const navigate = useNavigate();
  const { confirmDialog, confirm } = useConfirm();
  const [academicYears, setAcademicYears] = useState([]);
  const [courses, setCourses] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [showDeleted, setShowDeleted] = useState(false);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [mentors, setMentors] = useState([]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const mRes = await adminUsersApi.getAll().catch(() => ({ data: [] }));
      setMentors(
        (mRes.data || []).filter((u) => u.role === "Mentor" && !u.isDeleted),
      );
      const [cRes, colRes, ayRes] = await Promise.all([
        coursesApi.getAll(showDeleted),
        collegesApi.getAll(),
        academicYearsApi.getAll(),
      ]);
      setAcademicYears(ayRes.data || []);
      setCourses(cRes.data || []);
      setColleges(colRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [showDeleted]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filtered = courses.filter(
    (c) =>
      c.title?.toLowerCase().includes(search.toLowerCase()) ||
      c.code?.toLowerCase().includes(search.toLowerCase()),
  );

  const openAdd = () => {
    setForm(EMPTY);
    setEditId(null);
    setModal(true);
  };
  const openEdit = (c) => {
    setForm(c);
    setEditId(c._id);
    setModal(true);
  };
  const closeModal = () => {
    setModal(false);
    setSaving(false);
  };
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title?.trim() || !form.code?.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        const res = await coursesApi.update(editId, form);
        setCourses((p) => p.map((c) => (c._id === editId ? res.data : c)));
      } else {
        const res = await coursesApi.create(form);
        setCourses((p) => [...p, res.data]);
      }
      closeModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const ok = await confirm(
      "This will mark the course as deleted. You can restore it later.",
      "Delete Course",
    );
    if (!ok) return;
    try {
      await coursesApi.remove(id);
      setCourses((p) =>
        showDeleted
          ? p.map((c) =>
              c._id === id
                ? { ...c, isDeleted: true, deletedAt: new Date() }
                : c,
            )
          : p.filter((c) => c._id !== id),
      );
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRestore = async (id) => {
    try {
      const res = await coursesApi.restore(id);
      if (showDeleted) {
        setCourses((p) =>
          p.map((c) =>
            c._id === id ? { ...c, isDeleted: false, deletedAt: null } : c,
          ),
        );
      } else {
        setCourses((p) => [...p, res.data]);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const TH = ({ children }) => (
    <th
      className={tw.th}
      style={{ color: "var(--text-muted)", borderBottomColor: "var(--border)" }}
    >
      {children}
    </th>
  );
  const TD = ({ children, secondary, small, style }) => (
    <td
      className={tw.td}
      style={{
        borderBottomColor: "var(--border-light)",
        color: secondary ? "var(--text-secondary)" : "var(--text-primary)",
        fontSize: small ? "13px" : undefined,
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
        title="Course Management"
        subtitle="Create and manage courses across all faculties."
        actions={
          <BtnPrimary onClick={openAdd}>
            <span className="material-symbols-outlined text-[14px]">add</span>
            Add Course
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={loadData}>
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
              All Courses ({filtered.length})
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
                placeholder="Search courses..."
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
            icon="📚"
            title="No courses found"
            description="Try a different search or add a new course."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                <TH>Code</TH>
                <TH>Title</TH>
                <TH>College</TH>
                <TH>Instructor</TH>
                <TH>Students</TH>
                <TH>Status</TH>
                <TH>Actions</TH>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => {
                const deleted = c.isDeleted;
                return (
                  <tr
                    key={c._id}
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
                    <TD>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="blue" mono>
                          {c.code}
                        </Badge>
                        {deleted && (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold"
                            style={{
                              background: "var(--danger-bg)",
                              color: "var(--danger)",
                              border: "1px solid var(--danger)",
                            }}
                          >
                            Deleted
                          </span>
                        )}
                      </div>
                    </TD>
                    <TD>
                      <span className="font-medium">{c.title}</span>
                    </TD>
                    <TD secondary small>
                      {c.college}
                    </TD>
                    <TD secondary small>
                      {c.instructor}
                    </TD>
                    <TD>
                      <button
                        onClick={() =>
                          navigate(`/admin/courses/${c._id}/students`)
                        }
                        className="flex items-center gap-1 font-mono text-[13px] transition-colors hover:underline"
                        style={{ color: "var(--accent-light)" }}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          group
                        </span>
                        {c.students ?? 0}
                      </button>
                    </TD>
                    <TD>
                      <Badge variant={statusVariant(c.status)}>
                        {c.status}
                      </Badge>
                    </TD>
                    <TD>
                      <div className="flex items-center gap-2 justify-end">
                        {deleted ? (
                          <BtnSecondary
                            className={tw.btnSm}
                            onClick={() => handleRestore(c._id)}
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
                              onClick={() => openEdit(c)}
                            >
                              Edit
                            </BtnSecondary>
                            <BtnDanger
                              className={tw.btnSm}
                              onClick={() => handleDelete(c._id)}
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
          title={editId ? "Edit Course" : "Add New Course"}
          onClose={closeModal}
          footer={
            <>
              <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
              <BtnPrimary onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editId ? "Save Changes" : "Add Course"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Course Code">
                <FormInput
                  value={form.code}
                  onChange={(e) => set("code", e.target.value)}
                  placeholder="e.g. CS101"
                />
              </FormGroup>
              <FormGroup label="Status">
                <FormSelect
                  value={form.status}
                  onChange={(e) => set("status", e.target.value)}
                >
                  <option>Draft</option>
                  <option>Published</option>
                  <option>Archived</option>
                </FormSelect>
              </FormGroup>
            </div>
            <FormGroup label="Course Title">
              <FormInput
                value={form.title}
                onChange={(e) => set("title", e.target.value)}
                placeholder="e.g. Introduction to Computer Science"
              />
            </FormGroup>
            <FormGroup label="College">
              <FormSelect
                value={form.college}
                onChange={(e) => set("college", e.target.value)}
              >
                <option value="">Select college...</option>
                {colleges.map((col) => (
                  <option key={col._id} value={col.name}>
                    {col.name}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            <FormGroup label="Academic Year">
              <FormSelect
                value={form.academicYearRef || ""}
                onChange={(e) => set("academicYearRef", e.target.value)}
              >
                <option value="">None</option>
                {academicYears.map((y) => (
                  <option key={y._id} value={y._id}>
                    Year {y.year} {y.name ? `— ${y.name}` : ""}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>

            <div className="grid grid-cols-2 gap-3">
              <FormGroup label="Instructor (Mentor)">
                <FormSelect
                  value={form.instructorRef || ""}
                  onChange={(e) => {
                    const m = mentors.find((x) => x._id === e.target.value);
                    set("instructorRef", e.target.value);
                    set("instructor", m?.name || "");
                  }}
                >
                  <option value="">Unassigned</option>
                  {mentors.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup label="Enrolled Students">
                <FormInput
                  type="number"
                  value={form.students}
                  onChange={(e) => set("students", e.target.value)}
                  placeholder="0"
                />
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CourseManagement;