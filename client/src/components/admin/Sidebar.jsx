import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/admin",           icon: "dashboard",   label: "Dashboard"           },
  { to: "/admin/academics", icon: "school",      label: "Academic Management" },
  { to: "/admin/courses",   icon: "menu_book",   label: "Courses"             },
  { to: "/admin/materials", icon: "description", label: "Materials"           },
  { to: "/admin/users",     icon: "group",       label: "Users"               },
];

function Sidebar() {
  return (
    <aside className="w-[236px] bg-surface border-r border-border flex flex-col flex-shrink-0 overflow-hidden transition-[background,border-color] duration-200">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div
          className="w-[34px] h-[34px] bg-accent rounded-sm flex items-center justify-center text-white flex-shrink-0"
          style={{ boxShadow: "0 4px 14px rgba(36,99,235,0.35)" }}
        >
          <span className="material-symbols-outlined text-[18px]">auto_stories</span>
        </div>
        <div>
          <h2 className="text-[14.5px] font-bold tracking-tight text-text-primary leading-none">
            Edu<span className="text-accent-light">Hub</span>
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5 font-medium">Admin Portal</p>
        </div>
      </div>

      {/* Section label */}
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-text-muted px-4 pt-4 pb-2">
        Main Menu
      </p>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 px-3 flex-1 overflow-y-auto">
        {NAV_ITEMS.map(({ to, icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              "flex items-center gap-3 px-3 py-[9px] rounded-sm text-[13.5px] font-medium transition-all duration-150 border-l-2 whitespace-nowrap overflow-hidden " +
              (isActive
                ? "bg-[var(--accent-glow)] text-accent-light border-l-accent-light font-semibold"
                : "text-text-secondary border-l-transparent hover:bg-hover hover:text-text-primary")
            }
          >
            <span className="material-symbols-outlined text-[16px] w-5 text-center flex-shrink-0">
              {icon}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Footer user */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-3 px-2 py-2 rounded-sm cursor-pointer hover:bg-hover transition-colors">
          <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-white text-xs font-bold flex-shrink-0 border-2 border-border">
            A
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13.5px] font-semibold text-text-primary truncate">Admin User</p>
            <p className="text-[11px] text-text-muted truncate">Super Admin</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;