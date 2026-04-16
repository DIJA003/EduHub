import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";
import YearCard from "./YearCard";

const YEAR_COPY = {
  1: {
    title: "Year One",
    description:
      "Foundational Concepts: Principles of computing, mathematics, and logic.",
  },
  2: {
    title: "Year Two",
    description:
      "Intermediate Specializations: Data structures, algorithms, and systems.",
  },
  3: {
    title: "Year Three",
    description:
      "Advanced Applications: Software engineering, cloud architecture, and AI.",
  },
  4: {
    title: "Year Four",
    description:
      "Final Research & Thesis: Industry placements and capstone projects.",
  },
};

function displayStatus(meta) {
  if (!meta?.unlocked) return "Locked";
  if (meta.status === "Completed") return "Completed";
  return "In Progress";
}

export default function AcademicPathSection() {
  const navigate = useNavigate();
  const { years } = useCourses();

  const ids = ["1", "2", "3", "4"];

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Your Academic Path
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {ids.map((id) => {
          const meta = years[id]?.meta;
          const copy = YEAR_COPY[id];
          const locked = meta?.unlocked === false;
          const status = meta ? displayStatus(meta) : "Locked";
          const highlighted = meta?.unlocked && meta?.status === "In Progress";

          return (
            <YearCard
              key={id}
              year={id}
              title={meta?.title?.split(":")[0] || copy.title}
              description={meta?.description || copy.description}
              status={status}
              highlighted={highlighted}
              locked={locked}
              onClick={() => navigate(`/academic-year/${id}`)}
            />
          );
        })}
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:border-slate-400 hover:bg-slate-100 sm:w-auto"
          aria-label="Add academic year"
        >
          <span className="text-lg leading-none" aria-hidden>
            +
          </span>
          Add academic year
        </button>
      </div>
    </section>
  );
}
