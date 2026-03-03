import StatsCard from "../../components/admin/StatsCard";

const RECENT_ACTIVITY = [
  { id: 1, user: "Sara Ahmed",  action: "enrolled in React Fundamentals",  time: "2m ago",  type: "enroll" },
  { id: 2, user: "Omar Khalid", action: "submitted assignment for CS101",   time: "15m ago", type: "submit" },
  { id: 3, user: "Layla Hassan", action: "uploaded new material",           time: "1h ago",  type: "upload" },
  { id: 4, user: "Karim Ali",   action: "completed Python Basics course",   time: "3h ago",  type: "complete" },
];

function DashboardHome() {
  return (
    <div>
      <div className="page-header">
        <div className="page-header-left">
          <h1>Overview Dashboard</h1>
          <p>Welcome back, Admin. Here's what's happening today.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          title="Total Students"
          value="1,284"
          icon="🎓"
          iconBg="rgba(36,99,235,0.15)"
          delta="12% this month"
          deltaType="up"
        />
        <StatsCard
          title="Total Mentors"
          value="48"
          icon="👨‍🏫"
          iconBg="rgba(34,197,94,0.12)"
          delta="3 new this week"
          deltaType="up"
        />
        <StatsCard
          title="Active Courses"
          value="76"
          icon="📚"
          iconBg="rgba(245,158,11,0.12)"
          delta="5 added recently"
          deltaType="up"
        />
        <StatsCard
          title="Pending Approvals"
          value="9"
          icon="⏳"
          iconBg="rgba(239,68,68,0.12)"
          delta="2 urgent"
          deltaType="down"
        />
      </div>

      <div className="table-wrap">
        <div className="table-toolbar">
          <span className="table-toolbar-title">Recent Activity</span>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Action</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ACTIVITY.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">{item.user[0]}</div>
                    <span className="user-cell-name">{item.user}</span>
                  </div>
                </td>
                <td style={{ color: "var(--text-secondary)" }}>{item.action}</td>
                <td><span className="badge badge-default">{item.time}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DashboardHome;