import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCoursesByYear } from "../hooks/useCourses";
import {
  useMyEnrollments,
  useEnroll,
  useUnenroll,
} from "../../enrollment/hooks/useEnrollments";
import useAuthStore from "../../../stores/auth.store";
import { facultiesApi } from "../../../lib/api/faculties.api";
import Header from "../../../components/common/Header";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";

export default function YearDetail() {
  const navigate = useNavigate();
  const { yearId } = useParams();
  const yearNum = parseInt(yearId, 10);
  const dbUser = useAuthStore((s) => s.dbUser);
  const facultyId = dbUser?.faculty?._id || dbUser?.faculty;

  const { data: academicPayload } = useQuery({
    queryKey: ["faculty", facultyId, "student-academic-years"],
    queryFn: () => facultiesApi.getStudentAcademicYears(facultyId),
    enabled: !!facultyId && !Number.isNaN(yearNum),
  });
  const academic = academicPayload?.data ?? academicPayload;
  const yearConfig = academic?.years?.find((y) => y.year === yearNum);
  const semesterLabel = (n) => {
    const s = yearConfig?.semesters?.find((sem) => sem.number === n);
    if (s?.name && s.active !== false) return s.name;
    return n ? `Semester ${n}` : "General";
  };

  const { data: coursesData, isLoading } = useCoursesByYear(yearNum);
  const courses = Array.isArray(coursesData)
    ? coursesData
    : coursesData?.data || [];

  const coursesBySemester = useMemo(() => {
    const map = new Map();
    for (const c of courses) {
      const key = c.semester != null && c.semester !== "" ? Number(c.semester) : 0;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(c);
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0]);
  }, [courses]);

  const { data: enrollmentsData } = useMyEnrollments();
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];
  const enrolledIds = useMemo(() => {
    const set = new Set();
    for (const e of enrollments) {
      if (e?.courseId != null) set.add(String(e.courseId));
      if (e?.id != null) set.add(String(e.id));
    }
    return set;
  }, [enrollments]);

  const enrollMutation = useEnroll();
  const unenrollMutation = useUnenroll();

  const title =
    (yearConfig?.name && String(yearConfig.name).trim()) ||
    (Number.isNaN(yearNum) ? "Courses" : `Year ${yearNum}`);

  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate("/academic-year")}
            className="flex items-center gap-2 text-sm font-medium text-[var(--color-text-2)] hover:text-[var(--color-accent)] transition-colors"
          >
            <svg
              className="w-4 h-4 shrink-0"
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
            Academic years
          </button>
        </div>

        <div className="mb-8">
          <h1 className="text-2xl font-black text-[var(--color-text)]">{title}</h1>
        </div>

        {isLoading ? (
          <CardSkeleton count={6} />
        ) : courses.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No published courses yet"
            description="Courses for this year will appear here once published for your faculty and program."
          />
        ) : (
          <div className="space-y-10">
            {coursesBySemester.map(([semKey, semCourses]) => (
              <section key={semKey}>
                <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-3)] mb-4 border-b border-[var(--color-border)] pb-2">
                  {semesterLabel(semKey)}
                </h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {semCourses.map((course) => {
                    const isEnrolled = enrolledIds.has(String(course._id));

                    return (
                      <div
                        key={course._id}
                        className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 flex flex-col shadow-[var(--shadow-card)] hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-card-hover)] transition-all"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge variant="blue">{course.code}</Badge>
                            <h3 className="mt-2 font-bold text-[var(--color-text)]">
                              {course.title}
                            </h3>
                            <p className="text-xs text-[var(--color-text-3)] mt-0.5">
                              {course.creditHours || 3} credits •{" "}
                              {course.instructor || "TBA"}
                            </p>
                          </div>
                        </div>

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
                                Open Course
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
                                loading={
                                  enrollMutation.isPending &&
                                  String(enrollMutation.variables) ===
                                    String(course._id)
                                }
                              >
                              Enroll
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
