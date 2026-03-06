import StatsCard from "../../components/admin/StatsCard";
import { tw, Badge, TableWrap, PageHeader } from "../../components/admin/adminUtils";

const RECENT_ACTIVITY = [
  { id: 1, user: "Sara Ahmed",   action: "enrolled in React Fundamentals",  time: "2m ago",  },
  { id: 2, user: "Omar Khalid",  action: "submitted assignment for CS101",   time: "15m ago", },
  { id: 3, user: "Layla Hassan", action: "uploaded new material",            time: "1h ago",  },
  { id: 4, user: "Karim Ali",    action: "completed Python Basics course",   time: "3h ago",  },
];

function DashboardHome() {
  return (
    <div>
      <PageHeader
        title="Overview Dashboard"
        subtitle="Welcome back, Admin. Here's what's happening today."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <StatsCard title="Total Students"    value="1,284" icon="🎓" iconBg="rgba(36,99,235,0.15)"  delta="12% this month"  deltaType="up"   />
        <StatsCard title="Total Mentors"     value="48"    icon="👨‍🏫" iconBg="rgba(34,197,94,0.12)"  delta="3 new this week" deltaType="up"   />
        <StatsCard title="Active Courses"    value="76"    icon="📚" iconBg="rgba(245,158,11,0.12)" delta="5 added recently"deltaType="up"   />
        <StatsCard title="Pending Approvals" value="9"     icon="⏳" iconBg="rgba(239,68,68,0.12)"  delta="2 urgent"        deltaType="down" />
      </div>

      <TableWrap
        toolbar={
          <span className="text-[13.5px] font-semibold text-text-primary">Recent Activity</span>
        }
      >
        <table className="w-full border-collapse">
          <thead className="bg-card">
            <tr>
              <th className={tw.th}>User</th>
              <th className={tw.th}>Action</th>
              <th className={tw.th}>Time</th>
            </tr>
          </thead>
          <tbody>
            {RECENT_ACTIVITY.map((item) => (
              <tr key={item.id} className={tw.trHover}>
                <td className={tw.td}>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border border-[rgba(36,99,235,0.3)]">
                      {item.user[0]}
                    </div>
                    <span className="text-[13.5px] font-medium text-text-primary">{item.user}</span>
                  </div>
                </td>
                <td className={tw.td + " !text-text-secondary"}>{item.action}</td>
                <td className={tw.td}>
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