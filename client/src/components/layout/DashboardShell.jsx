import React, { useState, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, LogOut, Menu, X } from "lucide-react";
import { cn } from "../../lib/utils";
import useAuthStore from "../../stores/auth.store";
import NotificationBell from "../common/NotificationBell";
import { initials } from "../../lib/utils";
import { ThemeTogglePill } from "../common/ThemeToggle";
import { NAV_BY_ROLE } from "../../constants/navigation";
import { EduHubLogo } from "../ui/Logo";

/* ── Avatar ──────────────────────────── */
function Avatar({ name, photoURL, size = "sm", onClick }) {
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
        "rounded-full flex items-center justify-center font-bold text-white shrink-0 overflow-hidden",
        "transition-all duration-200",
        "hover:ring-2 hover:ring-offset-2",
        "hover:ring-[var(--color-accent)] hover:ring-offset-[var(--color-ink)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
      )}
      style={!photoURL ? { background: `hsl(${hue},55%,45%)` } : undefined}
      title={name}
    >
      {photoURL ? (
        <img
          src={photoURL}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        ini
      )}
    </button>
  );
}

/* ── NavItem ─────────────────────────── */
function NavItem({ to, icon: Icon, label, end, collapsed }) {
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
            ? "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] border border-[var(--color-accent)] border-opacity-25 shadow-[0_0_12px_var(--color-accent-glow)]"
            : "text-[var(--color-text-3)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
        )
      }
    >
      {Icon && (
        <Icon
          className="shrink-0 w-[18px] h-[18px]"
          strokeWidth={1.75}
          aria-hidden="true"
        />
      )}
      {!collapsed && <span className="truncate">{label}</span>}
      {collapsed && (
        <span
          className={cn(
            "absolute left-full ml-2.5 px-2.5 py-1.5 z-50",
            "glass-strong text-[var(--color-text)] text-[var(--text-xs)]",
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

/* ── Main Shell ──────────────────────── */
export default function DashboardShell({ title, navItems, children }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const dbUser = useAuthStore((s) => s.dbUser);
  const logout = useAuthStore((s) => s.logout);
  const role = dbUser?.role;
  const nav = navItems ?? NAV_BY_ROLE[role] ?? NAV_BY_ROLE.student;

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
    <div className="flex h-screen overflow-hidden bg-[var(--color-ink)] font-sans relative">
      {/* Aurora background */}
      <div className="aurora-bg" aria-hidden="true">
        <div className="aurora-bg__blob-1" />
        <div className="aurora-bg__blob-2" />
        <div className="aurora-bg__blob-3" />
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-[var(--z-overlay)] lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu overlay"
          />
        ) : null}
      </AnimatePresence>

      <motion.aside
        className={cn(
          "fixed inset-y-0 left-0 lg:relative flex flex-col flex-shrink-0 z-[var(--z-overlay)] lg:z-[var(--z-raised)]",
          "glass-strong border-r border-[var(--color-border)]",
          "transition-[width] duration-[var(--duration-slow)] ease-[var(--ease-out)]",
          collapsed ? "w-[68px]" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
        animate={{ x: mobileOpen ? 0 : undefined }}
      >
        {/* Brand */}
        <div
          className={cn(
            "flex items-center gap-2.5 px-4 py-4 border-b border-[var(--color-border)]",
            collapsed && "justify-center px-3",
          )}
        >
          <button
            onClick={() => navigate(role === "admin" ? "/admin" : role === "mentor" ? "/mentor" : "/student")}
            className="shrink-0 hover:scale-105 transition-transform"
            title="Go to Dashboard"
          >
            <EduHubLogo className="h-8 w-8 shrink-0 shadow-[var(--shadow-accent)] rounded-[var(--radius-md)]" />
          </button>
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
          {/* Desktop collapse button */}
          <button
            onClick={() => setCollapsed((c) => !c)}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            className={cn(
              "shrink-0 p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-3)]",
              "hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
              "transition-colors duration-[var(--duration-fast)]",
              "hidden lg:flex items-center justify-center",
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" strokeWidth={2} />
            ) : (
              <ChevronLeft className="w-4 h-4" strokeWidth={2} />
            )}
          </button>
          {/* Mobile close button */}
          <button
            onClick={() => setMobileOpen(false)}
            aria-label="Close sidebar"
            className={cn(
              "shrink-0 p-1.5 rounded-[var(--radius-md)] text-[var(--color-text-3)]",
              "hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]",
              "transition-colors duration-[var(--duration-fast)]",
              "lg:hidden flex items-center justify-center",
            )}
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        </div>

        {/* Nav */}
        <nav
          className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden no-scrollbar"
          aria-label="Main navigation"
        >
          {nav.map((item) => (
            <NavItem key={item.to} {...item} collapsed={collapsed} />
          ))}
        </nav>

        {/* User bottom */}
        <div className="p-3 border-t border-[var(--color-border)]">
          <div
            className={cn(
              "flex items-center gap-2.5 px-2 py-2.5 rounded-[var(--radius-lg)]",
              "hover:bg-[var(--color-surface-2)] transition-colors duration-[var(--duration-fast)]",
              collapsed ? "justify-center" : "",
            )}
          >
            <Avatar
              name={dbUser?.name}
              photoURL={dbUser?.photoURL}
              onClick={() => navigate("/profile")}
              size="sm"
            />
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-[var(--text-sm)] font-semibold text-[var(--color-text)] truncate">
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
                    "shrink-0 p-1.5 rounded-[var(--radius-md)]",
                    "text-[var(--color-text-3)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)]",
                    "transition-colors duration-[var(--duration-fast)]",
                  )}
                >
                  <LogOut className="w-4 h-4" strokeWidth={2} />
                </button>
              </>
            )}
          </div>
        </div>
      </motion.aside>

      {/* ── Main content ───────────────── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 glass-strong border-b border-[var(--color-border)] shrink-0 gap-4 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 rounded-[var(--radius-md)] hover:bg-[var(--color-surface-2)] text-[var(--color-text-2)]"
              aria-label={mobileOpen ? "Close sidebar" : "Open sidebar"}
            >
              {mobileOpen ? (
                <X className="w-5 h-5" strokeWidth={2} />
              ) : (
                <Menu className="w-5 h-5" strokeWidth={2} />
              )}
            </button>
            {title && (
              <h1 className="text-[var(--text-base)] font-bold text-[var(--color-text)] truncate">
                {title}
              </h1>
            )}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <ThemeTogglePill />
            <NotificationBell />
            <div className="hidden sm:block">
              <Avatar
                name={dbUser?.name}
                photoURL={dbUser?.photoURL}
                onClick={() => navigate("/profile")}
                size="sm"
              />
            </div>
          </div>
        </header>

        {/* Scrollable body */}
        <motion.main
          key={title || "dashboard-content"}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 custom-scrollbar"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
