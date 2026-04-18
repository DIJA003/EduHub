import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses, sumEnrolledCredits } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import { useFirebaseUpload } from "../hooks/useFirebaseUpload";
import {
  Badge,
  BtnPrimary,
  BtnSecondary,
  BtnDanger,
  FormGroup,
  FormInput,
  FormSelect,
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  StatsCard,
  tw,
} from "../components/admin/adminUtils";
import StatsCardComp from "../components/admin/StatsCard";
import ConfirmDialog from "../components/common/ConfirmDialog";
import logo from "../assets/images/logo.png";
import { enrollmentApi2, studentMaterialsApi } from "../services/api";

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { id: "dashboard", icon: "dashboard", label: "Dashboard" },
  { id: "my-courses", icon: "menu_book", label: "My Courses" },
  { id: "upload-material", icon: "upload_file", label: "Upload Material" },
  { id: "recent-materials", icon: "description", label: "My Materials" },
];

const STATUS_COLOR = {
  pending: "warning",
  approved: "success",
  Active: "success",
  rejected: "danger",
  Rejected: "danger",
};

const STATUS_LABEL = {
  pending: "⏳ Pending review",
  approved: "✅ Approved",
  Active: "✅ Active",
  rejected: "❌ Rejected",
  Rejected: "❌ Rejected",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function StudentDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { dbUser } = useAuth();
  const { years, enrollCourse, undoEnrollment, currentYearId } = useCourses();
  const { materials, removeMaterial, loading: matLoading } = useMaterials();

  const [activeLink, setActiveLink] = useState("dashboard");
  const [undoTarget, setUndoTarget] = useState(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [matSearch, setMatSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");

  const [backendEnrollments, setBackendEnrollments] = useState([]);
  const [enrollLoading, setEnrollLoading] = useState(true);

  const [uploadModal, setUploadModal] = useState(false);
  const [uploadForm, setUploadForm] = useState({
    courseId: "",
    sectionLabel: "",
    title: "",
  });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDrag, setUploadDrag] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const uploadFileRef = useRef(null);

  const {
    upload,
    uploading,
    progress: uploadProgress,
    error: firebaseUploadError,
    reset: resetUpload,
  } = useFirebaseUpload();

  // Activity log
  const ACTIVITY_KEY = "eduhub-activity-log-v2";
  const [activityLog, setActivityLog] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(ACTIVITY_KEY) || "[]");
    } catch {
      return [];
    }
  });
  const prevEnrolledRef = useRef([]);
  const isMountedRef = useRef(false);

  // Derived data
  const activeYear = years[currentYearId];
  const enrolledCourses = activeYear?.enrolled || [];
  const availableCourses = activeYear?.available || [];
  const earnedCredits = activeYear?.meta?.earnedCredits ?? 0;
  const totalCredits = activeYear?.meta?.totalCredits ?? 42;
  const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "Student";

  // Load real enrollments from backend
  useEffect(() => {
    const loadEnrollments = async () => {
      setEnrollLoading(true);
      try {
        const res = await enrollmentApi2.getAll();
        setBackendEnrollments(res.data || []);
      } catch (err) {
        console.warn("Failed to load enrollments:", err.message);
      } finally {
        setEnrollLoading(false);
      }
    };
    loadEnrollments();
  }, []);

  // Persist activity log
  useEffect(() => {
    try {
      localStorage.setItem(
        ACTIVITY_KEY,
        JSON.stringify(activityLog.slice(0, 50)),
      );
    } catch {}
  }, [activityLog]);

  // Track enrollment changes
  useEffect(() => {
    if (!isMountedRef.current) {
      prevEnrolledRef.current = enrolledCourses;
      isMountedRef.current = true;
      return;
    }
    const prev = prevEnrolledRef.current;
    const curr = enrolledCourses;
    curr.forEach((c) => {
      if (!prev.some((p) => p.id === c.id)) {
        addActivity("📚", `Enrolled in "${c.name}"`, "text-emerald-400");
      }
    });
    prev.forEach((p) => {
      if (!curr.some((c) => c.id === p.id)) {
        addActivity("🗑️", `Unenrolled from "${p.name}"`, "text-rose-400");
      }
    });
    prevEnrolledRef.current = curr;
  }, [enrolledCourses]);

  const addActivity = (icon, text, color) => {
    setActivityLog((log) => [
      {
        id: Date.now() + Math.random(),
        icon,
        text,
        color,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...log,
    ]);
  };

  // Hash navigation
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && NAV_ITEMS.some((l) => l.id === hash)) setActiveLink(hash);
  }, [location.hash]);

  const handleNav = (id) => {
    setActiveLink(id);
    navigate(`/std-dashboard#${id}`, { replace: true });
  };

  const handleEnroll = (course) => {
    const credits = course.credits || 3;
    if (sumEnrolledCredits(enrolledCourses) + credits > totalCredits) {
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

  // Upload handlers
  const openUploadModal = () => {
    setUploadForm({ courseId: "", sectionLabel: "", title: "" });
    setUploadFile(null);
    setUploadError(null);
    resetUpload();
    setUploadModal(true);
  };

  const handleUploadFile = (file) => {
    if (file) {
      setUploadFile(file);
      setUploadForm((f) => ({
        ...f,
        title: f.title || file.name.replace(/\.[^.]+$/, ""),
      }));
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile || !uploadForm.courseId || !uploadForm.title.trim()) {
      setUploadError(
        "Please select a file, choose a course, and enter a title.",
      );
      return;
    }
    setUploadError(null);
    try {
      const course = enrolledCourses.find((c) => c.id === uploadForm.courseId);
      const material = await upload({
        file: uploadFile,
        courseId: course?.mongoId || uploadForm.courseId,
        sectionId: "",
        sectionLabel: uploadForm.sectionLabel || "",
        yearId: currentYearId || "",
        title: uploadForm.title,
      });
      addActivity(
        "📎",
        `Uploaded "${material.title}" — pending mentor review`,
        "text-amber-400",
      );
      setUploadModal(false);
      resetUpload();
      // Refresh materials
      const res = await studentMaterialsApi.getAll();
      // materials context will auto-update on next render via useMaterials
    } catch (err) {
      setUploadError(err.message || "Upload failed. Please try again.");
    }
  };

  // Filtered data
  const filteredMaterials = materials.filter(
    (m) =>
      m.fileName?.toLowerCase().includes(matSearch.toLowerCase()) ||
      m.courseName?.toLowerCase().includes(matSearch.toLowerCase()),
  );

  const filteredEnrolled = enrolledCourses.filter(
    (c) =>
      c.name?.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code?.toLowerCase().includes(courseSearch.toLowerCase()),
  );

  // Stats
  const inProgressCount = enrolledCourses.filter(
    (c) => c.progress > 0 && c.progress < 100,
  ).length;
  const completedCount = enrolledCourses.filter(
    (c) => c.progress >= 100,
  ).length;
  const pendingMatsCount = materials.filter(
    (m) => m.status === "pending",
  ).length;

  const statCards = [
    {
      title: "Enrolled Courses",
      value: String(enrolledCourses.length),
      icon: "📚",
      iconColor: "blue",
      delta: "active",
      deltaType: "up",
    },
    {
      title: "In Progress",
      value: String(inProgressCount),
      icon: "▶️",
      iconColor: "amber",
      delta: "courses",
      deltaType: "up",
    },
    {
      title: "Completed",
      value: String(completedCount),
      icon: "🎓",
      iconColor: "green",
      delta: "courses",
      deltaType: "up",
    },
    {
      title: "Materials Uploaded",
      value: String(materials.length),
      icon: "📎",
      iconColor: "info",
      delta: `${pendingMatsCount} pending`,
      deltaType: pendingMatsCount > 0 ? "down" : "up",
    },
  ];

  return (
    <div
      className="flex h-screen overflow-hidden font-sans"
      style={{ background: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="w-[236px] flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderRight: "1px solid var(--border)",
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-3 px-5 py-5"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div
            className="w-[34px] h-[34px] rounded-sm flex items-center justify-center text-white flex-shrink-0 bg-accent"
            style={{ boxShadow: "0 4px 14px rgba(36,99,235,0.35)" }}
          >
            <span className="material-symbols-outlined text-[18px]">
              auto_stories
            </span>
          </div>
          <div>
            <h2
              className="text-[14.5px] font-bold tracking-tight leading-none"
              style={{ color: "var(--text-primary)" }}
            >
              Edu<span style={{ color: "var(--accent-light)" }}>Hub</span>
            </h2>
            <p
              className="text-[11px] mt-0.5 font-medium"
              style={{ color: "var(--text-muted)" }}
            >
              Student Portal
            </p>
          </div>
        </div>

        <p
          className="text-[10px] font-bold uppercase tracking-[0.1em] px-4 pt-4 pb-2"
          style={{ color: "var(--text-muted)" }}
        >
          Main Menu
        </p>

        <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
          {NAV_ITEMS.map(({ id, icon, label }) => (
            <button
              key={id}
              onClick={() => handleNav(id)}
              className="flex items-center gap-3 px-3 py-[9px] rounded-sm text-[13.5px] font-medium border-l-2 whitespace-nowrap overflow-hidden transition-all duration-150 text-left"
              style={
                activeLink === id
                  ? {
                      background: "var(--accent-glow)",
                      color: "var(--accent-light)",
                      borderLeftColor: "var(--accent-light)",
                      fontWeight: 600,
                    }
                  : {
                      color: "var(--text-secondary)",
                      borderLeftColor: "transparent",
                    }
              }
              onMouseEnter={(e) => {
                if (activeLink !== id) {
                  e.currentTarget.style.background = "var(--bg-hover)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (activeLink !== id) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }
              }}
            >
              <span className="material-symbols-outlined text-[16px] w-5 text-center flex-shrink-0">
                {icon}
              </span>
              {label}
            </button>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-3" style={{ borderTop: "1px solid var(--border)" }}>
          <div
            className="flex items-center gap-3 px-2 py-2 rounded-sm transition-colors duration-150 cursor-pointer"
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--bg-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
            onClick={() => navigate("/profile")}
          >
            <div
              className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ border: "2px solid var(--border)" }}
            >
              {dbUser?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div className="flex-1 min-w-0">
              <p
                className="text-[13.5px] font-semibold truncate"
                style={{ color: "var(--text-primary)" }}
              >
                {dbUser?.name || "Student"}
              </p>
              <p
                className="text-[11px] truncate"
                style={{ color: "var(--text-muted)" }}
              >
                Year {currentYearId} · Student
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/academic-year");
              }}
              title="Back to Academic Year"
              className="w-6 h-6 flex items-center justify-center rounded-sm transition-all duration-150"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--accent-light)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--text-muted)")
              }
            >
              <span className="material-symbols-outlined text-[16px]">
                home
              </span>
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Top navbar */}
        <header
          className="h-14 flex items-center justify-between px-7 gap-4 flex-shrink-0 z-10"
          style={{
            background: "var(--bg-surface)",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <div className="relative flex-1 max-w-[300px]">
            <span
              className="material-symbols-outlined absolute left-[10px] top-1/2 -translate-y-1/2 text-[14px] pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              search
            </span>
            <input
              className="w-full pl-8 pr-3 py-[7px] rounded-sm text-[12.5px] outline-none"
              style={{
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                color: "var(--text-primary)",
              }}
              placeholder="Search..."
              onFocus={(e) => {
                e.target.style.borderColor = "var(--border-focus)";
                e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "var(--border)";
                e.target.style.boxShadow = "none";
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            {/* <BtnPrimary onClick={openUploadModal}>
              <span className="material-symbols-outlined text-[14px]">
                upload_file
              </span>
              Upload Material
            </BtnPrimary> */}
            <div
              className="w-px h-[22px]"
              style={{ background: "var(--border)" }}
            />
            <div
              title={dbUser?.name || "Student"}
              className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-150 hover:scale-105"
              style={{ border: "2px solid var(--border)" }}
              onClick={() => navigate("/profile")}
            >
              {dbUser?.name?.[0]?.toUpperCase() || "S"}
            </div>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto overflow-x-hidden p-7 px-8"
          style={{ background: "var(--bg-base)" }}
        >
          {/* ── DASHBOARD ── */}
          {activeLink === "dashboard" && (
            <div className="space-y-6">
              <PageHeader
                title={`Welcome back, ${firstName} 👋`}
                subtitle={`Year ${currentYearId} · Here's what's happening with your studies today.`}
                actions={
                  <BtnPrimary onClick={openUploadModal}>
                    <span className="material-symbols-outlined text-[14px]">
                      upload_file
                    </span>
                    Upload Material
                  </BtnPrimary>
                }
              />

              {/* Stats */}
              <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
                {statCards.map((c) => (
                  <StatsCardComp key={c.title} {...c} />
                ))}
              </div>

              {/* Credit progress */}
              <div
                className="rounded-lg p-5"
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3
                    className="text-[13.5px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Credit Progress — Year {currentYearId}
                  </h3>
                  <span
                    className="text-[13px] font-mono"
                    style={{ color: "var(--accent-light)" }}
                  >
                    {earnedCredits} / {totalCredits} credits
                  </span>
                </div>
                <div
                  className="h-2.5 rounded-full overflow-hidden"
                  style={{ background: "var(--bg-card)" }}
                >
                  <div
                    className="h-full rounded-full transition-[width] duration-700"
                    style={{
                      width: `${Math.min(100, Math.round((earnedCredits / totalCredits) * 100))}%`,
                      background: "var(--accent)",
                    }}
                  />
                </div>
                <p
                  className="text-[11px] mt-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {Math.min(
                    100,
                    Math.round((earnedCredits / totalCredits) * 100),
                  )}
                  % of year credits earned
                </p>
              </div>

              {/* Recent Activity */}
              <TableWrap
                toolbar={
                  <span
                    className="text-[13.5px] font-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    Recent Activity
                  </span>
                }
              >
                {activityLog.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No activity yet"
                    description="Enroll in courses or upload materials to see your activity log here."
                  />
                ) : (
                  <table className="w-full">
                    <tbody>
                      {activityLog.slice(0, 8).map((entry) => (
                        <tr
                          key={entry.id}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                          style={{
                            borderBottom: "1px solid var(--border-light)",
                          }}
                        >
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-[18px]">{entry.icon}</span>
                              <p
                                className={`text-[13px] font-medium ${entry.color}`}
                              >
                                {entry.text}
                              </p>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <span
                              className="text-[12px]"
                              style={{ color: "var(--text-muted)" }}
                            >
                              {entry.time}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TableWrap>
            </div>
          )}

          {/* ── MY COURSES ── */}
          {activeLink === "my-courses" && (
            <div className="space-y-6">
              <PageHeader
                title="My Courses"
                subtitle={`Year ${currentYearId}: enrolled courses and available seats. ${earnedCredits}/${totalCredits} credits.`}
              />

              {/* Enrolled */}
              <TableWrap
                toolbar={
                  <>
                    <span
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Enrolled Courses ({filteredEnrolled.length})
                    </span>
                    <TableSearch
                      value={courseSearch}
                      onChange={(e) => setCourseSearch(e.target.value)}
                      placeholder="Search courses…"
                    />
                  </>
                }
              >
                {filteredEnrolled.length === 0 ? (
                  <EmptyState
                    icon="📚"
                    title="No enrolled courses"
                    description="Enroll from the available courses below."
                  />
                ) : (
                  <table className="w-full border-collapse">
                    <thead style={{ background: "var(--bg-card)" }}>
                      <tr>
                        {[
                          "Course",
                          "Code",
                          "Credits",
                          "Progress",
                          "Next Up",
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
                      {filteredEnrolled.map((course) => (
                        <tr
                          key={course.id}
                          className={tw.trHover}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
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
                            <button
                              className="font-semibold hover:underline text-left"
                              style={{ color: "var(--accent-light)" }}
                              onClick={() =>
                                navigate(
                                  `/academic-year/${currentYearId}/course/${course.id}`,
                                )
                              }
                            >
                              {course.name}
                            </button>
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge variant="blue" mono>
                              {course.code}
                            </Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {course.credits} cr
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className="flex-1 h-1.5 rounded-full overflow-hidden"
                                style={{
                                  background: "var(--bg-card)",
                                  minWidth: 60,
                                }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${course.progress}%`,
                                    background:
                                      course.progress >= 100
                                        ? "var(--success)"
                                        : "var(--accent)",
                                  }}
                                />
                              </div>
                              <span
                                className="text-[12px] font-mono"
                                style={{
                                  color:
                                    course.progress >= 100
                                      ? "var(--success)"
                                      : "var(--text-secondary)",
                                }}
                              >
                                {course.progress}%
                              </span>
                            </div>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {course.progress >= 100
                              ? "✓ Completed"
                              : course.nextItem}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <div className="flex items-center justify-end gap-2">
                              <BtnSecondary
                                className="!py-1 !px-3 !text-[12px]"
                                onClick={() =>
                                  navigate(
                                    `/academic-year/${currentYearId}/course/${course.id}`,
                                  )
                                }
                              >
                                Open
                              </BtnSecondary>
                              <BtnDanger
                                className="!py-1 !px-3 !text-[12px]"
                                onClick={() =>
                                  setUndoTarget({
                                    id: course.id,
                                    name: course.name,
                                  })
                                }
                              >
                                Unenroll
                              </BtnDanger>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </TableWrap>

              {/* Available */}
              {availableCourses.length > 0 && (
                <TableWrap
                  toolbar={
                    <span
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Available to Enroll ({availableCourses.length})
                    </span>
                  }
                >
                  <table className="w-full border-collapse">
                    <thead style={{ background: "var(--bg-card)" }}>
                      <tr>
                        {[
                          "Course",
                          "Code",
                          "Credits",
                          "Schedule",
                          "Instructor",
                          "",
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
                      {availableCourses.map((course) => (
                        <tr
                          key={course.id}
                          className={tw.trHover}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
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
                              fontWeight: 500,
                            }}
                          >
                            {course.name}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge variant="blue" mono>
                              {course.code}
                            </Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-secondary)",
                            }}
                          >
                            {course.credits} cr
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {course.schedule || "—"}
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {course.instructor || "TBA"}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <div className="flex justify-end">
                              <BtnPrimary
                                className="!py-1 !px-3 !text-[12px]"
                                onClick={() => handleEnroll(course)}
                              >
                                Enroll
                              </BtnPrimary>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </div>
          )}

          {/* ── UPLOAD MATERIAL ── */}
          {activeLink === "upload-material" && (
            <div className="space-y-6">
              <PageHeader
                title="Upload Material"
                subtitle="Materials are sent to your course mentor for review before being published."
                actions={
                  <BtnPrimary onClick={openUploadModal}>
                    <span className="material-symbols-outlined text-[14px]">
                      upload_file
                    </span>
                    New Upload
                  </BtnPrimary>
                }
              />

              {enrolledCourses.length === 0 ? (
                <EmptyState
                  icon="📚"
                  title="No courses enrolled"
                  description="You need to enroll in courses before uploading materials."
                />
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {enrolledCourses.map((course) => {
                    const courseMats = materials.filter(
                      (m) =>
                        m.courseId === course.id ||
                        m.courseId === course.mongoId,
                    );
                    const pendingCount = courseMats.filter(
                      (m) => m.status === "pending",
                    ).length;
                    return (
                      <div
                        key={course.id}
                        className="rounded-lg p-5 transition-all duration-200 hover:-translate-y-px cursor-pointer"
                        style={{
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.borderColor = "var(--accent)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0,0,0,0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.borderColor = "var(--border)";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                        onClick={() => {
                          setUploadForm({
                            courseId: course.id,
                            sectionLabel: "",
                            title: "",
                          });
                          setUploadFile(null);
                          setUploadError(null);
                          resetUpload();
                          setUploadModal(true);
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div
                            className="w-10 h-10 rounded-sm flex items-center justify-center"
                            style={{ background: "var(--accent-glow)" }}
                          >
                            <span
                              className="material-symbols-outlined text-[20px]"
                              style={{ color: "var(--accent-light)" }}
                            >
                              menu_book
                            </span>
                          </div>
                          {pendingCount > 0 && (
                            <span
                              className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                              style={{ background: "var(--warning)" }}
                            >
                              {pendingCount} pending
                            </span>
                          )}
                        </div>
                        <p
                          className="text-[14px] font-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {course.name}
                        </p>
                        <p
                          className="text-[12px] mt-0.5"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {course.code} · {courseMats.length} material
                          {courseMats.length !== 1 ? "s" : ""}
                        </p>
                        <p
                          className="text-[12px] mt-3 font-semibold"
                          style={{ color: "var(--accent-light)" }}
                        >
                          Click to upload →
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Materials uploaded per course */}
              {materials.length > 0 && (
                <TableWrap
                  toolbar={
                    <span
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Your Uploaded Materials ({materials.length})
                    </span>
                  }
                >
                  <table className="w-full border-collapse">
                    <thead style={{ background: "var(--bg-card)" }}>
                      <tr>
                        {[
                          "Material",
                          "Course",
                          "Type",
                          "Status",
                          "Uploaded",
                          "",
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
                      {materials.map((m) => (
                        <tr
                          key={m.id}
                          className={tw.trHover}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
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
                            <div>
                              <span className="font-medium">{m.fileName}</span>
                              {m.fileUrl &&
                                (m.status === "approved" ||
                                  m.status === "Active") && (
                                  <a
                                    href={m.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-[11px] mt-0.5"
                                    style={{ color: "var(--accent-light)" }}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    View file ↗
                                  </a>
                                )}
                            </div>
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge variant="blue">{m.courseName || "—"}</Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-secondary)",
                              fontSize: 12,
                            }}
                          >
                            {m.type || "File"}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge
                              variant={STATUS_COLOR[m.status] || "default"}
                            >
                              {STATUS_LABEL[m.status] || m.status}
                            </Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {timeAgo(m.uploadDate)}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <div className="flex justify-end">
                              <BtnDanger
                                className="!py-1 !px-2 !text-[12px]"
                                onClick={() => removeMaterial(m.id)}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  delete
                                </span>
                              </BtnDanger>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </TableWrap>
              )}
            </div>
          )}

          {/* ── RECENT MATERIALS ── */}
          {activeLink === "recent-materials" && (
            <div className="space-y-6">
              <PageHeader
                title="My Materials"
                subtitle="Track the status of all your uploaded materials."
              />
              <TableWrap
                toolbar={
                  <>
                    <span
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      All Materials ({filteredMaterials.length})
                    </span>
                    <TableSearch
                      value={matSearch}
                      onChange={(e) => setMatSearch(e.target.value)}
                      placeholder="Search materials…"
                    />
                  </>
                }
              >
                {matLoading ? (
                  <div
                    className="flex items-center justify-center py-16"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <span className="material-symbols-outlined animate-spin mr-2">
                      progress_activity
                    </span>
                    Loading…
                  </div>
                ) : filteredMaterials.length === 0 ? (
                  <EmptyState
                    icon="📋"
                    title="No materials yet"
                    description="Upload materials from the Upload tab."
                  />
                ) : (
                  <table className="w-full border-collapse">
                    <thead style={{ background: "var(--bg-card)" }}>
                      <tr>
                        {[
                          "Material",
                          "Course",
                          "Section",
                          "Status",
                          "Feedback",
                          "Uploaded",
                          "",
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
                      {filteredMaterials.map((m) => (
                        <tr
                          key={m.id}
                          className={tw.trHover}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--bg-hover)")
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
                            <div>
                              <span className="font-medium">{m.fileName}</span>
                              {m.fileUrl &&
                                (m.status === "approved" ||
                                  m.status === "Active") && (
                                  <a
                                    href={m.fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block text-[11px] mt-0.5"
                                    style={{ color: "var(--accent-light)" }}
                                  >
                                    View ↗
                                  </a>
                                )}
                            </div>
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge variant="blue">{m.courseName || "—"}</Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {m.sectionLabel || "—"}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <Badge
                              variant={STATUS_COLOR[m.status] || "default"}
                            >
                              {STATUS_LABEL[m.status] || m.status}
                            </Badge>
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                              maxWidth: 180,
                            }}
                          >
                            {m.mentorFeedback || "—"}
                          </td>
                          <td
                            className={tw.td}
                            style={{
                              borderBottomColor: "var(--border-light)",
                              color: "var(--text-muted)",
                              fontSize: 12,
                            }}
                          >
                            {timeAgo(m.uploadDate)}
                          </td>
                          <td
                            className={tw.td}
                            style={{ borderBottomColor: "var(--border-light)" }}
                          >
                            <div className="flex justify-end">
                              <BtnDanger
                                className="!py-1 !px-2 !text-[12px]"
                                onClick={() => removeMaterial(m.id)}
                              >
                                <span className="material-symbols-outlined text-[13px]">
                                  delete
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
            </div>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}
      <ConfirmDialog
        open={Boolean(undoTarget)}
        title="Unenroll from course?"
        message={
          undoTarget ? `Remove enrollment from "${undoTarget.name}"?` : ""
        }
        confirmLabel="Unenroll"
        cancelLabel="Cancel"
        onConfirm={() => {
          undoEnrollment(currentYearId, undoTarget.id);
          setUndoTarget(null);
        }}
        onCancel={() => setUndoTarget(null)}
      />
      <ConfirmDialog
        open={limitDialogOpen}
        title="Credit limit reached"
        message={`You cannot enroll in more courses — your credits would exceed the ${totalCredits}-credit limit.`}
        confirmLabel="OK"
        showCancel={false}
        onConfirm={() => setLimitDialogOpen(false)}
        onCancel={() => setLimitDialogOpen(false)}
      />

      {/* ── Upload Modal ── */}
      {uploadModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
          style={{
            background: "rgba(0,0,0,0.72)",
            animation: "overlayIn 0.25s ease",
          }}
          onClick={(e) =>
            e.target === e.currentTarget && !uploading && setUploadModal(false)
          }
        >
          <style>{`@keyframes overlayIn { from { opacity: 0 } to { opacity: 1 } } @keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }`}</style>
          <div
            className="w-full max-w-[520px] rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
              animation: "modalIn 0.2s cubic-bezier(0.34,1.4,0.64,1)",
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
                📎 Upload Material
              </h3>
              {!uploading && (
                <button
                  onClick={() => setUploadModal(false)}
                  className="text-[20px] cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  ×
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-150"
                style={{
                  borderColor: uploadDrag ? "var(--accent)" : "var(--border)",
                  background: uploadDrag
                    ? "var(--accent-glow)"
                    : "var(--bg-card)",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setUploadDrag(true);
                }}
                onDragLeave={() => setUploadDrag(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setUploadDrag(false);
                  handleUploadFile(e.dataTransfer.files[0]);
                }}
                onClick={() => !uploading && uploadFileRef.current?.click()}
              >
                <input
                  ref={uploadFileRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf,video/*,.ppt,.pptx,application/zip,application/x-zip-compressed,image/*"
                  onChange={(e) => handleUploadFile(e.target.files[0])}
                />
                <span
                  className="material-symbols-outlined text-[36px] mb-2 block"
                  style={{ color: "var(--accent-light)" }}
                >
                  cloud_upload
                </span>
                {uploadFile ? (
                  <div>
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--success)" }}
                    >
                      ✅ {uploadFile.name}
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {(uploadFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Drag & drop or click to browse
                    </p>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      PDF, Video, Slides, ZIP, Images — max 200 MB
                    </p>
                  </>
                )}
              </div>

              {/* Upload progress bar */}
              {uploading && (
                <div>
                  <div className="flex justify-between mb-1">
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Uploading to Firebase…
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: "var(--accent-light)" }}
                    >
                      {uploadProgress}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${uploadProgress}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              )}

              {(uploadError || firebaseUploadError) && (
                <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>
                  ⚠️ {uploadError || firebaseUploadError}
                </p>
              )}

              <FormGroup label="Material Title">
                <FormInput
                  value={uploadForm.title}
                  onChange={(e) =>
                    setUploadForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Chapter 3 Notes"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Course">
                  <FormSelect
                    value={uploadForm.courseId}
                    onChange={(e) =>
                      setUploadForm((f) => ({ ...f, courseId: e.target.value }))
                    }
                  >
                    <option value="">Select course…</option>
                    {enrolledCourses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Section / Topic (optional)">
                  <FormInput
                    value={uploadForm.sectionLabel}
                    onChange={(e) =>
                      setUploadForm((f) => ({
                        ...f,
                        sectionLabel: e.target.value,
                      }))
                    }
                    placeholder="e.g. Week 3"
                  />
                </FormGroup>
              </div>

              <p
                className="text-[11.5px]"
                style={{ color: "var(--text-muted)" }}
              >
                📌 Materials are submitted for mentor review before being
                visible to others.
              </p>
            </div>

            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <BtnSecondary
                onClick={() => !uploading && setUploadModal(false)}
                disabled={uploading}
              >
                Cancel
              </BtnSecondary>
              <BtnPrimary
                onClick={handleUploadSubmit}
                disabled={
                  uploading ||
                  !uploadFile ||
                  !uploadForm.title.trim() ||
                  !uploadForm.courseId
                }
              >
                {uploading
                  ? `Uploading ${uploadProgress}%…`
                  : "Submit for Review"}
              </BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
