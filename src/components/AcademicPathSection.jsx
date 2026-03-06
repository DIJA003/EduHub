import React from "react";
import YearCard from "./YearCard";

export default function AcademicPathSection() {
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
        />
        <YearCard
          year="2"
          title="Year Two"
          description="Intermediate Specializations: Data structures, algorithms, and systems."
          status="In Progress"
          highlighted
        />
        <YearCard
          year="3"
          title="Year Three"
          description="Advanced Applications: Software engineering, cloud architecture, and AI."
          status="Locked"
        />
        <YearCard
          year="4"
          title="Year Four"
          description="Final Research & Thesis: Industry placements and capstone projects."
          status="Locked"
        />
      </div>
    </section>
  );
}
