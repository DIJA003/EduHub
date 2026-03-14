import React from "react";

export default function YearCard({
  year,
  title,
  description,
  status,
  highlighted,
  onClick,
}) {
  const statusColor =
    status === "Completed"
      ? "text-emerald-600"
      : status === "In Progress"
      ? "text-amber-600"
      : "text-slate-500";

  const dotColor =
    status === "Completed"
      ? "bg-emerald-500"
      : status === "In Progress"
      ? "bg-amber-400"
      : "bg-slate-300";

  return (
    <button
      className={`flex flex-col rounded-2xl border bg-white p-5 shadow-sm text-left transition 
      hover:-translate-y-1 hover:shadow-md
      ${
        highlighted
          ? "border-edublue/60 bg-sky-50"
          : "border-slate-200 hover:border-edublue/40"
      }`}
      type="button"
      onClick={onClick}
    >
      <div className="flex items-center gap-3 mb-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold transition
          ${highlighted ? "bg-white text-edublue" : "bg-slate-100 text-slate-700"}`}
        >
          {year}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="text-sm text-slate-600 flex-1">{description}</p>
      <div className="mt-4 flex items-center justify-between text-xs">
        <span className={`flex items-center gap-1 font-medium ${statusColor}`}>
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {status}
        </span>
        {highlighted && (
          <span className="text-slate-500">
            Current Focus: <span className="font-semibold">Semester 4</span>
          </span>
        )}
      </div>
    </button>
  );
}