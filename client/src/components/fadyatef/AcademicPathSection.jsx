import React from "react";
import { useNavigate } from "react-router-dom";
import YearCard from "./YearCard";
export default function AcademicPathSection() {
  const navigate = useNavigate();
  const handleYearClick = (year) => {
    navigate(`/academic-year/${year}`);
  };

  return (
    <section>
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
        Your Academic Path
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        <YearCard
          year="1"
          title="Year One"
          description="Foundational Concepts: Principles of computing, mathematics, and logic."
          status="Completed"
          onClick={() => handleYearClick("1")}
        />
        <YearCard
          year="2"
          title="Year Two"
          description="Intermediate Specializations: Data structures, algorithms, and systems."
          status="In Progress"
          highlighted
          onClick={() => handleYearClick("2")}
        />
        <YearCard
          year="3"
          title="Year Three"
          description="Advanced Applications: Software engineering, cloud architecture, and AI."
          status="Locked"
          onClick={() => handleYearClick("3")}
        />
        <YearCard
          year="4"
          title="Year Four"
          description="Final Research & Thesis: Industry placements and capstone projects."
          status="Locked"
          onClick={() => handleYearClick("4")}
        />
      </div>
      <div className="mt-4">
        <button
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:border-slate-400"
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
