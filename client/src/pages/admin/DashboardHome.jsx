import { useState, useEffect } from "react";
import StatsCard from "../../components/admin/StatsCard";
import {
  tw,
  Badge,
  TableWrap,
  PageHeader,
} from "../../components/admin/adminUtils";
import { dashboardApi } from "../../services/api";

//test before actual data
const FALLBACK_ACTIVITY = [
  {
    id: 1,
    user: "Sara Ahmed",
    action: "enrolled in React Fundamentals",
    time: "2m ago",
  },
  {
    id: 2,
    user: "Omar Khalid",
    action: "submitted assignment for CS101",
    time: "15m ago",
  },
  {
    id: 3,
    user: "Layla Hassan",
    action: "uploaded new material",
    time: "1h ago",
  },
  {
    id: 4,
    user: "Karim Ali",
    action: "completed Python Basics course",
    time: "3h ago",
  },
];

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function DashboardHome() {
  const [stats, setStats] = useState(null);
  const [activity, setActivity] = useState(FALLBACK_ACTIVITY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      dashboardApi.getStats().catch(() => null),
      dashboardApi.getActivity().catch(() => null),
    ])
      .then(([s, a]) => {
        if (s?.data) setStats(s.data);
        if (a?.data?.length) {
          setActivity(
            a.data.map((item) => ({
              id: item.id,
              user: item.user,
              action: item.action,
              time: timeAgo(item.time),
            })),
          );
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: "Total Students",
      value: loading ? "…" : String(stats?.totalStudents ?? "—"),
      icon: "🎓",
      iconColor: "blue",
      delta: "this month",
      deltaType: "up",
    },
    {
      title: "Total Mentors",
      value: loading ? "…" : String(stats?.totalMentors ?? "—"),
      icon: "👨‍🏫",
      iconColor: "green",
      delta: "registered",
      deltaType: "up",
    },
    {
      title: "Active Courses",
      value: loading ? "…" : String(stats?.activeCourses ?? "—"),
      icon: "📚",
      iconColor: "amber",
      delta: "published",
      deltaType: "up",
    },
    {
      title: "Pending Approvals",
      value: loading ? "…" : String(stats?.pendingApprovals ?? "0"),
      icon: "⏳",
      iconColor: "red",
      delta: "to review",
      deltaType: "down",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Overview Dashboard"
        subtitle="Welcome back, Admin. Here's what's happening today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        {statCards.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <TableWrap
        toolbar={
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            Recent Activity
          </span>
        }
      >
        <table className="w-full border-collapse">
          <thead style={{ background: "var(--bg-card)" }}>
            <tr>
              <th className={tw.th}>User</th>
              <th className={tw.th}>Action</th>
              <th className={tw.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {activity.map((item) => (
              <tr key={item.id} className={tw.trHover}>
                <td className={tw.td}>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white bg-accent"
                      style={{ border: "1px solid var(--accent-glow)" }}
                    >
                      {item.user[0]}
                    </div>
                    <span
                      className="text-[13.5px] font-medium"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {item.user}
                    </span>
                  </div>
                </td>
                <td
                  className={tw.td}
                  style={{
                    borderBottomColor: "var(--border-light)",
                    color: "var(--text-secondary)",
                  }}
                >
                  {item.action}
                </td>
                <td
                  className={tw.td}
                  style={{ borderBottomColor: "var(--border-light)" }}
                >
                  <Badge variant="default">{item.time}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableWrap>
    </div>
  );
}

export default DashboardHome;
