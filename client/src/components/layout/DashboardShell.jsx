import { useState } from "react";
import { NavLink, useNavigate, Link } from "react-router-dom";
import { cn } from "../../lib/utils";
import useAuthStore from "../../stores/auth.store";
import NotificationBell from "../common/NotificationBell";

const STUDENT_NAV = [
  { to: "/std-dashboard", label: "Dashboard", icon: "📊", end: true },
  { to: "/academic-year", label: "Academic Years", icon: "🎓" },
  { to: "/profile", label: "Profile", icon: "👤" },
];

const MENTOR_NAV = [
  { to: "/mentor/queue", label: "Review Queue", icon: "📥", end: false },
  { to: "/mentor/courses", label: "My Courses", icon: "📚", end: false },
  { to: "/mentor/reviewed", label: "Reviewed", icon: "✅", end: false },
];

const ADMIN_NAV = [
  { to: "/admin/overview", label: "Overview", icon: "📊", end: false },
  { to: "/admin/users", label: "Users", icon: "👥", end: false },
  { to: "/admin/materials", label: "Materials", icon: "📄", end: false },
  { to: "/admin/logs", label: "Audit Logs", icon: "📋", end: false },
];

function getNavForRole(role) {
  if (role === "admin") return ADMIN_NAV;
  if (role === "mentor") return MENTOR_NAV;
  return STUDENT_NAV;
}

const toInitials = (name = "") =>
  name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "?";

export default function DashboardShell({ title, navItems, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const logout = useAuthStore((s) => s.logout);
  const role = useAuthStore((s) => s.dbUser?.role);

  const nav = navItems || getNavForRole(role);
  const initials = toInitials(dbUser?.name);

  const portalLabels = {
    admin: "Admin Portal",
    mentor: "Mentor Portal",
    student: "Student Portal",
  };
  const portalLabel = portalLabels[role] || "Portal";

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans">
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 bg-white border-r border-slate-200 transition-all duration-200",
          collapsed ? "w-14" : "w-56",
        )}
      >
        <div className="flex items-center gap-2.5 px-3 py-4 border-b border-slate-100">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white text-sm font-black shrink-0">
            E
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-900 leading-tight">
                EduHub
              </p>
              <p className="text-xs text-slate-400 truncate">{portalLabel}</p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="ml-auto text-slate-300 hover:text-slate-600 transition-colors shrink-0"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
              />
            </svg>
          </button>
        </div>

        <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-blue-50 text-blue-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                )
              }
            >
              <span className="shrink-0 text-base w-5 text-center">{icon}</span>
              {!collapsed && <span className="truncate">{label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="p-2 border-t border-slate-100">
          <div
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-50 cursor-pointer"
            onClick={() => navigate("/profile")}
          >
            <div className="h-8 w-8 shrink-0 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
              {initials}
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-900 truncate">
                    {dbUser?.name}
                  </p>
                  <p className="text-xs text-slate-400 capitalize">{role}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    logout();
                  }}
                  title="Log out"
                  className="shrink-0 text-slate-300 hover:text-red-500 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>
      </aside>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        <header className="h-14 flex items-center justify-between px-6 bg-white border-b border-slate-200 shrink-0 gap-4">
          {title && (
            <h1 className="text-base font-bold text-slate-900 truncate">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <div
              className="h-8 w-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-blue-300 transition-all"
              onClick={() => navigate("/profile")}
              title={dbUser?.name}
            >
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
