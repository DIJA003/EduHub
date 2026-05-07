import { useState, useCallback, useEffect, useId } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import useAuthStore from "../../stores/auth.store";
import NotificationBell from "../common/NotificationBell";
import ThemeToggle from "./ThemeToggle";
import BrandMark from "./BrandMark";
import { initials } from "../../lib/utils";
import {
  staggerContainerProps,
  staggerItemProps,
  usePrefersReducedMotion,
} from "../../lib/motion";

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
      type="button"
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
function NavItem({ to, icon, label, end, collapsed, onNavigate }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius-lg)]",
          "text-[var(--text-sm)] font-medium transition-all duration-[var(--duration-fast)]",
          "group relative",
          isActive
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] ring-1 ring-[var(--color-accent)] ring-opacity-20"
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
        <span
          className={cn(
            "absolute left-full ml-2.5 px-2.5 py-1.5 z-[var(--z-dropdown)]",
            "bg-[var(--color-surface-3)] text-[var(--color-text)] text-[var(--text-xs)]",
            "rounded-[var(--radius-md)] whitespace-nowrap shadow-[var(--shadow-lg)]",
            "border border-[var(--color-border-2)]",
            "pointer-events-none opacity-0 group-hover:opacity-100 md:opacity-0 md:group-hover:opacity-100",
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
export default function DashboardShell({
  title,
  navItems,
  portalTitle,
  children,
}) {
  const reduced = usePrefersReducedMotion();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const logout = useAuthStore((s) => s.logout);
  const role = dbUser?.role;

  const nav = navItems ?? NAV_BY_ROLE[role] ?? STUDENT_NAV;

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const unlock = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", unlock);
    return () => mq.removeEventListener("change", unlock);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    navigate("/login", { replace: true });
  }, [logout, navigate]);

  const closeMobile = useCallback(() => setMobileOpen(false), []);
  const sidebarId = useId();

  const computedPortalTitle =
    portalTitle ??
    {
      admin: "Admin Portal",
      mentor: "Mentor Portal",
      student: "Student Portal",
    }[role] ??
    "Portal";

  const mobileSlide = mobileOpen ? "translate-x-0" : "-translate-x-full";

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[var(--color-ink)] font-sans">
      {/* Mobile backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        tabIndex={-1}
        className={cn(
          "fixed inset-0 z-[var(--z-raised)] bg-black/55 backdrop-blur-sm transition-opacity md:hidden",
          mobileOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={closeMobile}
      />

      {/* ── Sidebar ────────────────────── */}
      <aside
        id={sidebarId}
        role="navigation"
        aria-label="Application"
        className={cn(
          "flex shrink-0 flex-col",
          "fixed inset-y-0 left-0 z-[calc(var(--z-raised)+1)] border-r border-[var(--color-border)] md:relative md:z-[var(--z-raised)]",
          "w-[min(288px,calc(100vw-48px))] bg-[var(--color-surface)]/85 backdrop-blur-xl md:max-w-none",
          collapsed ? "md:w-[58px]" : "md:w-56",
          "transition-[transform,width] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          mobileSlide,
          "md:translate-x-0",
        )}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center gap-2.5 border-b border-[var(--color-border)] px-3 py-4",
            collapsed ? "justify-center md:justify-between" : "",
          )}
        >
          {!collapsed ? (
            <div className="flex min-w-0 flex-1 items-center gap-2.5">
              <motion.div layout={!reduced}>
                <BrandMark animated />
              </motion.div>
              <div className="min-w-0 flex-1 md:block">
                <p className="text-[var(--text-sm)] font-black leading-tight tracking-tight text-[var(--color-text)]">
                  EduHub
                </p>
                <p className="truncate text-[var(--text-xs)] text-[var(--color-text-3)]">
                  {computedPortalTitle}
                </p>
              </div>
            </div>
          ) : (
            <motion.div layout={!reduced} className="mx-auto md:mx-0">
              <BrandMark animated />
            </motion.div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "hidden shrink-0 rounded-[var(--radius-sm)] p-1 text-[var(--color-text-3)] md:block",
              "hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
              "transition-colors duration-[var(--duration-fast)]",
            )}
          >
            <svg
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={collapsed ? "M13 5l7 7-7 7" : "M11 19l-7-7 7-7"}
              />
            </svg>
          </button>
          <button
            type="button"
            aria-label="Close navigation"
            onClick={closeMobile}
            className="rounded-[var(--radius-sm)] p-1.5 text-[var(--color-text-3)] hover:bg-[var(--color-surface-2)] md:hidden"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        {reduced ? (
          <nav
            className={cn(
              "flex flex-1 flex-col space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-3 no-scrollbar",
            )}
            aria-label="Main navigation"
          >
            {nav.map((item) => (
              <NavItem
                key={item.to}
                {...item}
                collapsed={collapsed}
                onNavigate={closeMobile}
              />
            ))}
          </nav>
        ) : (
          <motion.nav
            className={cn(
              "flex flex-1 flex-col space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-3",
              "no-scrollbar",
            )}
            aria-label="Main navigation"
            {...staggerContainerProps(false, 0.04)}
          >
            {nav.map((item) => (
              <motion.div key={item.to} {...staggerItemProps(false)}>
                <NavItem
                  {...item}
                  collapsed={collapsed}
                  onNavigate={closeMobile}
                />
              </motion.div>
            ))}
          </motion.nav>
        )}

        {/* User info */}
        <div className="border-t border-[var(--color-border)] p-2">
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-[var(--radius-lg)] px-2 py-2 transition-colors duration-[var(--duration-fast)]",
              "hover:bg-[var(--color-surface-2)]",
              collapsed ? "justify-center" : "",
            )}
          >
            <Avatar name={dbUser?.name} onClick={() => navigate("/profile")} />
            {!collapsed && (
              <>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[var(--text-xs)] font-semibold text-[var(--color-text)]">
                    {dbUser?.name}
                  </p>
                  <p className="text-[var(--text-xs)] capitalize text-[var(--color-text-3)]">
                    {role}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                  className={cn(
                    "shrink-0 rounded-[var(--radius-sm)] p-1 transition-colors duration-[var(--duration-fast)]",
                    "text-[var(--color-text-3)] hover:text-[var(--color-danger)]",
                  )}
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
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
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Topbar */}
        <header className="glass sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)]/70 px-4 backdrop-blur-md sm:gap-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-2">
            <button
              type="button"
              className="inline-flex rounded-[var(--radius-md)] p-2 text-[var(--color-text-2)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)] md:hidden"
              aria-expanded={mobileOpen}
              aria-controls={sidebarId}
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <div className="min-w-0">
              {title && (
                <h1 className="truncate text-[var(--text-base)] font-semibold tracking-tight text-[var(--color-text)] md:text-[var(--text-lg)]">
                  {title}
                </h1>
              )}
            </div>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <NotificationBell />
            <Avatar
              name={dbUser?.name}
              onClick={() => navigate("/profile")}
              size="sm"
            />
          </div>
        </header>

        {/* Scrollable body */}
        <main id="dashboard-main" className="relative flex-1 overflow-y-auto overflow-x-hidden p-4 lg:p-8">
          {/* subtle grid for SaaS polish */}
          <div
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:48px_48px] opacity-[0.12]"
            aria-hidden="true"
          />
          <div className="relative">{children}</div>
        </main>
      </div>
    </div>
  );
}
