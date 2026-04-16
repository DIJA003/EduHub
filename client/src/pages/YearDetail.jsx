import React from "react";
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

  const handleAction = (label) => {
    if (label === "Home" || label === "Mentors") navigate("/home");
    else if (label === "Courses") navigate("/academic-year");
  };

  const year = years[yearId];

  const plannedList =
    year?.plannedCurriculum?.length > 0
      ? year.plannedCurriculum
      : year?.available ?? [];

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
    meta: { title, description, status, earnedCredits, totalCredits, unlocked },
    enrolled,
  } = year;

  const isYearCompleted =
    status === "Completed" ||
    (enrolled.length > 0 && enrolled.every((c) => c.progress >= 100));

  const isLocked = unlocked === false;

  /** Locked year: message + planned enrollment list */
  if (isLocked) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header onAction={handleAction} />
        <main className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 md:flex md:items-start md:gap-4">
            <span className="text-2xl" aria-hidden>
              🔒
            </span>
            <div>
              <h1 className="text-lg font-semibold text-amber-900">
                Year {yearId} is still locked
              </h1>
              <p className="mt-1 text-sm text-amber-800">
                Finish the previous year (all courses and {totalCredits} credit
                hours) to unlock this year. Below is the curriculum you will
                enroll in once it opens.
              </p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Academic Path / Year {yearId}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{description}</p>
          </div>

          <section className="mb-10">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Courses you will enroll in
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              {plannedList.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                        {course.type || "Course"}
                      </p>
                      <h3 className="font-semibold text-slate-900">
                        {course.name}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {course.code ? `${course.code} • ` : ""}
                        {course.credits != null ? `${course.credits} Credits` : ""}
                      </p>
                    </div>
                  </div>
                  {(course.length || course.schedule || course.instructor) && (
                    <p className="text-xs text-slate-600">
                      {[course.length, course.schedule].filter(Boolean).join(" • ")}
                      {course.instructor && (
                        <span className="mt-1 block">
                          Instructor: {course.instructor}
                        </span>
                      )}
                    </p>
                  )}
                  <p className="mt-3 text-[11px] font-medium text-slate-400">
                    Unlocks when this year opens
                  </p>
                </div>
              ))}
            </div>
            {plannedList.length === 0 && (
              <p className="text-sm text-slate-500">
                Curriculum for this year will be published soon.
              </p>
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
        <Footer onAction={handleAction} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header onAction={handleAction} />
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
                isYearCompleted
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-blue-50 text-blue-700"
              }`}
            >
              {isYearCompleted ? "Status: Completed" : "Status: In Progress"}
            </span>
            <span className="text-xs text-slate-500">
              {earnedCredits} / {totalCredits} Credits Earned
            </span>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              {isYearCompleted ? "Courses you passed" : "Your Courses"}
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {enrolled.map((course) => {
              const courseMaterials = materials.filter(
                (m) => m.courseId === course.id,
              );
              const passed = course.progress >= 100;

              return (
                <button
                  key={course.id}
                  type="button"
                  onClick={() =>
                    navigate(`/academic-year/${yearId}/course/${course.id}`)
                  }
                  className={`flex flex-col rounded-2xl border p-4 text-left shadow-sm transition hover:border-edublue/40 ${
                    passed
                      ? isYearCompleted
                        ? "border-emerald-300 bg-emerald-50/90 ring-1 ring-emerald-200"
                        : "border-emerald-200 bg-emerald-50/70 ring-1 ring-emerald-100"
                      : "border-slate-200 bg-white"
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
                    {passed ? (
                      <span className="text-xs font-semibold text-emerald-700">
                        Passed ✓
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-slate-500">
                        {course.progress}% Complete
                      </span>
                    )}
                  </div>

                  <div className="mb-2 h-2 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${
                        passed ? "bg-emerald-500" : "bg-blue-600"
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>

                  <p className="mt-1 text-xs text-slate-500">
                    {passed ? (
                      <span className="font-medium text-emerald-800">
                        Finished — open to review sections
                      </span>
                    ) : (
                      <>
                        Next:{" "}
                        <span className="font-medium text-slate-700">
                          {course.nextItem}
                        </span>
                      </>
                    )}
                  </p>

                  <p className="mt-2 text-[11px] text-slate-400">
                    {courseMaterials.length} material
                    {courseMaterials.length !== 1 ? "s" : ""} uploaded
                  </p>
                </button>
              );
            })}
          </div>
          {enrolled.length === 0 && (
            <p className="text-sm text-slate-500">
              No courses enrolled for this year yet.
            </p>
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

      <Footer onAction={handleAction} />
    </div>
  );
}
