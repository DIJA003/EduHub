import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api/client";
import {
  CardSkeleton,
  TableSkeleton,
} from "../../../components/common/LoadingSkeleton";
import { timeAgo } from "../../../lib/utils";

const StatCard = ({ title, value, icon, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
          {title}
        </p>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${colors[color] || colors.blue}`}
        >
          {icon}
        </div>
      </div>
      <p className="text-3xl font-black text-slate-900">{value ?? "—"}</p>
    </div>
  );
};

export default function AdminHome() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => api.get("/admin/stats").then((r) => r.data?.data || r.data),
  });

  const { data: logs, isLoading: logsLoading } = useQuery({
    queryKey: ["admin-recent-logs"],
    queryFn: () => api.get("/logs?limit=10").then((r) => r.data?.data || []),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Overview Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
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

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">Recent Activity</h2>
        </div>

        {logsLoading ? (
          <TableSkeleton rows={6} cols={3} />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Action", "Entity", "Performed By", "Time"].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(logs || []).map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm font-medium text-slate-700">
                    {log.action}
                  </td>
                  <td className="px-5 py-3 text-sm text-slate-600">
                    {log.entityName || log.entity}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                        {log.performedBy?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="text-sm text-slate-700">
                        {log.performedBy?.name || "System"}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs text-slate-400">
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
