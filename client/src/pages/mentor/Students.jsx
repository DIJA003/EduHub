import { useState } from "react";
import {
  Badge,
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  BtnPrimary,
  BtnSecondary,
  FormGroup,
  FormInput,
  FormSelect,
  tw,
} from "../../components/admin/adminUtils";

import { useEffect } from "react";
import { enrollmentApi } from "../../services/api";

const MOCK_STUDENTS = [
  {
    _id: "1",
    name: "Ahmed Samy",
    email: "ahmed@edu.com",
    course: "Data Structures",
    enrolledAt: "2025-02-01",
  },
  {
    _id: "2",
    name: "Nour Tarek",
    email: "nour@edu.com",
    course: "Web Dev",
    enrolledAt: "2025-02-10",
  },
  {
    _id: "3",
    name: "Omar Khalid",
    email: "omar@edu.com",
    course: "Algorithms",
    enrolledAt: "2025-02-15",
  },
  {
    _id: "4",
    name: "Layla Hassan",
    email: "layla@edu.com",
    course: "Web Dev",
    enrolledAt: "2025-03-01",
  },
  {
    _id: "5",
    name: "Karim Ali",
    email: "karim@edu.com",
    course: "Databases",
    enrolledAt: "2025-03-05",
  },
  {
    _id: "6",
    name: "Sara Mostafa",
    email: "sara@edu.com",
    course: "Programming",
    enrolledAt: "2025-03-08",
  },
];

const COURSES = [
  "Data Structures",
  "Web Dev",
  "Algorithms",
  "Databases",
  "Programming",
];

const EMPTY_FORM = { studentEmail: "", course: COURSES[0] };

const AVATAR_COLORS = [
  { bg: "var(--accent-glow)", color: "var(--accent-light)" },
  { bg: "var(--success-bg)", color: "var(--success)" },
  { bg: "var(--warning-bg)", color: "var(--warning)" },
  { bg: "rgba(139,92,246,0.15)", color: "#a78bfa" },
];

function Students() {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const filtered = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.course.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setStudents(MOCK_STUDENTS);
    setLoading(false);
  }, []);

  const handleAdd = async () => {
    if (!form.studentEmail.trim()) return;
    setSaving(true);
    try {
      // Requires backend: POST /api/mentor/enroll { email, courseName }
      // For now optimistic UI:
      setStudents((prev) => [
        ...prev,
        {
          _id: String(Date.now()),
          name: form.studentEmail.split("@")[0],
          email: form.studentEmail,
          course: form.course,
          enrolledAt: new Date().toISOString().split("T")[0],
        },
      ]);
      setModal(false);
      setForm(EMPTY_FORM);
    } catch (err) {
      console.error("Failed to add student:", err.message);
    } finally {
      setSaving(false);
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
        {filtered.length === 0 ? (
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
                    key={s._id}
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
                          {s.name[0].toUpperCase()}
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
                          onClick={() =>
                            setStudents((prev) =>
                              prev.filter((x) => x._id !== s._id),
                            )
                          }
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

      {/* Add Student Modal */}
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
                className="text-[20px] cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <FormGroup label="Student Email">
                <FormInput
                  type="email"
                  value={form.studentEmail}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, studentEmail: e.target.value }))
                  }
                  placeholder="student@university.edu"
                />
              </FormGroup>
              <FormGroup label="Course">
                <FormSelect
                  value={form.course}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, course: e.target.value }))
                  }
                >
                  {COURSES.map((c) => (
                    <option key={c}>{c}</option>
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
