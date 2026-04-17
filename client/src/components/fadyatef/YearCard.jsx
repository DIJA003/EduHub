import React from "react";

export default function YearCard({
  year,
  title,
  description,
  status,
  highlighted,
  locked,
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
      type="button"
      onClick={onClick}
      className={`flex flex-col rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        locked
          ? "cursor-pointer border-amber-200/80 bg-amber-50/40 hover:border-amber-300 hover:bg-amber-50"
          : "hover:-translate-y-1"
      } ${
        highlighted && !locked
          ? "border-edublue/60 bg-sky-50"
          : !locked
            ? "border-slate-200 hover:border-edublue/40"
            : ""
      }`}
      aria-label={
        locked
          ? `${title}: locked — open to see planned courses`
          : `${title}: open year`
      }
    >
      <div className="mb-3 flex items-center gap-3">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-full text-base font-semibold transition ${
            highlighted && !locked
              ? "bg-white text-edublue"
              : year === "2"
                ? "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white"
                : "bg-slate-100 text-slate-700"
          }`}
        >
          {year}
        </div>
        <h3 className="font-semibold text-slate-900">{title}</h3>
      </div>
      <p className="flex-1 text-sm text-slate-600">{description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className={`flex items-center gap-1 font-medium ${statusColor}`}>
          <span className={`h-2 w-2 rounded-full ${dotColor}`} />
          {status}
        </span>
        {locked && (
          <span className="font-medium text-amber-700/90">
            View planned courses →
          </span>
        )}
        {highlighted && !locked && (
          <span className="text-slate-500">
            Current Focus: <span className="font-semibold">Semester 4</span>
          </span>
        )}
      </div>
    </button>
  );
}
