import React from "react";
import CourseCard from "./CourseCard";

export default function RecommendedSection({ onAction }) {
  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recommended for You
        </h2>
        <button className="text-xs font-semibold text-edublue hover:underline">
          View All
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        <CourseCard
          tag="CS305"
          tagColor="bg-sky-600"
          title="Algorithms"
          type="Core • Algorithms CS305"
          duration="14 Weeks"
          imageUrl="/algorithms-course.jpg"
          onClick={() => onAction("Algorithms CS305")}
        />
        <CourseCard
          tag="CS303"
          tagColor="bg-emerald-600"
          title="Software Analysis"
          type="Core • Software Analysis CS303"
          duration="12 Weeks"
          imageUrl="https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800"
          onClick={() => onAction("Software Analysis CS303")}
        />
        <CourseCard
          tag="CS308"
          tagColor="bg-amber-500"
          title="Database"
          type="Core • Database CS308"
          duration="12 Weeks"
          imageUrl="https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800"
          onClick={() => onAction("Database CS308")}
        />
      </div>
    </section>
  );
}
