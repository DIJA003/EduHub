import { useNavigate, useParams } from "react-router-dom";
import { useCoursesByYear } from "../hooks/useCourses";
import {
  useMyEnrollments,
  useEnroll,
  useUnenroll,
} from "../../enrollment/hooks/useEnrollments";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";

const YEAR_COPY = {
  1: {
    title: "Year One: Freshman Year",
    desc: "Foundational concepts: computing, mathematics, and logic.",
  },
  2: {
    title: "Year Two: Sophomore Year",
    desc: "Core engineering principles and advanced programming foundations.",
  },
  3: {
    title: "Year Three: Junior Year",
    desc: "Advanced applications: software engineering, cloud, and AI.",
  },
  4: {
    title: "Year Four: Senior Year",
    desc: "Capstone, research, and industry placement.",
  },
};

export default function YearDetail() {
  const navigate = useNavigate();
  const { yearId } = useParams();
  const yearNum = parseInt(yearId, 10);

  const { data: coursesData, isLoading } = useCoursesByYear(yearNum);
  const courses = Array.isArray(coursesData)
    ? coursesData
    : coursesData?.data || [];

  const { data: enrollmentsData } = useMyEnrollments();
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];
  const enrolledIds = new Set(enrollments.map((e) => String(e.courseId)));

  const enrollMutation = useEnroll();
  const unenrollMutation = useUnenroll();

  const copy = YEAR_COPY[yearNum] || { title: `Year ${yearNum}`, desc: "" };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate("/academic-year")}
            className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Academic Years
          </button>
          <Button size="sm" onClick={() => navigate("/student")}>
            Dashboard
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">
            Year {yearId}
          </p>
          <h1 className="text-2xl font-black text-slate-900">{copy.title}</h1>
          <p className="mt-2 text-slate-500">{copy.desc}</p>
        </div>

        {isLoading ? (
          <CardSkeleton count={6} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No published courses yet"
            description="Courses for this year will appear here once published by the admin."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => {
              const isEnrolled = enrolledIds.has(String(course._id));
              const enrollment = enrollments.find(
                (e) => String(e.courseId) === String(course._id),
              );

              return (
                <div
                  key={course._id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col hover:border-blue-200 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <Badge variant="blue">{course.code}</Badge>
                      <h3 className="mt-2 font-bold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {course.creditHours || 3} credits •{" "}
                        {course.instructor || "TBA"}
                      </p>
                    </div>
                  </div>

                  {isEnrolled && enrollment && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-mono text-slate-700">
                          {enrollment.progress}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${enrollment.progress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-3">
                    {isEnrolled ? (
                      <>
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            navigate(
                              `/academic-year/${yearId}/course/${course._id}`,
                            )
                          }
                        >
                          {enrollment?.progress > 0 ? "Continue" : "Start"}
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => unenrollMutation.mutate(course._id)}
                          loading={unenrollMutation.isPending}
                        >
                          Unenroll
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="flex-1"
                        onClick={() => enrollMutation.mutate(course._id)}
                        loading={enrollMutation.isPending}
                      >
                        Enroll
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
