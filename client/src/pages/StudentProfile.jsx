import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCourses } from "../context/CourseContext";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";
import AvatarUpload from "../components/ui/AvatarUpload";
import { profileApi, enrollmentApi2, avatarApi } from "../services/api";

const PROFILE_STORAGE_KEY = "eduhub-profile-edits-v1";

function loadProfileEdits() {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveProfileEdits(form) {
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(form));
  } catch {}
}

function buildBaseFromAccount(dbUser, user, currentYearId, years) {
  const mongoId = dbUser?._id ?? dbUser?.id;
  const studentId =
    mongoId != null
      ? `…${String(mongoId).slice(-8)}`
      : user?.uid
      ? user.uid.slice(0, 8)
      : "—";

  // Show the HIGHEST unlocked year so profile updates when year 2/3/4 unlocks
  const unlockedIds = Object.entries(years || {})
    .filter(([, y]) => y.meta?.unlocked !== false)
    .map(([id]) => Number(id));
  const highestYear = unlockedIds.length > 0 ? Math.max(...unlockedIds) : null;
  const displayYearId = highestYear ? String(highestYear) : currentYearId;
  const activeYear = displayYearId && years?.[displayYearId];
  const shortTitle = activeYear?.meta?.title?.split(":")[0]?.trim();
  const yearLevel =
    displayYearId && shortTitle
      ? `${shortTitle} — in progress (Year ${displayYearId})`
      : displayYearId
      ? `Year ${displayYearId} — in progress`
      : "—";

  return {
    name: dbUser?.name?.trim() || user?.displayName?.trim() || "Student",
    studentId,
    college:
      dbUser?.college && dbUser.college !== "—" ? dbUser.college : "Not set",
    yearLevel,
    email: (dbUser?.email || user?.email || "").trim() || "—",
    phone: "—",
    graduation: "—",
  };
}

const TOTAL_CREDITS = 168;

export default function StudentProfile() {
  const navigate = useNavigate();
  const { user, dbUser, refreshDbUser } = useAuth();
  const { years, lastCompletedCourse, currentYearId } = useCourses();
  const { darkMode, toggleDarkMode } = useTheme();

  const [editMode, setEditMode] = useState(false);
  const [notifOn, setNotifOn] = useState(true);
  const [activeCard, setActiveCard] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  // Real completed courses loaded from backend
  const [completedCourses, setCompletedCourses] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoadingCerts(true);
    enrollmentApi2
      .getAll()
      .then((res) => {
        const all = res.data || [];
        // completed = 100% progress
        const done = all.filter((e) => e.progress >= 100 || e.status === "completed");
        setCompletedCourses(done);
      })
      .catch(() => setCompletedCourses([]))
      .finally(() => setLoadingCerts(false));
  }, [user]);

  const [form, setForm] = useState(() => {
    const stored = loadProfileEdits();
    if (stored) return stored;
    return buildBaseFromAccount(null, null, null, {});
  });

  const editSnapshotRef = useRef(null);
  const accountFilledRef = useRef(false);

  useEffect(() => {
    if (!dbUser || accountFilledRef.current) return;
    accountFilledRef.current = true;

    const stored = loadProfileEdits();
    if (stored) {
      const built = buildBaseFromAccount(dbUser, user, currentYearId, years);
      setForm((prev) => ({
        ...prev,
        studentId: built.studentId,
        yearLevel: built.yearLevel,
        email: (dbUser?.email || user?.email || "").trim() || prev.email,
      }));
    } else {
      setForm(buildBaseFromAccount(dbUser, user, currentYearId, years));
    }
  }, [dbUser]); // eslint-disable-line

  const earnedCredits = Object.values(years).reduce(
    (sum, y) => sum + (y.meta?.earnedCredits ?? 0),
    0,
  );
  const progressPercent = Math.min(
    Math.round((earnedCredits / TOTAL_CREDITS) * 100),
    100,
  );

  const handleEdit = () => {
    editSnapshotRef.current = { ...form };
    setEditMode(true);
  };
  const handleCancel = () => {
    if (editSnapshotRef.current) setForm({ ...editSnapshotRef.current });
    setEditMode(false);
  };
  const handleSave = async () => {
    setSaving(true);
    saveProfileEdits(form);
    try {
      await profileApi.update({
        name: form.name,
        phone: form.phone,
        graduation: form.graduation,
        college: form.college,
      });
    } catch (err) {
      console.warn("Profile backend save failed — kept in localStorage:", err.message);
    }
    setSaving(false);
    setSaved(true);
    setEditMode(false);
    setTimeout(() => setSaved(false), 3000);
  };

  const Toggle = ({ on, onToggle }) => (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        on ? "bg-blue-600" : "bg-slate-200"
      }`}
    >
      <span
        className={`inline-block h-6 w-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
          on ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );

  const bg = darkMode ? "bg-slate-900" : "bg-slate-50";
  const card = darkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200";
  const text = darkMode ? "text-white" : "text-slate-900";
  const muted = darkMode ? "text-slate-400" : "text-slate-500";
  const input = darkMode
    ? "bg-slate-700 border-slate-600 text-white focus:ring-blue-400"
    : "bg-white border-slate-300 text-slate-800 focus:ring-blue-500";

  // Certificates = lastCompletedCourse + other completed courses from DB
  const certList = completedCourses
    .filter((e) => !(lastCompletedCourse && e.id === lastCompletedCourse.courseId))
    .slice(0, 5); // show up to 5 past certs

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">
        {/* Profile card */}
        <div className={`mb-6 rounded-2xl border p-6 shadow-sm ${card}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <AvatarUpload
                photoURL={dbUser?.photoURL || user?.photoURL}
                name={form.name}
                size="lg"
                editable={editMode}
                onUpload={async (file) => {
                  const res = await avatarApi.upload(file);
                  const photoURL = res.data?.data?.photoURL;
                  if (photoURL) {
                    await profileApi.update({ photoURL });
                    // Refresh dbUser in auth store
                    await refreshDbUser();
                  }
                }}
              />
              <div>
                {editMode ? (
                  <input
                    className={`mb-1 w-full rounded-lg border px-3 py-1.5 text-xl font-bold focus:outline-none focus:ring-2 ${input}`}
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  />
                ) : (
                  <h1 className={`text-2xl font-bold ${text}`}>{form.name}</h1>
                )}
                <p className="text-sm font-semibold text-blue-500">Account: {form.email}</p>
                <p className="text-xs font-medium text-slate-500">Record ID: {form.studentId}</p>
                <p className={`text-sm ${muted}`}>
                  {form.college} •{" "}
                  {dbUser?.role
                    ? `${dbUser.role.charAt(0).toUpperCase()}${dbUser.role.slice(1)}`
                    : "Student"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saved && <span className="text-sm font-medium text-emerald-500">✓ Saved!</span>}
              {editMode ? (
                <>
                  <button
                    onClick={handleCancel}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:opacity-80 ${
                      darkMode
                        ? "border-slate-600 text-slate-300"
                        : "border-slate-300 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-95 transition"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Two-column */}
        <div className="grid gap-6 lg:grid-cols-[1fr,1.8fr]">
          {/* Left */}
          <div className="space-y-6">
            {/* Personal Information */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
              <h2 className={`mb-4 text-base font-bold ${text}`}>Personal Information</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Email", key: "email", type: "email", readOnly: true },
                  { label: "Phone", key: "phone", type: "tel", readOnly: false },
                  { label: "College / program", key: "college", type: "text", readOnly: false },
                  { label: "Year level", key: "yearLevel", type: "text", readOnly: true },
                  { label: "Graduation", key: "graduation", type: "text", readOnly: false },
                ].map(({ label, key, type, readOnly }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className={`w-28 shrink-0 ${muted}`}>{label}</span>
                    {editMode && !readOnly ? (
                      <input
                        type={type}
                        className={`flex-1 rounded-lg border px-2 py-1.5 text-sm focus:outline-none focus:ring-2 ${input}`}
                        value={form[key]}
                        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                      />
                    ) : (
                      <span className={`font-medium text-right ${text} ${readOnly && editMode ? "opacity-50" : ""}`}>
                        {form[key]}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
              <h2 className={`mb-4 text-base font-bold ${text}`}>Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${text}`}>Email Notifications</p>
                    <p className={`text-xs ${muted}`}>Stay updated on course news</p>
                  </div>
                  <Toggle on={notifOn} onToggle={() => setNotifOn(!notifOn)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-semibold ${text}`}>Dark Mode</p>
                    <p className={`text-xs ${muted}`}>Switch to dark interface</p>
                  </div>
                  <Toggle on={darkMode} onToggle={toggleDarkMode} />
                </div>
                <button
                  onClick={() => navigate("/change-password")}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-500 hover:text-blue-400 hover:underline transition"
                >
                  🔒 Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Academic Overview */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
              <h2 className={`mb-4 text-base font-bold ${text}`}>Academic Overview</h2>
              <div className="grid grid-cols-3 gap-3">
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 cursor-default transition hover:border-blue-300 ${
                    darkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-100 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-3xl font-bold text-blue-500">
                    {completedCourses.length}
                  </span>
                  <span className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${muted}`}>
                    Courses Done
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 cursor-default transition hover:border-blue-300 ${
                    darkMode ? "bg-slate-700 border-slate-600" : "bg-slate-50 border-slate-100 hover:bg-blue-50"
                  }`}
                >
                  <span className="text-2xl font-bold text-blue-500">
                    {earnedCredits}
                    <span className={`text-base font-semibold ${muted}`}> / {TOTAL_CREDITS}</span>
                  </span>
                  <span className={`mt-1 text-[10px] font-semibold uppercase tracking-wide ${muted}`}>
                    Total Credits
                  </span>
                </div>
                <div
                  className={`flex flex-col items-center justify-center rounded-xl border p-4 cursor-default transition ${
                    darkMode
                      ? "bg-emerald-900/30 border-emerald-800 hover:bg-emerald-900/50"
                      : "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                  }`}
                >
                  <span className="text-3xl">🏅</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                    Dean's List
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className={`font-semibold ${text}`}>Degree Progress</span>
                  <span className={`font-bold ${text}`}>{progressPercent}%</span>
                </div>
                <div className={`h-3 w-full overflow-hidden rounded-full ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Certificates — real completed courses */}
            <div className={`rounded-2xl border p-5 shadow-sm ${card}`}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className={`text-base font-bold ${text}`}>Completed Courses</h2>
                <span className={`text-sm ${muted}`}>{completedCourses.length} total</span>
              </div>

              {loadingCerts ? (
                <div className="space-y-2">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-16 animate-pulse rounded-xl bg-slate-100" />
                  ))}
                </div>
              ) : completedCourses.length === 0 ? (
                <p className={`text-sm ${muted}`}>
                  Complete a course to 100% to see it here.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {/* Most recent completed */}
                  {lastCompletedCourse && (
                    <button
                      type="button"
                      onClick={() => setActiveCard(activeCard === "last" ? null : "last")}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-95 ${
                        activeCard === "last"
                          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                          : darkMode
                          ? "border-slate-700 bg-slate-700/50 hover:border-blue-500"
                          : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <span className="text-xl">🎓</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{lastCompletedCourse.name}</p>
                        <p className={`text-xs ${muted}`}>
                          {lastCompletedCourse.code} · Year {lastCompletedCourse.yearId} ·{" "}
                          {new Date(lastCompletedCourse.completedAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                        {activeCard === "last" && (
                          <p className="mt-1 text-xs font-medium text-blue-500">✓ Course completed</p>
                        )}
                      </div>
                    </button>
                  )}

                  {/* Other completed courses from DB */}
                  {certList.map((e) => (
                    <button
                      type="button"
                      key={e.id}
                      onClick={() => setActiveCard(activeCard === e.id ? null : e.id)}
                      className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-95 ${
                        activeCard === e.id
                          ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                          : darkMode
                          ? "border-slate-700 bg-slate-700/50 hover:border-blue-500"
                          : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100">
                        <span className="text-xl">🏆</span>
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${text}`}>{e.name}</p>
                        <p className={`text-xs ${muted}`}>
                          {e.code} · Year {e.yearId || "—"}
                        </p>
                        {activeCard === e.id && (
                          <p className="mt-1 text-xs font-medium text-blue-500">✓ Certificate earned</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}