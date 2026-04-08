import React from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../../context/CourseContext";
import CourseCard from "./CourseCard";
import algorithmsImage from "../../assets/images/algorithms-course.jpg";

const COURSE_IMAGES = [
  algorithmsImage,
  "https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=800",
  "https://images.pexels.com/photos/1181467/pexels-photo-1181467.jpeg?auto=compress&cs=tinysrgb&w=800",
];

const TAG_COLORS = ["bg-sky-600", "bg-emerald-600", "bg-amber-500", "bg-purple-600", "bg-rose-600"];

export default function RecommendedSection() {
  const navigate = useNavigate();
  const { years } = useCourses();

  // Find the In Progress year
  const inProgressYear = Object.values(years).find(
    (y) => y.meta?.status === "In Progress"
  );

  // Get available courses from that year (not yet enrolled)
  const recommended = inProgressYear?.available ?? [];

  if (recommended.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Recommended for You
        </h2>
        <button
          className="text-xs font-semibold text-edublue hover:underline"
          onClick={() => navigate("/std-dashboard#my-courses")}
        >
          View All
        </button>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recommended.map((course, i) => (
          <CourseCard
            key={course.id}
            tag={course.id.toUpperCase()}
            tagColor={TAG_COLORS[i % TAG_COLORS.length]}
            title={course.name}
            type={`${course.type} • ${course.name}`}
            duration={course.length}
            imageUrl={COURSE_IMAGES[i % COURSE_IMAGES.length]}
            onClick={() => navigate("/std-dashboard#my-courses")}
          />
        ))}
      </div>
    </section>
  );
}