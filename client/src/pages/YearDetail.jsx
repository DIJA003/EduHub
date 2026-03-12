import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";
import ConfirmDialog from "../components/common/ConfirmDialog";

export default function YearDetail() {
  const navigate = useNavigate();
  const { yearId } = useParams();
  const { years, enrollCourse, undoEnrollment } = useCourses();
  const [undoTarget, setUndoTarget] = useState(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const year = years[yearId];

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
    available,
  } = year;

  const isCompleted =
    status === "Completed" || enrolled.every((c) => c.progress >= 100);

  const openUndoDialog = (course) => {
    setUndoTarget({ id: course.id, name: course.name });
  };

  const closeUndoDialog = () => setUndoTarget(null);

  const confirmUndo = () => {
    if (!undoTarget) return;
    undoEnrollment(yearId, undoTarget.id);
    closeUndoDialog();
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <ConfirmDialog
        open={Boolean(undoTarget)}
        title="Undo enrollment?"
        message={
          undoTarget
            ? `Are you sure you want to undo enrollment for "${undoTarget.name}"?`
            : ""
        }
        confirmLabel="Undo"
        cancelLabel="Cancel"
        onConfirm={confirmUndo}
        onCancel={closeUndoDialog}
      />
      <ConfirmDialog
        open={limitDialogOpen}
        title="Credit limit reached"
        message="You cannot enroll in more courses because your credits have reached the 21-credit limit for this year."
        confirmLabel="OK"
        showCancel={false}
        onConfirm={() => setLimitDialogOpen(false)}
        onCancel={() => setLimitDialogOpen(false)}
      />

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

        {/* Enrolled courses */}
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Enrolled Courses
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {enrolled.map((course) => (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
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

                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    Next:{" "}
                    <span className="font-medium text-slate-700">
                      {course.nextItem}
                    </span>
                  </p>
                  <button
                    type="button"
                    className="rounded-full border border-slate-300 px-3 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50"
                    onClick={() => openUndoDialog(course)}
                  >
                    Undo
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Available to enroll */}
        <section className="mb-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
              Available to Enroll
            </h2>
            <button
              type="button"
              className="text-xs font-medium text-blue-600 hover:text-blue-700"
              onClick={() => navigate("/courses/data-science")}
            >
              View All Electives
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {available.map((course) => (
              <article
                key={course.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  {course.type}
                </p>
                <h3 className="mt-1 text-sm font-semibold text-slate-900">
                  {course.name}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {course.length} • {course.schedule}
                </p>
                <p className="mt-3 text-xs text-slate-500">
                  Instructor:{" "}
                  <span className="font-medium text-slate-700">
                    {course.instructor}
                  </span>
                </p>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                  onClick={() => {
                    const credits = course.credits || 3;
                    if (earnedCredits + credits > totalCredits) {
                      setLimitDialogOpen(true);
                      return;
                    }
                    enrollCourse(yearId, {
                      id: course.id,
                      name: course.name,
                      code: course.code || "ELEC",
                      credits,
                    });
                  }}
                >
                  Enroll
                </button>
              </article>
            ))}
          </div>
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

