import { useNavigate } from "react-router-dom";
import { useMyEnrollments } from "../../enrollment/hooks/useEnrollments";
import { useAuth } from "../../../hooks/useAuth";
import Button from "../../../components/ui/Button";

const YEAR_COPY = {
  1: {
    title: "Year One",
    description:
      "Foundational Concepts: Principles of computing, mathematics, and logic.",
  },
  2: {
    title: "Year Two",
    description:
      "Intermediate Specializations: Data structures, algorithms, and systems.",
  },
  3: {
    title: "Year Three",
    description:
      "Advanced Applications: Software engineering, cloud architecture, and AI.",
  },
  4: {
    title: "Year Four",
    description:
      "Final Research & Thesis: Industry placements and capstone projects.",
  },
};

export default function AcademicYear() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] || "there";

  const { data: enrollmentsData } = useMyEnrollments();
  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];

  // Count enrollments per year
  const enrollmentsByYear = enrollments.reduce((acc, e) => {
    const yearId = e.yearId || 2;
    acc[yearId] = (acc[yearId] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Simple header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white text-sm font-black">
              E
            </div>
            <span className="font-bold text-slate-900">EduHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => navigate("/std-dashboard")}
            >
              Dashboard
            </Button>
            <Button size="sm" onClick={() => navigate("/home")}>
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide mb-1">
              Welcome back, {firstName}!
            </p>
            <h1 className="text-2xl font-black text-slate-900">
              Your Academic Path
            </h1>
            <p className="mt-2 text-slate-500">
              Select a year to view courses and track your progress.
            </p>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => navigate("/std-dashboard")} size="sm">
                Dashboard
              </Button>
              <Button
                variant="secondary"
                onClick={() => navigate("/std-dashboard")}
                size="sm"
              >
                My Courses
              </Button>
            </div>
          </div>
          <div className="shrink-0">
            <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-5xl">
              🎓
            </div>
          </div>
        </div>

        {/* Year Cards */}
        <section>
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400 mb-4">
            Academic Years
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2, 3, 4].map((yearNum) => {
              const copy = YEAR_COPY[yearNum];
              const enrolled = enrollmentsByYear[yearNum] || 0;

              return (
                <button
                  key={yearNum}
                  type="button"
                  onClick={() => navigate(`/academic-year/${yearNum}`)}
                  className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-blue-300 hover:shadow-md transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-black text-sm flex items-center justify-center group-hover:scale-105 transition-transform">
                      {yearNum}
                    </div>
                    <h3 className="font-bold text-slate-900">{copy.title}</h3>
                  </div>
                  <p className="text-sm text-slate-500 flex-1">
                    {copy.description}
                  </p>
                  {enrolled > 0 && (
                    <p className="mt-3 text-xs font-semibold text-blue-600">
                      {enrolled} course{enrolled !== 1 ? "s" : ""} enrolled
                    </p>
                  )}
                </button>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
