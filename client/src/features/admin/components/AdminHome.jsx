import { useQuery } from "@tanstack/react-query";
import {
  Users,
  BookOpen,
  AlertCircle,
  Clock,
} from "lucide-react";
import { dashboardApi } from "../../../lib/api/dashboard.api";
import api from "../../../lib/api/client";
import {
  CardSkeleton,
  TableSkeleton,
} from "../../../components/common/LoadingSkeleton";
import { StatsCard } from "../../../components/ui";
import { timeAgo } from "../../../lib/utils";

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
          <StatsCard
            label="Total Students"
            value={stats?.totalStudents}
            icon={Users}
            trend="up"
            color="accent"
          />
          <StatsCard
            label="Total Mentors"
            value={stats?.totalMentors}
            icon={Users}
            trend="stable"
            color="success"
          />
          <StatsCard
            label="Active Courses"
            value={stats?.activeCourses}
            icon={BookOpen}
            trend="up"
            color="warning"
          />
          <StatsCard
            label="Pending Approvals"
            value={stats?.pendingApprovals ?? 0}
            icon={AlertCircle}
            color="danger"
          />
        </div>
      )}

      <div className="card">
        <div className="px-6 py-5 border-b border-[var(--color-border)] flex items-center justify-between">
          <div>
            <h2 className="text-[var(--text-lg)] font-bold text-[var(--color-text)]">
              Recent Activity
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Latest system logs and user actions
            </p>
          </div>
          <Clock className="text-[var(--color-text-3)]" size={20} />
        </div>
        {logsLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                {["Action", "Entity", "Performed By", "Time"].map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(logs || []).map((log) => (
                <tr key={log._id}>
                  <td className="font-medium text-[var(--color-text)]">
                    {log.action}
                  </td>
                  <td className="text-[var(--color-text-2)]">
                    {log.entityName || log.entity}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[var(--text-xs)] font-bold flex items-center justify-center">
                        {log.performedBy?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-[var(--color-text-2)]">
                        {log.performedBy?.name || "System"}
                      </span>
                    </div>
                  </td>
                  <td className="text-[var(--color-text-3)]">
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
