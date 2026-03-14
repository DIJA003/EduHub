import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import { useMaterials } from "../context/MaterialContext";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";

export default function YearDetail() {
  const navigate = useNavigate();
  const { yearId } = useParams();
  const { years } = useCourses();
  const { materials } = useMaterials();

  const year = years[yearId];

  const [selectedCourseId, setSelectedCourseId] = useState(
    year?.enrolled?.[0]?.id ?? null
  );

  if (!year) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="space-y-4 text-center">
          <p className="text-sm text-slate-600">
            This academic year is not configured yet.
          </p>
          <button
            type="button"
            className="rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white"
            onClick={() => navigate("/academic-year")}
          >
            Back to Academic Path
          </button>
        </div>
      </div>
    );
  }

  const {
    meta: { title, description, status, earnedCredits, totalCredits },
    enrolled,
  } = year;

  const isCompleted =
    status === "Completed" || enrolled.every((c) => c.progress >= 100);

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Academic Path / Year {yearId}
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>

          <div className="flex flex-col items-end gap-2 text-right">
            <span
              className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                isCompleted
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isCompleted ? "Status: Completed" : "Status: In Progress"}
            </span>
            <span className="text-xs text-slate-500">
              {earnedCredits} / {totalCredits} Credits Earned
            </span>
          </div>
        </div>

        {/* Enrolled courses as cards */}
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Your Courses
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {enrolled.map((course) => {
              const isSelected = selectedCourseId === course.id;
              const courseMaterials = materials.filter(
                (m) => m.courseId === course.id
              );
              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() =>
                    setSelectedCourseId(isSelected ? null : course.id)
                  }
                  className={`flex flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition ${
                    isSelected
                      ? "border-edublue/60 ring-2 ring-edublue/40"
                      : "border-slate-200 hover:border-edublue/40"
                  }`}
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {course.code} • {course.credits} Credits
                      </p>
                    </div>
                    <span className="text-xs font-medium text-slate-500">
                      {course.progress}% Complete
                    </span>
                  </div>

                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600"
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    Next:{" "}
                    <span className="font-medium text-slate-700">
                      {course.nextItem}
                    </span>
                  </p>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {courseMaterials.length} material
                    {courseMaterials.length !== 1 ? "s" : ""} uploaded
                  </p>
                </button>
              );
            })}
          </div>

          {selectedCourseId && (
            <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Materials for{" "}
                {
                  enrolled.find((c) => c.id === selectedCourseId)?.name ??
                  "Course"
                }
              </h3>
              <div className="mt-3 space-y-2">
                {materials.filter((m) => m.courseId === selectedCourseId)
                  .length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No materials uploaded yet for this course.
                  </p>
                ) : (
                  materials
                    .filter((m) => m.courseId === selectedCourseId)
                    .map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">
                            {m.type === "video" && "🎬"}
                            {m.type === "photo" && "🖼️"}
                            {m.type === "pdf" && "📄"}
                            {!["video", "photo", "pdf"].includes(m.type) &&
                              "📎"}
                          </span>
                          <div>
                            <p className="text-xs font-medium text-slate-800">
                              {m.fileName}
                            </p>
                            <p className="text-[11px] text-slate-500">
                              {new Date(m.uploadDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[10px] text-slate-600">
                          {m.type}
                        </span>
                      </div>
                    ))
                )}
              </div>
            </div>
          )}
        </section>

        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => navigate("/academic-year")}
        >
          Back to All Years
        </button>
      </main>

      <Footer />
    </div>
  );
}

