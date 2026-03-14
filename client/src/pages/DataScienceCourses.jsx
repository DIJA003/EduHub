import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCourses } from "../context/CourseContext";
import Header from "../components/fadyatef/Header";
import Footer from "../components/fadyatef/Footer";
import ConfirmDialog from "../components/common/ConfirmDialog";

const openCourses = [
  {
    id: "foundations-analysis",
    name: "Foundations of Data Analysis",
    level: "Beginner",
    duration: "8 weeks",
    instructor: "Dr. Sarah Chen",
  },
  {
    id: "ml-specialization",
    name: "Machine Learning Specialization",
    level: "Intermediate",
    duration: "12 weeks",
    instructor: "Marcus Vane",
  },
  {
    id: "predictive-business",
    name: "Predictive Analytics for Business",
    level: "Advanced",
    duration: "4 weeks",
    instructor: "Elena Rodriguez",
  },
  {
    id: "big-data-spark",
    name: "Big Data Engineering with Spark",
    level: "Intermediate",
    duration: "10 weeks",
    instructor: "Julian Chen",
  },
  {
    id: "viz-tableau",
    name: "Data Visualization with Tableau",
    level: "Beginner",
    duration: "6 weeks",
    instructor: "Maya Patel",
  },
  {
    id: "deep-learning",
    name: "Deep Learning & Neural Networks",
    level: "Advanced",
    duration: "10 weeks",
    instructor: "Dr. Robert Smith",
  },
];

export default function DataScienceCourses() {
  const navigate = useNavigate();
  const { enrollCourse, years } = useCourses();
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);

  const yearTwo = years["2"];
  const enrolledIds = new Set(
    (yearTwo?.enrolled || []).map((course) => course.id)
  );
  const visibleCourses = openCourses.filter(
    (course) => !enrolledIds.has(course.id)
  );

  const handleEnroll = (course) => {
    // For now, we attach Data Science courses to Year Two
    const credits = 3;
    if (
      yearTwo &&
      yearTwo.meta.earnedCredits + credits > yearTwo.meta.totalCredits
    ) {
      setLimitDialogOpen(true);
      return;
    }

    enrollCourse("2", {
      id: course.id,
      name: course.name,
      code: "DS" + Math.floor(Math.random() * 900 + 100),
      credits,
    });
    navigate("/academic-year/2");
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
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
              Courses / Data Science Enrollment
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900 md:text-3xl">
              Open Courses - Data Science
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Select a course specialization to finalize your enrollment and
              begin your learning journey.
            </p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Difficulty
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Time Commitment
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-3 py-1">
            Rating
          </span>
          <span className="ml-auto rounded-full border border-slate-200 bg-white px-3 py-1">
            Search courses…
          </span>
        </div>

        <section className="grid gap-5 md:grid-cols-3">
          {visibleCourses.map((course) => (
            <article
              key={course.id}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="mb-2 flex items-center justify-between text-[11px] text-slate-500">
                <span className="rounded-full bg-slate-50 px-2 py-0.5 font-semibold uppercase tracking-wide">
                  {course.level}
                </span>
                <span>{course.duration}</span>
              </div>

              <h2 className="text-sm font-semibold text-slate-900">
                {course.name}
              </h2>
              <p className="mt-2 text-xs text-slate-500">
                Instructor:{" "}
                <span className="font-medium text-slate-700">
                  {course.instructor}
                </span>
              </p>

              <button
                type="button"
                className="mt-4 inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-xs font-medium text-white hover:bg-blue-700"
                onClick={() => handleEnroll(course)}
              >
                Confirm Enrollment
              </button>
            </article>
          ))}
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Showing {visibleCourses.length} open courses in Data Science.
        </p>

        <button
          type="button"
          className="mt-4 rounded-full border border-slate-300 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
          onClick={() => navigate("/academic-year/2")}
        >
          Back to Year Two
        </button>
      </main>

      <Footer />
    </div>
  );
}

