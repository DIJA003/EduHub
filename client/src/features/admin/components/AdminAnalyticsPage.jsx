import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../../../lib/api/dashboard.api";
import { logsApi } from "../../../lib/api/logs.api";
import { CardSkeleton, ListSkeleton } from "../../../components/common/LoadingSkeleton";
import Badge from "../../../components/ui/Badges";
import { timeAgo } from "../../../lib/utils";

function Metric({ label, value, icon }) {
  return (
    <div className="surface-2 p-5">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]">
          {label}
        </p>
        <span>{icon}</span>
      </div>
      <p className="text-3xl font-black text-[var(--color-text)]">{value ?? "—"}</p>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-analytics-stats"],
    queryFn: () => dashboardApi.getStats().then((r) => r.data?.data ?? r.data),
  });

  const { data: logsData, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-analytics-logs"],
    queryFn: () => logsApi.getAll({ limit: 80 }).then((r) => r.data),
  });

  const logs = useMemo(
    () => (Array.isArray(logsData) ? logsData : logsData?.data || []),
    [logsData],
  );

  const actionCounts = useMemo(() => {
    return logs.reduce((acc, log) => {
      const key = log.action || "OTHER";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [logs]);

  const topActions = Object.entries(actionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
          Platform Analytics
        </h1>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Operational health, activity volume, and trend snapshots.
        </p>
      </div>

      {statsLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Metric label="Students" value={stats?.totalStudents} icon="🎓" />
          <Metric label="Mentors" value={stats?.totalMentors} icon="👨‍🏫" />
          <Metric label="Active Courses" value={stats?.activeCourses} icon="📚" />
          <Metric label="Pending Approvals" value={stats?.pendingApprovals} icon="⏳" />
        </div>
      )}

      <div className="surface p-4 sm:p-5">
        <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Top Actions</h2>
        {logsLoading ? (
          <ListSkeleton rows={5} />
        ) : topActions.length === 0 ? (
          <p className="text-sm text-[var(--color-text-3)]">No activity data available.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {topActions.map(([action, count]) => (
              <Badge key={action} variant="accent">
                {action}: {count}
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="surface p-4 sm:p-5">
        <h2 className="text-sm font-bold text-[var(--color-text)] mb-3">Recent Events</h2>
        {logsLoading ? (
          <ListSkeleton rows={6} />
        ) : (
          <div className="space-y-2">
            {logs.slice(0, 10).map((log) => (
              <div
                key={log._id}
                className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3.5 py-2.5"
              >
                <p className="text-sm text-[var(--color-text)] font-medium">
                  {log.action} • {log.entity}
                </p>
                <p className="text-xs text-[var(--color-text-3)] mt-1">{timeAgo(log.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
