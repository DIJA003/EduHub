import { useNavigate } from "react-router-dom";
import { useMyEnrollments } from "../../enrollment/hooks/useEnrollments";
import useAuthStore from "../../../stores/auth.store";
import Header from "../../../components/common/Header";
import Button from "../../../components/ui/Button";
import { useQuery } from "@tanstack/react-query";
import { CardSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";

// API for faculties
const facultiesApi = {
  getById: (id) => fetch(`/api/faculties/${id}`).then(r => r.json()),
};

export default function AcademicYear() {
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const firstName = dbUser?.name?.split(" ")[0] || "there";
  const facultyId = dbUser?.faculty;

  const { data: enrollmentsData } = useMyEnrollments();
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  // Fetch faculty data
  const { data: facultyData, isLoading: facultyLoading } = useQuery({
    queryKey: ["faculty", facultyId],
    queryFn: () => facultiesApi.getById(facultyId),
    enabled: !!facultyId,
  });

  const faculty = facultyData?.data;
  const userProgramId = dbUser?.program?._id || dbUser?.program;
  
  // Filter years by student's program if available
  let years = faculty?.years?.filter(y => y.active) || [];
  if (userProgramId && years.length > 0) {
    years = years.filter(y => !y.program || y.program === userProgramId || 
      (typeof y.program === 'object' && y.program?._id === userProgramId));
  }

  // Count enrollments per year
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
              {faculty ? faculty.name : "Your Academic Path"}
            </h1>
            <p className="mt-2 text-[var(--color-text-3)]">
              {faculty 
                ? `Select a year to view courses in ${faculty.code}.`
                : "Select a year to view courses and track your progress."}
            </p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => navigate("/student")} size="sm">
                Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/student/courses")}
                size="sm"
              >
                My Courses
              </Button>
            </div>
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
            {faculty ? `${faculty.code} - Academic Years` : "Academic Years"}
          </h2>
          
          {facultyLoading ? (
            <div className="grid gap-4 md:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : years.length === 0 ? (
            <EmptyState
              icon="🏛️"
              title={facultyId ? "No years configured" : "No faculty assigned"}
              description={
                facultyId 
                  ? "Your faculty has no active years configured."
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
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-[var(--color-accent)] text-white font-black text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                        {year.year}
                      </div>
                      <h3 className="font-bold text-[var(--color-text)]">{year.name}</h3>
                    </div>
                    <p className="text-sm text-[var(--color-text-2)] flex-1">
                      {year.semesters?.length || 0} semester{year.semesters?.length !== 1 ? "s" : ""} available
                    </p>
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
