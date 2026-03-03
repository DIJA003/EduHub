import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin",           icon: "⊞",  label: "Dashboard"           },
  { to: "/admin/academics", icon: "🎓",  label: "Academic Management" },
  { to: "/admin/courses",   icon: "📚",  label: "Course Management"   },
  { to: "/admin/materials", icon: "📄",  label: "Materials"           },
  { to: "/admin/users",     icon: "👥",  label: "Users"               },
];

function Sidebar() {
  return (
    <aside className="admin-sidebar">
      <div className="sidebar-logo">
        <h2>Edu<span>Hub</span></h2>
      </div>
      <div className="sidebar-section-label">Main Menu</div>
      <nav className="sidebar-nav">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) => isActive ? "active" : ""}
          >
            <span className="nav-icon">{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;