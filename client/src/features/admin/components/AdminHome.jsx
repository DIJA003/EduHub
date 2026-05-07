import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import api from "../../../lib/api/client";
import {
  CardSkeleton,
  TableSkeleton,
} from "../../../components/common/LoadingSkeleton";
import PageHeader from "../../../components/ui/PageHeader";
import DashboardStatCard from "../../../components/dashboard/DashboardStatCard";
import { Card } from "../../../components/ui/Card";
import { timeAgo } from "../../../lib/utils";
import {
  staggerContainerProps,
  usePrefersReducedMotion,
} from "../../../lib/motion";

export default function AdminHome() {
  const reduced = usePrefersReducedMotion();
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () =>
      api.get("/logs", { params: { limit: 10 } }).then((r) => r.data?.data || []),
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: () =>
      api.get("/logs", { params: { limit: 10 } }).then((r) => r.data?.data || []),
  });

  return (
    <div className="space-y-6 lg:space-y-8">
      <PageHeader
        eyebrow="Admin"
        title="Overview Dashboard"
        description="Welcome back. Monitor platform health and recent audit activity."
      />

      {statsLoading ? (
        <CardSkeleton count={4} />
      ) : reduced ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <DashboardStatCard
            title="Total Students"
            value={stats?.totalStudents}
            icon="🎓"
            tint="accent"
          />
          <DashboardStatCard
            title="Total Mentors"
            value={stats?.totalMentors}
            icon="👨‍🏫"
            tint="success"
          />
          <DashboardStatCard
            title="Active Courses"
            value={stats?.activeCourses}
            icon="📚"
            tint="warning"
          />
          <DashboardStatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals ?? 0}
            icon="⏳"
            tint="danger"
          />
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          {...staggerContainerProps(false, 0.07)}
        >
          <DashboardStatCard
            title="Total Students"
            value={stats?.totalStudents}
            icon="🎓"
            tint="accent"
          />
          <DashboardStatCard
            title="Total Mentors"
            value={stats?.totalMentors}
            icon="👨‍🏫"
            tint="success"
          />
          <DashboardStatCard
            title="Active Courses"
            value={stats?.activeCourses}
            icon="📚"
            tint="warning"
          />
          <DashboardStatCard
            title="Pending Approvals"
            value={stats?.pendingApprovals ?? 0}
            icon="⏳"
            tint="danger"
          />
        </motion.div>
      )}

      <Card variant="glass" padding={false} className="overflow-hidden">
        <div className="border-b border-[var(--color-border)] px-4 py-4 sm:px-6">
          <h2 className="text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
            Recent Activity
          </h2>
          <p className="mt-0.5 text-[var(--text-xs)] text-[var(--color-text-3)]">
            Latest actions across colleges, enrollments, and users.
          </p>
        </div>

        {logsLoading ? (
          <TableSkeleton rows={6} cols={4} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead className="bg-[var(--color-surface-2)]/80">
                <tr>
                  {["Action", "Entity", "Performed By", "Time"].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-4 py-3 text-[var(--text-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-3)] sm:px-6"
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
                    className="transition-colors duration-[var(--duration-fast)] hover:bg-[var(--color-surface-2)]/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-sm)] font-medium text-[var(--color-text)] sm:px-6">
                      {log.action}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-sm)] text-[var(--color-text-2)] sm:px-6">
                      {log.entityName || log.entity}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-sm)] sm:px-6">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--color-accent-soft)] text-[var(--text-xs)] font-bold text-[var(--color-accent)]">
                          {log.performedBy?.name?.[0]?.toUpperCase() || "?"}
                        </div>
                        <span className="text-[var(--color-text-2)]">
                          {log.performedBy?.name || "System"}
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-[var(--text-xs)] text-[var(--color-text-3)] sm:px-6 tabular-nums">
                      <time dateTime={log.createdAt}>
                        {timeAgo(log.createdAt)}
                      </time>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
