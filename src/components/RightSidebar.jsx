import React from "react";
import StatPill from "./StatPill";

export default function RightSidebar({ onAction }) {
  return (
    <aside className="space-y-6">
      {/* Degree progress */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Degree Progress
        </h2>
        <div className="flex flex-wrap items-center gap-6">
          <div className="relative flex h-24 w-24 items-center justify-center">
            <div className="h-24 w-24 rounded-full border-[6px] border-slate-200" />
            <div className="absolute h-24 w-24 rounded-full border-[6px] border-edublue border-t-transparent border-l-transparent rotate-45" />
            <span className="absolute text-xl font-semibold text-slate-900">
              65%
            </span>
          </div>
          <div className="space-y-3">
            <StatPill label="Total Credits" value="120 / 180" />
            <StatPill label="GPA" value="3.8 / 4.0" />
          </div>
        </div>
      </section>

      {/* Quick links */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Quick Links
        </h2>
        <div className="space-y-2 text-sm">
          {[
            "Download Curriculum",
            "View Full Schedule",
            "Find Study Group",
            "Contact Advisor",
          ].map((item) => (
            <button
              key={item}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left transition hover:bg-slate-50"
              onClick={() => onAction(item)}
            >
              <span>{item}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Help card */}
      <section className="rounded-2xl bg-edublue p-5 text-white shadow-md">
        <h3 className="text-sm font-semibold">Need Help?</h3>
        <p className="mt-2 text-sm text-blue-100">
          Book a 1-on-1 session with a senior mentor to discuss your path.
        </p>
        <button
          className="mt-4 inline-flex items-center justify-center rounded-full bg-white px-4 py-2 text-sm font-semibold text-edublue transition hover:bg-slate-100"
          onClick={() => onAction("Find a Mentor")}
        >
          Find a Mentor
        </button>
      </section>
    </aside>
  );
}
