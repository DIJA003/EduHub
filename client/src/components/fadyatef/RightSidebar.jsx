import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";
import StatPill from "./StatPill";

const CREDITS_PER_YEAR = 42;
const TOTAL_CREDITS = CREDITS_PER_YEAR * 4; // 168

const QUICK_LINKS = [
  { label: "STD dashboard",      hash: "dashboard"        },
  { label: "My courses",         hash: "my-courses"       },
  { label: "Upload material",    hash: "upload-material"  },
  { label: "Recent materials",   hash: "recent-materials" },
];

export default function RightSidebar() {
  const navigate = useNavigate();
  const { years } = useCourses();

  const earnedCredits = Object.values(years).reduce(
    (sum, y) => sum + (y.meta?.earnedCredits ?? 0), 0
  );
  const progressPercent = Math.round((earnedCredits / TOTAL_CREDITS) * 100);
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progressPercent / 100) * circumference;

  const goToDashboard = (hash) => {
    // Navigate then set hash so StudentDashboard picks it up
    navigate(`/std-dashboard`);
    // Small delay to let the page mount before hash is set
    setTimeout(() => {
      window.location.hash = hash;
    }, 50);
  };

  return (
    <aside className="space-y-6">
      {/* Degree progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-900">
          Degree Progress
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <svg width="96" height="96" className="-rotate-90">
              <circle cx="48" cy="48" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle
                cx="48" cy="48" r={radius} fill="none" stroke="#3b82f6" strokeWidth="8"
                strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.5s ease" }}
              />
            </svg>
            <span className="absolute text-xl font-semibold text-slate-900">
              {progressPercent}%
            </span>
          </div>
          <div className="space-y-3">
            <StatPill label="Total Credits"        value={`${earnedCredits} / ${TOTAL_CREDITS}`} />
            <StatPill label="Credits to pass year" value={`${CREDITS_PER_YEAR} hrs`} />
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-900">
          Quick Links
        </h2>
        <div className="space-y-2 text-sm">
          {QUICK_LINKS.map((link) => (
            <button
              key={link.hash}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-slate-900 transition hover:bg-slate-50"
              onClick={() => goToDashboard(link.hash)}
            >
              <span className="font-medium">{link.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Help card */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-900 shadow-md">
        <h3 className="text-sm font-semibold text-slate-900">Need Help?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Book a 1-on-1 session with a senior mentor to discuss your path.
        </p>
        <button
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-edublue transition hover:bg-slate-100"
          onClick={() => navigate("/mentor")}
        >
          Find a Mentor
        </button>
      </section>
    </aside>
  );
}