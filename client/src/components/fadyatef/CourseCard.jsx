import React from "react";

export default function CourseCard({
  tag,
  tagColor,
  title,
  type,
  duration,
  imageUrl,
  onClick,
}) {
  return (
    <button
      className="group flex min-w-[260px] flex-col overflow-hidden rounded-2xl border border-slate-200
                 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="relative h-32 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2 py-0.5 text-xs font-semibold text-white ${tagColor}`}
        >
          {tag}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="mb-1 text-sm font-semibold text-slate-900 group-hover:text-edublue">
          {title}
        </h4>
        <p className="text-xs text-slate-500">
          {type} • {duration}
        </p>
      </div>
    </button>
  );
}
