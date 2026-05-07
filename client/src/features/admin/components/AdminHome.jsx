import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../../lib/api/dashboard.api";
import api from "../../../lib/api/client";
import {
  CardSkeleton,
  TableSkeleton,
} from "../../../components/common/LoadingSkeleton";
import { timeAgo } from "../../../lib/utils";

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-[var(--color-accent-soft)]  text-[var(--color-accent)]",
    green: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
    amber: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
    red: "bg-[var(--color-danger-soft)]  text-[var(--color-danger)]",
  };

  return (
    <div className="surface p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[var(--text-xs)] font-bold uppercase tracking-widest text-[var(--color-text-3)]">
          {title}
        </p>
        <div
          className={`w-9 h-9 rounded-[var(--radius-md)] flex items-center justify-center text-base ${colors[color] ?? colors.blue}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
        {value ?? "—"}
      </p>
    </div>
  );
};

export default function AdminHome() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => dashboardApi.getStats().then((r) => r.data?.data ?? r.data),
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: () =>
      api
        .get("/logs", { params: { limit: 10 } })
        .then((r) => r.data?.data ?? []),
  });

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
          Overview Dashboard
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Welcome back, Admin. Here's what's happening today.
        </p>
      </div>

      {statsLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={stats?.totalStudents}
            icon="🎓"
            color="blue"
          />
          <StatCard
            title="Total Mentors"
            value={stats?.totalMentors}
            icon="👨‍🏫"
            color="green"
          />
          <StatCard
            title="Active Courses"
            value={stats?.activeCourses}
            icon="📚"
            color="amber"
          />
          <StatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals ?? 0}
            icon="⏳"
            color="red"
          />
        </div>
      )}

      <div className="surface overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)]">
            Recent Activity
          </h2>
        </div>

        {logsLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {["Action", "Entity", "Performed By", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-[var(--text-xs)] font-bold uppercase tracking-wide text-[var(--color-text-3)]"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {(logs || []).map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <td className="px-5 py-3 text-[var(--text-sm)] font-medium text-[var(--color-text)]">
                    {log.action}
                  </td>
                  <td className="px-5 py-3 text-[var(--text-sm)] text-[var(--color-text-2)]">
                    {log.entityName || log.entity}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[var(--text-xs)] font-bold flex items-center justify-center">
                        {log.performedBy?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-[var(--text-sm)] text-[var(--color-text-2)]">
                        {log.performedBy?.name || "System"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-[var(--text-xs)] text-[var(--color-text-3)]">
                    {timeAgo(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
