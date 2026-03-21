import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";
import profileImage from "../assets/images/profile.jpg";

const CERTIFICATES = [
  { id: 1, name: "Data Structures",       date: "Earned Oct 12, 2023", color: "bg-blue-100",   icon: "🗂️" },
  { id: 2, name: "Python for Data Science", date: "Earned Sep 05, 2023", color: "bg-orange-100", icon: "🐍" },
  { id: 3, name: "Database Systems",      date: "Earned Aug 22, 2023", color: "bg-purple-100", icon: "🗄️" },
  { id: 4, name: "Intro to Cloud Computing", date: "Earned July 15, 2023", color: "bg-sky-100",  icon: "☁️" },
];

const TOTAL_CREDITS = 168; // 42 × 4 years

export default function StudentProfile() {
  const navigate = useNavigate();
  const { years } = useCourses();

  const [editMode,   setEditMode]   = useState(false);
  const [notifOn,    setNotifOn]    = useState(true);
  const [darkMode,   setDarkMode]   = useState(false);
  const [activeCard, setActiveCard] = useState(null);
  const [form, setForm] = useState({
    name:       "Alex Johnson",
    studentId:  "294857",
    major:      "Computer Science",
    year:       "Senior Year",
    email:      "alex.j@eduhub.edu",
    phone:      "+1 (555) 012-3456",
    graduation: "May 2025",
  });
  const [saved, setSaved] = useState(false);

  // Real data from CourseContext
  const earnedCredits = Object.values(years).reduce(
    (sum, y) => sum + (y.meta?.earnedCredits ?? 0), 0
  );
  const progressPercent = Math.min(Math.round((earnedCredits / TOTAL_CREDITS) * 100), 100);

  const handleSave = () => {
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

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6">

        {/* ── Profile card ── */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <img
                src={profileImage}
                alt="Profile"
                className="h-20 w-20 rounded-full object-cover ring-4 ring-blue-50"
              />
              <div>
                {editMode ? (
                  <input
                    className="mb-1 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xl font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                ) : (
                  <h1 className="text-2xl font-bold text-slate-900">{form.name}</h1>
                )}
                <p className="text-sm font-semibold text-blue-600">
                  Student ID: {form.studentId}
                </p>
                <p className="text-sm text-slate-500">
                  {form.major} Major • {form.year}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {saved && (
                <span className="text-sm font-medium text-emerald-600">✓ Saved!</span>
              )}
              {editMode ? (
                <>
                  <button
                    onClick={() => setEditMode(false)}
                    className="rounded-full border border-slate-300 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 transition"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="flex items-center gap-2 rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 active:scale-95 transition"
                >
                  ✏️ Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-6 lg:grid-cols-[1fr,1.8fr]">

          {/* Left column */}
          <div className="space-y-6">

            {/* Personal Information */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">Personal Information</h2>
              <div className="space-y-3 text-sm">
                {[
                  { label: "Email",      key: "email",      type: "email" },
                  { label: "Phone",      key: "phone",      type: "tel"   },
                  { label: "Major",      key: "major",      type: "text"  },
                  { label: "Graduation", key: "graduation", type: "text"  },
                ].map(({ label, key, type }) => (
                  <div key={key} className="flex items-center justify-between gap-2">
                    <span className="text-slate-400 w-24 shrink-0">{label}</span>
                    {editMode ? (
                      <input
                        type={type}
                        className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      />
                    ) : (
                      <span className="text-slate-700 font-medium text-right">{form[key]}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">Preferences</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                    <p className="text-xs text-slate-400">Stay updated on course news</p>
                  </div>
                  <Toggle on={notifOn} onToggle={() => setNotifOn(!notifOn)} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Dark Mode</p>
                    <p className="text-xs text-slate-400">Switch to dark interface</p>
                  </div>
                  <Toggle on={darkMode} onToggle={() => setDarkMode(!darkMode)} />
                </div>
                <button
                  onClick={() => navigate("/change-password")}
                  className="mt-2 flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline transition"
                >
                  🔒 Change Password
                </button>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-6">

            {/* Academic Overview */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-base font-bold text-slate-900">Academic Overview</h2>
              <div className="grid grid-cols-3 gap-3">
                {/* GPA */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 hover:border-blue-200 hover:bg-blue-50 transition cursor-default">
                  <span className="text-3xl font-bold text-blue-600">3.8</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Cumulative GPA
                  </span>
                </div>
                {/* Credits */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 border border-slate-100 p-4 hover:border-blue-200 hover:bg-blue-50 transition cursor-default">
                  <span className="text-3xl font-bold text-blue-600">
                    {earnedCredits}
                    <span className="text-lg font-semibold text-slate-400"> / {TOTAL_CREDITS}</span>
                  </span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    Total Credits
                  </span>
                </div>
                {/* Dean's list */}
                <div className="flex flex-col items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 p-4 hover:border-emerald-300 hover:bg-emerald-100 transition cursor-default">
                  <span className="text-3xl">🏅</span>
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                    Dean's List
                  </span>
                </div>
              </div>

              {/* Degree Progress bar */}
              <div className="mt-5">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">Degree Progress</span>
                  <span className="font-bold text-slate-900">{progressPercent}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-700"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Recently Earned Certificates */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900">Recently Earned Certificates</h2>
                <button className="text-sm font-semibold text-blue-600 hover:underline">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CERTIFICATES.map((cert) => (
                  <button
                    key={cert.id}
                    onClick={() => setActiveCard(activeCard === cert.id ? null : cert.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition active:scale-95 ${
                      activeCard === cert.id
                        ? "border-blue-400 bg-blue-50 ring-2 ring-blue-200"
                        : "border-slate-100 bg-slate-50 hover:border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${cert.color}`}>
                      <span className="text-xl">{cert.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{cert.name}</p>
                      <p className="text-xs text-slate-400">{cert.date}</p>
                      {activeCard === cert.id && (
                        <p className="mt-1 text-xs font-medium text-blue-600">
                          ✓ Certificate earned
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}