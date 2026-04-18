import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses, sumEnrolledCredits } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import { useTheme } from "../context/ThemeContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import logo from "../assets/images/logo.png";

const SIDEBAR_LINKS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "my-courses", label: "My Courses" },
  { id: "upload-material", label: "Upload Material" },
  { id: "recent-materials", label: "Recent Materials" },
  { id: "my-history", label: "My History" },
];

const openCourses = [
  {
    id: "foundations-analysis",
    name: "Foundations of Data Analysis",
    level: "Beginner",
    duration: "8 weeks",
    instructor: "Dr. Sarah Chen",
  },
  {
    id: "ml-specialization",
    name: "Machine Learning Specialization",
    level: "Intermediate",
    duration: "12 weeks",
    instructor: "Marcus Vane",
  },
  {
    id: "predictive-business",
    name: "Predictive Analytics for Business",
    level: "Advanced",
    duration: "4 weeks",
    instructor: "Elena Rodriguez",
  },
  {
    id: "big-data-spark",
    name: "Big Data Engineering with Spark",
    level: "Intermediate",
    duration: "10 weeks",
    instructor: "Julian Chen",
  },
  {
    id: "viz-tableau",
    name: "Data Visualization with Tableau",
    level: "Beginner",
    duration: "6 weeks",
    instructor: "Maya Patel",
  },
  {
    id: "deep-learning",
    name: "Deep Learning & Neural Networks",
    level: "Advanced",
    duration: "10 weeks",
    instructor: "Dr. Robert Smith",
  },
];

const STATUS_COLOR = {
  pending: "text-amber-400",
  approved: "text-emerald-400",
  rejected: "text-rose-400",
};
const STATUS_LABEL = {
  pending: "⏳ Pending review",
  approved: "✅ Approved",
  rejected: "❌ Rejected",
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dbUser } = useAuth();
  const { darkMode } = useTheme();
  const { years, enrollCourse, undoEnrollment, currentYearId } = useCourses();
  const { materials, removeMaterial } = useMaterials();

  const [activeLink, setActiveLink] = useState("dashboard");
  const [undoTarget, setUndoTarget] = useState(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  // Activity log — persisted to localStorage so it survives refresh
  const ACTIVITY_KEY = "eduhub-activity-log-v1";
  const [activityLog, setActivityLog] = useState(() => {
    try {
      const stored = localStorage.getItem(ACTIVITY_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Persist activity log whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activityLog.slice(0, 50)),
      );
    } catch {}
  }, [activityLog]);
  const prevEnrolled = useRef([]);
  const prevMaterials = useRef([]);

  const activeYear = years[currentYearId];
  const enrolledCourses = activeYear?.enrolled || [];
  const availableCourses = activeYear?.available || [];
  const earnedCredits = activeYear?.meta?.earnedCredits ?? 0;
  const totalCredits = activeYear?.meta?.totalCredits ?? 42;
  const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "Student";

  // isMounted ref — skip logging on first render (initial data load)
  const isMounted = useRef(false);

  // Track enrollment changes → activity log
  useEffect(() => {
    if (!isMounted.current) {
      // First render: just set the baseline, don't log anything
      prevEnrolled.current = enrolledCourses;
      return;
    }

    const prev = prevEnrolled.current;
    const curr = enrolledCourses;

    curr.forEach((c) => {
      if (!prev.some((p) => p.id === c.id)) {
        setActivityLog((log) => [
          {
            id: Date.now() + Math.random(),
            icon: "📚",
            text: `Enrolled in "${c.name}"`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            color: "text-emerald-400",
          },
          ...log,
        ]);
      }
    });

    prev.forEach((p) => {
      if (!curr.some((c) => c.id === p.id)) {
        setActivityLog((log) => [
          {
            id: Date.now() + Math.random(),
            icon: "🗑️",
            text: `Unenrolled from "${p.name}"`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            color: "text-rose-400",
          },
          ...log,
        ]);
      }
    });

    // Track progress/section changes per course
    curr.forEach((c) => {
      const prevC = prev.find((p) => p.id === c.id);
      if (prevC) {
        if (c.nextItem !== prevC.nextItem) {
          setActivityLog((log) => [
            {
              id: Date.now() + Math.random(),
              icon: "▶️",
              text: `Moved to section "${c.nextItem}" in "${c.name}"`,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              color: "text-blue-400",
            },
            ...log,
          ]);
        }
        if (c.progress === 100 && prevC.progress < 100) {
          setActivityLog((log) => [
            {
              id: Date.now() + Math.random(),
              icon: "🎉",
              text: `Completed "${c.name}"!`,
              time: new Date().toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              color: "text-emerald-300",
            },
            ...log,
          ]);
        }
      }
    });

    prevEnrolled.current = curr;
  }, [enrolledCourses]);

  // Track material uploads → activity log
  useEffect(() => {
    if (!isMounted.current) {
      prevMaterials.current = materials;
      isMounted.current = true; // set after both baselines are set
      return;
    }

    const prev = prevMaterials.current;
    const curr = materials;

    curr.forEach((m) => {
      if (!prev.some((p) => p.id === m.id)) {
        setActivityLog((log) => [
          {
            id: Date.now() + Math.random(),
            icon: "📎",
            text: `Uploaded "${m.fileName}" — pending mentor review`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            color: "text-amber-400",
          },
          ...log,
        ]);
      }
      // Material status change (approved/rejected)
      const prevM = prev.find((p) => p.id === m.id);
      if (prevM && m.status !== prevM.status) {
        const icon =
          m.status === "approved"
            ? "✅"
            : m.status === "rejected"
              ? "❌"
              : "⏳";
        const color =
          m.status === "approved"
            ? "text-emerald-400"
            : m.status === "rejected"
              ? "text-rose-400"
              : "text-amber-400";
        setActivityLog((log) => [
          {
            id: Date.now() + Math.random(),
            icon,
            text: `"${m.fileName}" was ${m.status} by mentor`,
            time: new Date().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
            color,
          },
          ...log,
        ]);
      }
    });

    prevMaterials.current = curr;
  }, [materials]);

  // Sync active tab from URL hash
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && SIDEBAR_LINKS.some((l) => l.id === hash)) setActiveLink(hash);
  }, [location.hash]);

  const handleSelectSection = (id) => {
    setActiveLink(id);
    navigate(`/std-dashboard#${id}`, { replace: true });
  };

  const openUndoDialog = (course) =>
    setUndoTarget({ id: course.id, name: course.name });
  const closeUndoDialog = () => setUndoTarget(null);
  const confirmUndo = () => {
    if (undoTarget) {
      undoEnrollment(currentYearId, undoTarget.id);
      closeUndoDialog();
    }
  };

  const handleEnroll = (course) => {
    const credits = course.credits || 3;
    const planned = sumEnrolledCredits(enrolledCourses);
    if (planned + credits > totalCredits) {
      setLimitDialogOpen(true);
      return;
    }
    enrollCourse(currentYearId, {
      id: course.id,
      name: course.name,
      code: course.code || "ELEC",
      credits,
    });
  };

  // Dark mode classes
  const bg = darkMode ? "bg-slate-900" : "bg-slate-900";
  const sidebar = darkMode
    ? "bg-slate-950 border-slate-800"
    : "bg-slate-900 border-slate-700";
  const cardBg = darkMode
    ? "bg-slate-800/60 border-slate-700"
    : "bg-slate-800/50 border-slate-700";
  const courseTxt = darkMode ? "text-slate-300" : "text-white";
  const hoverLink = darkMode
    ? "hover:bg-slate-700 hover:text-white"
    : "hover:bg-slate-800 hover:text-white";

  return (
    <div className={`flex min-h-screen ${bg}`}>
      {/* Sidebar */}
      <aside className={`flex w-56 flex-col border-r ${sidebar}`}>
        <div className="flex flex-col gap-0.5 border-b border-slate-700 p-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="EduHub" className="h-8 w-8 object-contain" />
            <span className="font-semibold text-white">EduHub Student</span>
          </div>
          <p className="pl-10 text-[10px] font-medium uppercase tracking-wide text-slate-500">
            Year {currentYearId} ·{" "}
            {activeYear?.meta?.title?.split(":")[0] || "Current"}
          </p>
        </div>
        <nav className="flex-1 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">
            MAIN MENU
          </p>
          <ul className="space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleSelectSection(link.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeLink === link.id
                      ? "bg-slate-700 text-white"
                      : `text-slate-300 ${hoverLink}`
                  }`}
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
              {dbUser?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <span className="text-sm font-medium text-white">{firstName}</span>
            <button
              onClick={() => navigate("/academic-year")}
              className="ml-auto text-slate-400 hover:text-white"
              aria-label="Back"
            >
              ←
            </button>
          </div>
        </div>
      </aside>

      {/* Dialogs */}
      <ConfirmDialog
        open={Boolean(undoTarget)}
        title="Undo enrollment?"
        message={
          undoTarget
            ? `Are you sure you want to undo enrollment for "${undoTarget.name}"?`
            : ""
        }
        confirmLabel="Undo"
        cancelLabel="Cancel"
        onConfirm={confirmUndo}
        onCancel={closeUndoDialog}
      />
      <ConfirmDialog
        open={limitDialogOpen}
        title="Credit limit reached"
        message={`You cannot enroll in more courses because your credits have reached the ${totalCredits}-credit limit for this year.`}
        confirmLabel="OK"
        showCancel={false}
        onConfirm={() => setLimitDialogOpen(false)}
        onCancel={() => setLimitDialogOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <input
            type="search"
            placeholder="Search..."
            className="mb-6 w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* ── Dashboard ── */}
          {activeLink === "dashboard" && (
            <section>
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Welcome back, {firstName} 👋
              </h1>
              <p className="mt-1 text-slate-400">
                Here&apos;s what needs your attention today — academic year{" "}
                {currentYearId}.
              </p>

              {/* Stats */}
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  {
                    label: "Enrolled Courses",
                    value: String(enrolledCourses.length),
                    sub: "active",
                    color: "text-emerald-400",
                  },
                  {
                    label: "Materials Uploaded",
                    value: String(materials.length),
                    sub: "total",
                    color: "text-emerald-400",
                  },
                  {
                    label: "In Progress",
                    value: String(
                      enrolledCourses.filter(
                        (c) => c.progress > 0 && c.progress < 100,
                      ).length,
                    ),
                    sub: "courses",
                    color: "text-amber-400",
                  },
                  {
                    label: "Credits Earned",
                    value: earnedCredits,
                    sub: `of ${totalCredits}`,
                    color: "text-blue-400",
                  },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-slate-700 bg-slate-800/50 p-5"
                  >
                    <p className="text-sm font-medium text-slate-400">
                      {stat.label}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-white">
                      {stat.value}
                    </p>
                    <p className={`mt-1 text-xs ${stat.color}`}>{stat.sub}</p>
                  </div>
                ))}
              </div>

              {/* Activity Log */}
              <div className="mt-8">
                <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">
                  Recent Activity
                </h2>
                {activityLog.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-sm text-slate-500">
                      No activity yet. Enroll in a course or upload materials to
                      see your log here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activityLog.slice(0, 10).map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3"
                      >
                        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-700 text-base">
                          {entry.icon}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium ${entry.color}`}>
                            {entry.text}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {entry.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── My Courses ── */}
          {activeLink === "my-courses" && (
            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    My Courses
                  </h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Year {currentYearId}: enrolled courses and open seats.
                  </p>
                </div>
                <span className="text-sm font-medium text-slate-400">
                  {earnedCredits} / {totalCredits} Credits
                </span>
              </div>

              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Enrolled Courses
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {enrolledCourses.length === 0 ? (
                  <div className="col-span-2 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">
                      No courses enrolled. Enroll from the Available section
                      below.
                    </p>
                  </div>
                ) : (
                  enrolledCourses.map((course) => (
                    <div
                      key={course.id}
                      className={`rounded-xl border ${cardBg} p-5`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className={`font-semibold ${courseTxt}`}>
                            {course.name}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {course.code} • {course.credits} Credits
                          </p>
                        </div>
                        <span className="text-sm font-medium text-slate-300">
                          {course.progress}% Complete
                        </span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${course.progress}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400">
                          Next:{" "}
                          <span className="text-slate-300">
                            {course.nextItem}
                          </span>
                        </p>
                        <button
                          type="button"
                          className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700"
                          onClick={() => openUndoDialog(course)}
                        >
                          Undo
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Available to Enroll
                </h3>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300"
                  onClick={() => handleSelectSection("explore-courses")}
                >
                  View All Electives
                </button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <div
                    key={course.id}
                    className={`rounded-xl border ${cardBg} p-5`}
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {course.type}
                    </p>
                    <h3 className={`mt-1 text-sm font-semibold ${courseTxt}`}>
                      {course.name}
                    </h3>
                    <p className="mt-1 text-xs text-slate-400">
                      {course.length} • {course.schedule}
                    </p>
                    <p className="mt-2 text-xs text-slate-400">
                      Instructor:{" "}
                      <span className="font-medium text-slate-300">
                        {course.instructor}
                      </span>
                    </p>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      onClick={() => handleEnroll(course)}
                    >
                      Enroll
                    </button>
                  </div>
                ))}
                {availableCourses.length === 0 && (
                  <div className="col-span-3 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">
                      No courses available. You may have reached your credit
                      limit.
                    </p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Upload Material ── */}
          {activeLink === "upload-material" && (
            <section>
              <h2 className="text-lg font-semibold text-white">
                Upload Material
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Materials are sent to your mentor for review before being
                published.
              </p>
              {enrolledCourses.length === 0 ? (
                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <p className="text-slate-400">
                    No courses enrolled.{" "}
                    <button
                      onClick={() => navigate("/academic-year")}
                      className="text-blue-400 hover:underline"
                    >
                      Enroll in courses
                    </button>{" "}
                    first to upload materials.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((course) => {
                      const courseMaterials = materials.filter(
                        (m) => m.courseId === course.id,
                      );
                      const pendingCount = courseMaterials.filter(
                        (m) => m.status === "pending",
                      ).length;
                      return (
                        <button
                          key={course.id}
                          type="button"
                          onClick={() =>
                            navigate(
                              `/academic-year/${currentYearId}/course/${course.id}?upload=1`,
                            )
                          }
                          className="rounded-xl border border-slate-700 bg-slate-800/50 p-5 text-left transition hover:border-blue-500/60 hover:bg-slate-800"
                        >
                          <h3 className={`font-semibold ${courseTxt}`}>
                            {course.name}
                          </h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {course.code} • {courseMaterials.length} material
                            {courseMaterials.length !== 1 ? "s" : ""}
                          </p>
                          {pendingCount > 0 && (
                            <p className="mt-1 text-xs text-amber-400">
                              ⏳ {pendingCount} pending review
                            </p>
                          )}
                          <p className="mt-3 text-xs font-medium text-blue-400">
                            Open course → upload by section
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {/* Materials list with status */}
                  {materials.length > 0 && (
                    <div className="mt-8">
                      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Your Uploaded Materials
                      </h3>
                      <div className="space-y-2">
                        {materials.map((m) => (
                          <div
                            key={m.id}
                            className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {m.type === "video"
                                  ? "🎬"
                                  : m.type === "pdf"
                                    ? "📄"
                                    : "📎"}
                              </span>
                              <div>
                                <p
                                  className={`text-sm font-medium ${courseTxt}`}
                                >
                                  {m.fileName}
                                </p>
                                <p className="text-xs text-slate-500">
                                  {m.courseName}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-medium ${STATUS_COLOR[m.status] || "text-slate-400"}`}
                              >
                                {STATUS_LABEL[m.status] || m.status}
                              </span>
                              <button
                                type="button"
                                className="text-xs text-rose-400 hover:text-rose-300"
                                onClick={() => removeMaterial(m.id)}
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </section>
          )}

          {/* ── Recent Materials ── */}
          {activeLink === "recent-materials" && (
            <section>
              <h2 className="text-lg font-semibold text-white">
                Recent Materials
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Status of your uploaded materials.
              </p>
              <div className="mt-6 space-y-3">
                {materials.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">No materials yet.</p>
                  </div>
                ) : (
                  materials.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">
                        🔔
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-sm ${courseTxt}`}>
                          Uploaded to <strong>{m.courseName}</strong> —{" "}
                          <span
                            className={
                              STATUS_COLOR[m.status] || "text-slate-400"
                            }
                          >
                            {STATUS_LABEL[m.status] || m.status}
                          </span>
                        </p>
                        <p className="mt-0.5 text-slate-400">{m.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {new Date(m.uploadDate).toLocaleString()}
                        </p>
                        <button
                          type="button"
                          className="ml-0 mt-2 text-xs text-rose-400 hover:text-rose-300"
                          onClick={() => removeMaterial(m.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* ── Explore ── */}
          {activeLink === "explore-courses" && (
            <section>
              <h2 className="text-lg font-semibold text-white">
                Open Courses — Data Science
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Select a course specialization to finalize your enrollment.
              </p>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {openCourses
                  .filter((c) => !enrolledCourses.some((e) => e.id === c.id))
                  .map((course) => (
                    <article
                      key={course.id}
                      className="flex flex-col rounded-2xl border border-slate-700 bg-slate-800/60 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="rounded-full bg-slate-700 px-2 py-0.5 font-semibold uppercase tracking-wide">
                          {course.level}
                        </span>
                        <span>{course.duration}</span>
                      </div>
                      <h2 className={`text-sm font-semibold ${courseTxt}`}>
                        {course.name}
                      </h2>
                      <p className="mt-2 text-xs text-slate-400">
                        Instructor:{" "}
                        <span className="font-medium text-slate-300">
                          {course.instructor}
                        </span>
                      </p>
                      <button
                        type="button"
                        className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                        onClick={() => handleEnroll(course)}
                      >
                        Confirm Enrollment
                      </button>
                    </article>
                  ))}
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
