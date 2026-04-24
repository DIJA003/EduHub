import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";
import YearCard from "./YearCard";

function displayStatus(meta) {
  if (!meta?.unlocked) return "Locked";
  if (meta.status === "Completed") return "Completed";
  return "In Progress";
}

export default function AcademicPathSection() {
  const navigate = useNavigate();
  const { years, loading } = useCourses();

  const ids = ["1", "2", "3", "4"];

  if (loading) {
    return (
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
          Your Academic Path
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          {ids.map((id) => (
            <div key={id} className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Your Academic Path
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ids.map((id) => {
          const meta = years[id]?.meta;
          const locked = meta?.unlocked === false;
          const status = meta ? displayStatus(meta) : "Locked";
          const highlighted = meta?.unlocked && meta?.status === "In Progress";

          return (
            <YearCard
              key={id}
              year={id}
              title={meta?.title || `Year ${id}`}
              description={meta?.description || "Unlocks when the previous year is completed."}
              status={status}
              highlighted={highlighted}
              locked={locked}
              onClick={() => navigate(`/academic-year/${id}`)}
            />
          );
        })}
      </div>
    </section>
  );
}