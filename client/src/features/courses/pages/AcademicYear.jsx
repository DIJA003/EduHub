import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";

const YEAR_META = [
  {
    year: 1,
    label: "First Year",
    desc: "Foundation courses — core concepts and fundamentals.",
    icon: "🌱",
    color: "from-emerald-500 to-teal-500",
  },
  {
    year: 2,
    label: "Second Year",
    desc: "Intermediate level — deeper subject coverage.",
    icon: "📗",
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: 3,
    label: "Third Year",
    desc: "Advanced topics and specialisation begins.",
    icon: "📘",
    color: "from-indigo-500 to-purple-500",
  },
  {
    year: 4,
    label: "Fourth Year",
    desc: "Capstone projects and final examinations.",
    icon: "🎓",
    color: "from-orange-500 to-rose-500",
  },
];

export default function AcademicYear() {
  const dbUser = useAuthStore((s) => s.dbUser);

  const { data: yearsData = [], isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: async () => {
      const res = await apiClient.get("/academic-years");
      return res.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const years = YEAR_META.map((meta) => {
    const api = yearsData.find((y) => y.year === meta.year) || {};
    return { ...meta, ...api, id: api._id || api.id || `year-${meta.year}` };
  });

  return (
    <DashboardShell title="Academic Years" user={dbUser}>
      <div className="mb-6">
        <h2 className="text-xl font-black text-slate-900">Choose your year</h2>
        <p className="mt-1 text-sm text-slate-500">
          Select an academic year to browse and enroll in available courses.
        </p>
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {years.map((yr) => (
            <Link
              key={yr.year}
              to={`/academic-year/${yr.id}`}
              className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 hover:shadow-md hover:ring-blue-200 transition-all"
            >
              <div className={`h-2 bg-gradient-to-r ${yr.color}`} />
              <div className="p-6">
                <span className="text-3xl">{yr.icon}</span>
                <h3 className="mt-3 font-black text-slate-900">{yr.label}</h3>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  {yr.desc}
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-blue-600 group-hover:gap-2 transition-all">
                  Browse courses <span className="ml-1">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
