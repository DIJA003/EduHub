import { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { cn } from "../../lib/utils";
import useAuthStore from "../../stores/auth.store";
import NotificationBell from "../common/NotificationBell";
import { initials } from "../../lib/utils";

/* ── Nav helpers ─────────────────────────── */
export const STUDENT_NAV = [
  { to: "/std-dashboard", label: "Dashboard", icon: "⬡", end: true },
  { to: "/academic-year", label: "Academic Years", icon: "◈" },
  { to: "/profile", label: "Profile", icon: "◉" },
];

export const MENTOR_NAV = [
  { to: "/mentor", label: "Dashboard", icon: "⬡", end: true },
  { to: "/mentor/reviews", label: "Review Queue", icon: "◈" },
  { to: "/mentor/students", label: "My Students", icon: "◉" },
  { to: "/mentor/upload", label: "Upload", icon: "⊕" },
];

export const ADMIN_NAV = [
  { to: "/admin", label: "Overview", icon: "⬡", end: true },
  { to: "/admin/colleges", label: "Colleges", icon: "◈" },
  { to: "/admin/courses", label: "Courses", icon: "◈" },
  { to: "/admin/materials", label: "Materials", icon: "◈" },
  { to: "/admin/users", label: "Users", icon: "◉" },
  { to: "/admin/enrollments", label: "Enrollments", icon: "◈" },
  { to: "/admin/logs", label: "Audit Logs", icon: "◈" },
];

const NAV_BY_ROLE = {
  admin: ADMIN_NAV,
  mentor: MENTOR_NAV,
  student: STUDENT_NAV,
};

/* ── Avatar ──────────────────────────────── */
function Avatar({ name, size = "sm", onClick }) {
  const ini = initials(name);
  const hash = [...(name ?? "")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;

  const sizeMap = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        sizeMap[size] ?? sizeMap.sm,
        "rounded-full flex items-center justify-center font-bold text-white shrink-0",
        "transition-all duration-200 hover:ring-2 hover:ring-offset-2",
        "hover:ring-[var(--color-accent)] hover:ring-offset-[var(--color-ink)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
      )}
      style={{ background: `hsl(${hue},55%,45%)` }}
      title={name}
    >
      {ini}
    </button>
  );
}

/* ── NavItem ─────────────────────────────── */
function NavItem({ to, icon, label, end, collapsed }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)]",
          "text-[var(--text-sm)] font-medium transition-all duration-[var(--duration-fast)]",
          "group relative",
          isActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] border border-[var(--color-accent)] border-opacity-20"
            : "text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
        )
      }
    >
      <span
        className="shrink-0 text-base w-5 text-center leading-none"
        aria-hidden="true"
      >
        {icon}
      </span>
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        /* Tooltip on hover when collapsed */
        <span
          className={cn(
            "absolute left-full ml-2.5 px-2.5 py-1.5 z-50",
            "bg-[var(--color-surface-3)] text-[var(--color-text)] text-[var(--text-xs)]",
            "rounded-[var(--radius-md)] whitespace-nowrap shadow-[var(--shadow-lg)]",
            "border border-[var(--color-border-2)]",
            "pointer-events-none opacity-0 group-hover:opacity-100",
            "transition-opacity duration-[var(--duration-fast)]",
          )}
          role="tooltip"
        >
          {label}
        </span>
      )}
    </NavLink>
  );
}

/* ── Main Shell ──────────────────────────── */
export default function DashboardShell({ title, navItems, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const logout = useAuthStore((s) => s.logout);
  const role = dbUser?.role;

  const nav = navItems ?? NAV_BY_ROLE[role] ?? STUDENT_NAV;

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const portalTitle =
    {
      admin: "Admin Portal",
      mentor: "Mentor Portal",
      student: "Student Portal",
    }[role] ?? "Portal";

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-ink)] font-sans">
      {/* ── Sidebar ────────────────────── */}
      <aside
        className={cn(
          "flex flex-col flex-shrink-0 relative z-[var(--z-raised)]",
          "bg-[var(--color-surface)] border-r border-[var(--color-border)]",
          "transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          collapsed ? "w-[58px]" : "w-56",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-3 py-4 border-b border-[var(--color-border)]",
            collapsed && "justify-center",
          )}
        >
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-accent)] text-white text-sm font-black">
            E
          </div>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="text-[var(--text-sm)] font-black text-[var(--color-text)] leading-tight tracking-tight">
                EduHub
              </p>
              <p className="text-[var(--text-xs)] text-[var(--color-text-3)] truncate">
                {portalTitle}
              </p>
            </div>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-3)]",
              "hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
              "transition-colors duration-[var(--duration-fast)]",
              collapsed && "ml-0",
            )}
          >
            <svg
              className="w-3.5 h-3.5"
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

        {/* Nav links */}
        <nav
          className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto overflow-x-hidden"
          aria-label="Main navigation"
        >
          {nav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User info */}
        <div className="p-2 border-t border-[var(--color-border)]">
          <div
            className={cn(
              "flex items-center gap-2.5 px-2 py-2 rounded-[var(--radius-lg)]",
              "hover:bg-[var(--color-surface-2)] transition-colors duration-[var(--duration-fast)]",
              collapsed ? "justify-center" : "",
            )}
          >
            <Avatar
              name={dbUser?.name}
              onClick={() => navigate("/profile")}
              size="sm"
            />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-xs)] font-semibold text-[var(--color-text)] truncate">
                    {dbUser?.name}
                  </p>
                  <p className="text-[var(--text-xs)] text-[var(--color-text-3)] capitalize">
                    {role}
                  </p>
                </div>
                <button
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className={cn(
                    "shrink-0 p-1 rounded-[var(--radius-sm)]",
                    "text-[var(--color-text-3)] hover:text-[var(--color-danger)]",
                    "transition-colors duration-[var(--duration-fast)]",
                  )}
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

      {/* ── Main content ───────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 bg-[var(--color-surface)] border-b border-[var(--color-border)] shrink-0 gap-4 z-10">
          {title && (
            <h1 className="text-[var(--text-base)] font-bold text-[var(--color-text)] truncate">
              {title}
            </h1>
          )}
          <div className="flex items-center gap-3 ml-auto">
            <NotificationBell />
            <Avatar
              name={dbUser?.name}
              onClick={() => navigate("/profile")}
              size="sm"
            />
          </div>
        </header>

        {/* Scrollable body */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
