import { useNavigate } from "react-router-dom";
import { useMyEnrollments } from "../../enrollment/hooks/useEnrollments";
import useAuthStore from "../../../stores/auth.store";
import Header from "../../../components/common/Header";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import { facultiesApi } from "../../../lib/api/faculties.api";

export default function AcademicYear() {
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const firstName = dbUser?.name?.split(" ")[0] || "there";
  const facultyId = dbUser?.faculty?._id || dbUser?.faculty;

  const { data: enrollmentsData } = useMyEnrollments();
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  const { data: academicPayload, isLoading: academicLoading } = useQuery({
    queryKey: ["faculty", facultyId, "student-academic-years"],
    queryFn: () => facultiesApi.getStudentAcademicYears(facultyId),
    enabled: !!facultyId,
  });

  const academic = academicPayload?.data ?? academicPayload;
  const facultySummary = academic?.faculty;
  const years = academic?.years ?? [];

  const enrollmentsByYear = enrollments.reduce((acc, e) => {
    const yearId = e.yearId || 1;
    acc[yearId] = (acc[yearId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-[var(--color-ink)]">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome Banner */}
        <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6 shadow-[var(--shadow-card)]">
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-accent)] uppercase tracking-wide mb-1">
              Welcome back, {firstName}!
            </p>
            <h1 className="text-2xl font-black text-[var(--color-text)]">
              {facultySummary?.name || "Your Academic Path"}
            </h1>
            <p className="mt-2 text-[var(--color-text-3)]">
              {facultySummary
                ? `All years for your program in ${facultySummary.code} — open any year to browse semesters and courses.`
                : "Select a year to view courses and track your progress."}
            </p>
          </div>
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-full bg-[var(--color-accent-soft)] flex items-center justify-center text-5xl">
              🎓
            </div>
          </div>
        </div>

        {/* Year Cards */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--color-text-3)] mb-4">
            {facultySummary
              ? `${facultySummary.code} — Academic years (your program)`
              : "Academic Years"}
          </h2>

          {academicLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : years.length === 0 ? (
            <EmptyState
              icon="🏛️"
              title={facultyId ? "No years available" : "No faculty assigned"}
              description={
                facultyId
                  ? "We could not build an academic path for your account. Check that your program is set and your faculty is active."
                  : "Please contact an administrator to assign you to a faculty."
              }
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {years.map((year) => {
                const enrolled = enrollmentsByYear[year.year] || 0;

                return (
                  <button
                    key={year.year}
                    type="button"
                    onClick={() => navigate(`/academic-year/${year.year}`)}
                    className="flex flex-col rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 text-left shadow-[var(--shadow-card)] hover:border-[var(--color-accent)] hover:shadow-[var(--shadow-card-hover)] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white font-black text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                        {year.year}
                      </div>
                      <h3 className="font-bold text-[var(--color-text)]">{year.name}</h3>
                    </div>
                    {enrolled > 0 && (
                      <p className="mt-3 text-xs font-semibold text-[var(--color-accent)]">
                        {enrolled} course{enrolled !== 1 ? "s" : ""} enrolled
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
