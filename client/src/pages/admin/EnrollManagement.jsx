import { useState, useEffect, useCallback } from "react";
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
import { enrollmentApi, coursesApi } from "../../services/api";

export default function EnrollmentManagement() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ studentId: "", courseId: "" });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [sRes, cRes, eRes] = await Promise.all([
        enrollmentApi.getStudents(),
        coursesApi.getAll(),
        enrollmentApi.getAllEnrollments(),
      ]);
      setStudents(sRes.data || []);
      setCourses(
        (cRes.data || []).filter(
          (c) => c.status === "Published" && !c.isDeleted,
        ),
      );
      setEnrollments(eRes.data || []);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleEnroll = async () => {
    if (!form.studentId || !form.courseId) return;
    setSaving(true);
    setError(null);
    try {
      await enrollmentApi.enroll(form.studentId, form.courseId);
      setModal(false);
      setForm({ studentId: "", courseId: "" });
      await loadAll();
    } catch (err) {
      setError(err.message || "Enrollment failed");
    } finally {
      setSaving(false);
    }
  };

  const handleUnenroll = async (studentId, courseId) => {
    setError(null);
    try {
      await enrollmentApi.unenroll(studentId, courseId);
      // Reload to get accurate state — re-adding this student later will now work
      await loadAll();
    } catch (err) {
      setError(err.message || "Failed to remove enrollment");
    }
  };

  const filtered = enrollments.filter(
    (e) =>
      e.student?.name?.toLowerCase().includes(search.toLowerCase()) ||
      e.course?.title?.toLowerCase().includes(search.toLowerCase()) ||
      e.student?.email?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Enrollment Management"
        subtitle="Enroll and manage students in courses. Removed students can be re-added at any time."
        actions={
          <BtnPrimary
            onClick={() => {
              setForm({ studentId: "", courseId: "" });
              setError(null);
              setModal(true);
            }}
          >
            <span className="material-symbols-outlined text-[14px]">
              person_add
            </span>
            Enroll Student
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
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
              Active Enrollments ({filtered.length})
            </span>
            <TableSearch
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or course…"
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
            title="No enrollments"
            description="Enroll students using the button above."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                {[
                  "Student",
                  "Email",
                  "Course",
                  "Instructor",
                  "Enrolled",
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
              {filtered.map((e) => (
                <tr
                  key={e._id}
                  className={tw.trHover}
                  onMouseEnter={(ev) =>
                    (ev.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(ev) =>
                    (ev.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-primary)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        {e.student?.name?.[0] || "?"}
                      </div>
                      <span className="font-medium">
                        {e.student?.name || "—"}
                      </span>
                    </div>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                    }}
                  >
                    {e.student?.email}
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <Badge variant="blue">{e.course?.title || "—"}</Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-secondary)",
                      fontSize: 13,
                    }}
                  >
                    {e.course?.instructor || "—"}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      borderBottomColor: "var(--border-light)",
                      color: "var(--text-muted)",
                    }}
                  >
                    <span className="font-mono text-[12px]">
                      {e.enrolledAt
                        ? new Date(e.enrolledAt).toLocaleDateString()
                        : "—"}
                    </span>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <div className="flex justify-end">
                      <BtnDanger
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() =>
                          handleUnenroll(e.student?._id, e.course?._id)
                        }
                      >
                        <span className="material-symbols-outlined text-[13px]">
                          person_remove
                        </span>
                        Remove
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
          onClose={() => {
            setModal(false);
            setError(null);
          }}
          footer={
            <>
              <BtnSecondary
                onClick={() => {
                  setModal(false);
                  setError(null);
                }}
              >
                Cancel
              </BtnSecondary>
              <BtnPrimary
                onClick={handleEnroll}
                disabled={saving || !form.studentId || !form.courseId}
              >
                {saving ? "Enrolling…" : "Enroll"}
              </BtnPrimary>
            </>
          }
        >
          <div className="flex flex-col gap-4">
            {error && (
              <div
                className="rounded-lg px-3 py-2 text-sm"
                style={{
                  background: "var(--danger-bg)",
                  color: "var(--danger)",
                }}
              >
                {error}
              </div>
            )}
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
                    {c.code} — {c.title}
                  </option>
                ))}
              </FormSelect>
            </FormGroup>
            <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              If a student was previously removed from this course, they will be
              re-enrolled automatically.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}