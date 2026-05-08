import { CardSkeleton } from "../../../components/common/LoadingSkeleton";

const STAT_CONFIG = (enrollments, inProgress, completed, materialsCount) => [
  {
    label: "Enrolled Courses",
    value: enrollments,
    icon: "📚",
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "In Progress",
    value: inProgress,
    icon: "▶️",
    color: "bg-amber-50 text-amber-600",
  },
  {
    label: "Completed",
    value: completed,
    icon: "🎓",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    label: "Materials Uploaded",
    value: materialsCount,
    icon: "📎",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function StudentStats({ enrollments, materials, loading }) {
  if (loading) return <CardSkeleton count={4} />;

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  ).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const stats = STAT_CONFIG(
    enrollments.length,
    inProgress,
    completed,
    materials.length,
  );

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="surface-2 p-5 hover-lift"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]">
              {s.label}
            </p>
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${s.color}`}
            >
              {s.icon}
            </div>
          </div>
          <p className="text-3xl font-black text-[var(--color-text)]">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
