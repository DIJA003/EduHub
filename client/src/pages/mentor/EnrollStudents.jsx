import { useState, useEffect } from "react";
import {
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  BtnPrimary,
  BtnDanger,
  BtnSecondary,
  Badge,
  FormGroup,
  FormSelect,
  tw,
} from "../../components/admin/adminUtils";
import Modal from "../../components/admin/Modal";
import { enrollmentApi, mentorApi } from "../../services/api";

export default function EnrollStudents() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, cRes, eRes] = await Promise.all([
        enrollmentApi.mentorStudents(),
        enrollmentApi.mentorCourses(),
        mentorApi.getStudents(),
      ]);
      setStudents(sRes.data || []);
      setCourses(cRes.data || []);
      setEnrollments(eRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!form.studentId || !form.courseId) return;
    setSaving(true);
    try {
      await enrollmentApi.mentorEnroll(form.studentId, form.courseId);
      setModal(false);
      setForm({ studentId: "", courseId: "" });
      await loadAll();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async (studentId, courseTitle) => {
    const course = courses.find((c) => c.title === courseTitle);
    if (!course) return;
    try {
      await enrollmentApi.mentorUnenroll(studentId, course._id);
      await loadAll();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = enrollments.filter(
    (e) =>
      e.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.course?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Enroll Students"
        subtitle="Add or remove students from your courses."
        actions={
          <BtnPrimary
            onClick={() => {
              setForm({ studentId: "", courseId: "" });
              setModal(true);
            }}
          >
            <span className="material-symbols-outlined text-[16px]">
              person_add
            </span>
            Enroll Student
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
              className="text-[13.5px] font-semibold"
              style={{ color: "var(--text-primary)" }}
            >
              {filtered.length} enrolled
            </span>
            <TableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search…"
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
            title="No students enrolled"
            description="Use the button above to enroll students."
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
              {filtered.map((s, i) => (
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
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--accent)" }}
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
                      <BtnDanger
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() => handleUnenroll(s._id, s.course)}
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          person_remove
                        </span>
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
          title="Enroll Student"
          onClose={() => setModal(false)}
          footer={
            <>
              <BtnSecondary onClick={() => setModal(false)}>
                Cancel
              </BtnSecondary>
              <BtnPrimary onClick={handleEnroll}>
                {saving ? "Enrolling…" : "Enroll"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            <FormGroup label="Student">
              <FormSelect
                value={form.studentId}
                onChange={(e) =>
                  setForm((f) => ({ ...f, studentId: e.target.value }))
                }
              >
                <option value="">Select student…</option>
                {students.map((s) => (
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
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
          </div>
        </Modal>
      )}
    </div>
  );
}
