import { useState, useEffect } from "react";
import {
  Badge,
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  BtnPrimary,
  BtnSecondary,
  FormGroup,
  FormSelect,
  tw,
} from "../../components/admin/adminUtils";
import { mentorApi, enrollmentApi } from "../../services/api";

const AVATAR_COLORS = [
  { bg: "var(--accent-glow)", color: "var(--accent-light)" },
  { bg: "var(--success-bg)", color: "var(--success)" },
  { bg: "var(--warning-bg)", color: "var(--warning)" },
  { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
];

const EMPTY_FORM = { studentId: "", courseId: "" };

function Students() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [enrollableStudents, setEnrollableStudents] = useState([]);
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const filtered = students.filter(
    (s) =>
      s.name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase()) ||
      s.course?.toLowerCase().includes(search.toLowerCase()),
  );

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [studentsRes, enrollableRes, coursesRes] = await Promise.all([
        mentorApi.getStudents(),
        enrollmentApi.mentorStudents(),
        enrollmentApi.mentorCourses(),
      ]);
      setStudents(studentsRes.data || []);
      setEnrollableStudents(enrollableRes.data || []);
      setMyCourses(coursesRes.data || []);
    } catch (err) {
      setError(err.message);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleAdd = async () => {
    if (!form.studentId || !form.courseId) return;
    setSaving(true);
    try {
      await enrollmentApi.mentorEnroll(form.studentId, form.courseId);
      setModal(false);
      setForm(EMPTY_FORM);
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async (studentId, courseTitle) => {
    const course = myCourses.find((c) => c.title === courseTitle);
    if (!course) return;
    try {
      await enrollmentApi.mentorUnenroll(studentId, course._id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        subtitle="View and manage students enrolled in your courses."
        actions={
          <BtnPrimary
            onClick={() => {
              setForm(EMPTY_FORM);
              setModal(true);
            }}
          >
            <span className="material-symbols-outlined text-[16px]">
              person_add
            </span>
            Add Student to Course
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <TableWrap
        toolbar={
          <>
            <span
              className="text-[13px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {filtered.length} student{filtered.length !== 1 ? "s" : ""}
            </span>
            <TableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search students…"
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
            icon="🎓"
            title="No students found"
            description="Try a different search or add a new student."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                {["Student", "Email", "Course", "Enrolled", ""].map((h, i) => (
                  <th
                    key={i}
                    className={tw.th}
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => {
                const av = AVATAR_COLORS[i % AVATAR_COLORS.length];
                return (
                  <tr
                    key={s._id + i}
                    className={tw.trHover}
                    style={{ borderBottom: "1px solid var(--border)" }}
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
                        color: "var(--text-primary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: av.bg, color: av.color }}
                        >
                          {s.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="font-medium">{s.name}</span>
                      </div>
                    </td>
                    <td
                      className={tw.td}
                      style={{
                        color: "var(--text-secondary)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {s.email}
                    </td>
                    <td
                      className={tw.td}
                      style={{ borderColor: "var(--border)" }}
                    >
                      <Badge variant="blue">{s.course}</Badge>
                    </td>
                    <td
                      className={tw.td}
                      style={{
                        color: "var(--text-muted)",
                        borderColor: "var(--border)",
                      }}
                    >
                      {s.enrolledAt}
                    </td>
                    <td
                      className={tw.td}
                      style={{ borderColor: "var(--border)" }}
                    >
                      <div className="flex justify-end">
                        <button
                          title="Remove from course"
                          className="w-7 h-7 rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150"
                          style={{
                            color: "var(--text-muted)",
                            background: "var(--bg-card)",
                            border: "1px solid var(--border)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.color = "var(--danger)";
                            e.currentTarget.style.borderColor = "var(--danger)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.color = "var(--text-muted)";
                            e.currentTarget.style.borderColor = "var(--border)";
                          }}
                          onClick={() => handleRemove(s._id, s.course)}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            person_remove
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </TableWrap>

      {modal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) => e.target === e.currentTarget && setModal(false)}
        >
          <div
            className="w-full max-w-[440px] rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-[16px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Add Student to Course
              </h3>
              <button
                onClick={() => setModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-sm text-[18px] cursor-pointer"
                style={{
                  color: "var(--text-muted)",
                  background: "var(--bg-card)",
                  border: "1px solid var(--border)",
                }}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <FormGroup label="Student">
                <FormSelect
                  value={form.studentId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentId: e.target.value }))
                  }
                >
                  <option value="">Select student…</option>
                  {enrollableStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} — {s.email}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>
              <FormGroup label="Course">
                <FormSelect
                  value={form.courseId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, courseId: e.target.value }))
                  }
                >
                  <option value="">Select course…</option>
                  {myCourses.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.title}
                    </option>
                  ))}
                </FormSelect>
              </FormGroup>
            </div>
            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <BtnSecondary onClick={() => setModal(false)}>
                Cancel
              </BtnSecondary>
              <BtnPrimary onClick={handleAdd}>
                {saving ? "Adding…" : "Add Student"}
              </BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Students;
