import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import ConfirmDialog from "../components/common/ConfirmDialog";
import logo from "../assets/images/logo.png";

const SIDEBAR_LINKS = [
  { id: "dashboard",         label: "Dashboard"               },
  { id: "my-courses",        label: "My Courses"              },
  { id: "upload-material",   label: "Upload Material"         },
  { id: "recent-materials",  label: "Recent Materials"        },
];

const openCourses = [
  { id: "foundations-analysis", name: "Foundations of Data Analysis",    level: "Beginner",     duration: "8 weeks",  instructor: "Dr. Sarah Chen"    },
  { id: "ml-specialization",    name: "Machine Learning Specialization", level: "Intermediate", duration: "12 weeks", instructor: "Marcus Vane"       },
  { id: "predictive-business",  name: "Predictive Analytics for Business",level: "Advanced",   duration: "4 weeks",  instructor: "Elena Rodriguez"   },
  { id: "big-data-spark",       name: "Big Data Engineering with Spark", level: "Intermediate", duration: "10 weeks", instructor: "Julian Chen"       },
  { id: "viz-tableau",          name: "Data Visualization with Tableau", level: "Beginner",     duration: "6 weeks",  instructor: "Maya Patel"        },
  { id: "deep-learning",        name: "Deep Learning & Neural Networks", level: "Advanced",     duration: "10 weeks", instructor: "Dr. Robert Smith"  },
];

export default function StudentDashboard() {
  const navigate  = useNavigate();
  const location  = useLocation();

  const { dbUser } = useAuth();

  const { years, enrollCourse, undoEnrollment } = useCourses();
  const { materials, addMaterial, removeMaterial } = useMaterials();

  const [activeLink,     setActiveLink]     = useState("dashboard");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [undoTarget,     setUndoTarget]     = useState(null);
  const [limitDialogOpen,setLimitDialogOpen]= useState(false);
  const fileInputRef = useRef(null);

  const yearTwo        = years["2"];
  const enrolledCourses= yearTwo?.enrolled || [];
  const availableCourses= yearTwo?.available || [];
  const earnedCredits  = yearTwo?.meta?.earnedCredits ?? 0;
  const totalCredits   = yearTwo?.meta?.totalCredits  ?? 21;

  const firstName = dbUser?.name ? dbUser.name.split(" ")[0] : "Student";

  // Sync active tab from URL hash
  useEffect(() => {
    const hash = location.hash.slice(1);
    if (hash && SIDEBAR_LINKS.some((l) => l.id === hash)) setActiveLink(hash);
  }, [location.hash]);

  const handleSelectSection = (id) => {
    setActiveLink(id);
    navigate(`/std-dashboard#${id}`, { replace: true });
  };

  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (!files?.length || !selectedCourse) return;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const type = file.type.startsWith("video/") ? "video"
                 : file.type.startsWith("image/") ? "photo"
                 : file.type === "application/pdf" ? "pdf"
                 : "file";
      addMaterial({ courseId: selectedCourse.id, courseName: selectedCourse.name, fileName: file.name, type });
    }
    e.target.value = "";
  };

  const handleUploadClick = () => { if (selectedCourse) fileInputRef.current?.click(); };

  const openUndoDialog  = (course) => setUndoTarget({ id: course.id, name: course.name });
  const closeUndoDialog = ()       => setUndoTarget(null);
  const confirmUndo     = ()       => { if (undoTarget) { undoEnrollment("2", undoTarget.id); closeUndoDialog(); } };

  const handleEnroll = (course) => {
    const credits = course.credits || 3;
    if (earnedCredits + credits > totalCredits) { setLimitDialogOpen(true); return; }
    enrollCourse("2", { id: course.id, name: course.name, code: course.code || "ELEC", credits });
  };

  return (
    <div className="flex min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-slate-700 bg-slate-900">
        <div className="flex items-center gap-2 border-b border-slate-700 p-4">
          <img src={logo} alt="EduHub" className="h-8 w-8 object-contain" />
          <span className="font-semibold text-white">EduHub Student</span>
        </div>
        <nav className="flex-1 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-slate-400">MAIN MENU</p>
          <ul className="space-y-1">
            {SIDEBAR_LINKS.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => handleSelectSection(link.id)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                    activeLink === link.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white"
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
            >←</button>
          </div>
        </div>
      </aside>

      {/* Dialogs */}
      <ConfirmDialog
        open={Boolean(undoTarget)}
        title="Undo enrollment?"
        message={undoTarget ? `Are you sure you want to undo enrollment for "${undoTarget.name}"?` : ""}
        confirmLabel="Undo" cancelLabel="Cancel"
        onConfirm={confirmUndo} onCancel={closeUndoDialog}
      />
      <ConfirmDialog
        open={limitDialogOpen}
        title="Credit limit reached"
        message="You cannot enroll in more courses because your credits have reached the 21-credit limit for this year."
        confirmLabel="OK" showCancel={false}
        onConfirm={() => setLimitDialogOpen(false)} onCancel={() => setLimitDialogOpen(false)}
      />

      {/* Main */}
      <main className="flex-1 overflow-auto p-6 md:p-8">
        <div className="mx-auto max-w-6xl">
          <input
            type="search" placeholder="Search..."
            className="mb-6 w-full max-w-md rounded-lg border border-slate-700 bg-slate-800 px-4 py-2.5 text-slate-200 placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {/* ── Dashboard ── */}
          {activeLink === "dashboard" && (
            <section>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Welcome back, {firstName} 👋</h1>
              <p className="mt-1 text-slate-400">Here's what needs your attention today.</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { label: "Enrolled Courses",    value: String(enrolledCourses.length), sub: "active",   color: "text-emerald-400" },
                  { label: "Materials Uploaded",  value: String(materials.length),       sub: "total",    color: "text-emerald-400" },
                  { label: "In Progress",         value: String(enrolledCourses.filter((c) => c.progress > 0 && c.progress < 100).length), sub: "courses", color: "text-amber-400" },
                  { label: "Credits Earned",      value: earnedCredits,                  sub: `of ${totalCredits}`, color: "text-blue-400" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`mt-1 text-xs ${stat.color}`}>{stat.sub}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* ── My Courses ── */}
          {activeLink === "my-courses" && (
            <section>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">My Courses</h2>
                  <p className="mt-1 text-sm text-slate-400">Your enrolled courses and available to enroll.</p>
                </div>
                <span className="text-sm font-medium text-slate-400">{earnedCredits} / {totalCredits} Credits</span>
              </div>

              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">Enrolled Courses</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                {enrolledCourses.length === 0 ? (
                  <div className="col-span-2 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">No courses enrolled. Enroll from the Available section below.</p>
                  </div>
                ) : (
                  enrolledCourses.map((course) => (
                    <div key={course.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-white">{course.name}</h3>
                          <p className="text-xs text-slate-400">{course.code} • {course.credits} Credits</p>
                        </div>
                        <span className="text-sm font-medium text-slate-300">{course.progress}% Complete</span>
                      </div>
                      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-700">
                        <div className="h-full rounded-full bg-blue-500" style={{ width: `${course.progress}%` }} />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2">
                        <p className="text-xs text-slate-400">Next: <span className="text-slate-300">{course.nextItem}</span></p>
                        <button
                          type="button"
                          className="rounded-full border border-slate-600 px-3 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-700"
                          onClick={() => openUndoDialog(course)}
                        >Undo</button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-8 flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Available to Enroll</h3>
                <button
                  type="button"
                  className="text-xs font-medium text-blue-400 hover:text-blue-300"
                  onClick={() => handleSelectSection("explore-courses")}
                >View All Electives</button>
              </div>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {availableCourses.map((course) => (
                  <div key={course.id} className="rounded-xl border border-slate-700 bg-slate-800/50 p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{course.type}</p>
                    <h3 className="mt-1 text-sm font-semibold text-white">{course.name}</h3>
                    <p className="mt-1 text-xs text-slate-400">{course.length} • {course.schedule}</p>
                    <p className="mt-2 text-xs text-slate-400">Instructor: <span className="font-medium text-slate-300">{course.instructor}</span></p>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      onClick={() => handleEnroll(course)}
                    >Enroll</button>
                  </div>
                ))}
                {availableCourses.length === 0 && (
                  <div className="col-span-3 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">No courses available. You may have reached your credit limit.</p>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* ── Upload Material ── */}
          {activeLink === "upload-material" && (
            <section>
              <h2 className="text-lg font-semibold text-white">Upload Material</h2>
              <p className="mt-1 text-sm text-slate-400">Click a course card to view its materials and upload new ones.</p>
              {enrolledCourses.length === 0 ? (
                <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                  <p className="text-slate-400">
                    No courses enrolled.{" "}
                    <button onClick={() => navigate("/academic-year")} className="text-blue-400 hover:underline">
                      Enroll in courses
                    </button>{" "}
                    first to upload materials.
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {enrolledCourses.map((course) => {
                      const courseMaterials = materials.filter((m) => m.courseId === course.id);
                      const isSelected = selectedCourse?.id === course.id;
                      return (
                        <button
                          key={course.id}
                          onClick={() => setSelectedCourse(isSelected ? null : course)}
                          className={`rounded-xl border p-5 text-left transition ${
                            isSelected
                              ? "border-blue-500 bg-slate-800 ring-1 ring-blue-500"
                              : "border-slate-700 bg-slate-800/50 hover:border-slate-600"
                          }`}
                        >
                          <h3 className="font-semibold text-white">{course.name}</h3>
                          <p className="mt-1 text-xs text-slate-400">
                            {course.code} • {courseMaterials.length} material{courseMaterials.length !== 1 ? "s" : ""}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                  {selectedCourse && (
                    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                      <p className="text-sm text-slate-400">
                        Materials in <span className="font-medium text-white">{selectedCourse.name}</span>
                      </p>
                      <input ref={fileInputRef} type="file" multiple accept="video/*,image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                      <button
                        onClick={handleUploadClick}
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        <span>📎</span> Upload videos, photos, or PDFs
                      </button>
                      <div className="mt-6 space-y-2">
                        {materials.filter((m) => m.courseId === selectedCourse.id).map((m) => (
                          <div key={m.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">
                            <div className="flex items-center gap-3">
                              <span className="text-lg">
                                {m.type === "video" ? "🎬" : m.type === "photo" ? "🖼️" : m.type === "pdf" ? "📄" : "📎"}
                              </span>
                              <div>
                                <p className="font-medium text-white">{m.fileName}</p>
                                <p className="text-xs text-slate-400">{new Date(m.uploadDate).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs text-slate-300">{m.type}</span>
                              <button type="button" className="text-xs text-rose-400 hover:text-rose-300" onClick={() => removeMaterial(m.id)}>Remove</button>
                            </div>
                          </div>
                        ))}
                        {materials.filter((m) => m.courseId === selectedCourse.id).length === 0 && (
                          <p className="text-sm text-slate-500">No materials yet. Upload above.</p>
                        )}
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
              <h2 className="text-lg font-semibold text-white">Recent Materials</h2>
              <p className="mt-1 text-sm text-slate-400">Notifications for newly uploaded materials.</p>
              <div className="mt-6 space-y-3">
                {materials.length === 0 ? (
                  <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
                    <p className="text-slate-400">No new materials yet.</p>
                    <p className="mt-2 text-sm text-slate-500">Upload materials in <strong>Upload Material</strong> to see notifications here.</p>
                  </div>
                ) : (
                  materials.map((m) => (
                    <div key={m.id} className="flex items-start gap-4 rounded-xl border border-slate-700 bg-slate-800/50 px-4 py-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-400">🔔</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-white">New material uploaded to <strong>{m.courseName}</strong></p>
                        <p className="mt-0.5 text-slate-400">{m.fileName}</p>
                        <p className="mt-1 text-xs text-slate-500">{new Date(m.uploadDate).toLocaleString()}</p>
                        <button
                          onClick={() => {
                            const course = enrolledCourses.find((c) => c.id === m.courseId);
                            if (course) { setSelectedCourse(course); handleSelectSection("upload-material"); }
                          }}
                          className="mt-2 text-xs text-blue-400 hover:underline"
                        >View in upload material →</button>
                        <button type="button" className="ml-3 mt-2 text-xs text-rose-400 hover:text-rose-300" onClick={() => removeMaterial(m.id)}>Remove</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          )}

          {/* ── Explore (electives) ── */}
          {activeLink === "explore-courses" && (
            <section>
              <h2 className="text-lg font-semibold text-white">Open Courses — Data Science</h2>
              <p className="mt-1 text-sm text-slate-400">Select a course specialization to finalize your enrollment.</p>
              <div className="mt-6 grid gap-5 md:grid-cols-3">
                {openCourses.filter((c) => !enrolledCourses.some((e) => e.id === c.id)).map((course) => (
                  <article key={course.id} className="flex flex-col rounded-2xl border border-slate-700 bg-slate-800/60 p-4">
                    <div className="mb-2 flex items-center justify-between text-[11px] text-slate-400">
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 font-semibold uppercase tracking-wide">{course.level}</span>
                      <span>{course.duration}</span>
                    </div>
                    <h2 className="text-sm font-semibold text-white">{course.name}</h2>
                    <p className="mt-2 text-xs text-slate-400">Instructor: <span className="font-medium text-slate-200">{course.instructor}</span></p>
                    <button
                      type="button"
                      className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                      onClick={() => handleEnroll(course)}
                    >Confirm Enrollment</button>
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