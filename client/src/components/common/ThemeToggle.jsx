import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";
import { useTheme } from "../../context/ThemeContext";

/** Pill switch (sidebar / dashboard topbar). */
export function ThemeTogglePill({ className }) {
  const theme = useTheme();
  if (!theme) return null;
  const { darkMode, toggleDarkMode } = theme;

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={cn(
        "relative w-14 h-7 rounded-full p-1 shrink-0",
        "bg-[var(--color-surface-2)] border border-[var(--color-border)]",
        "transition-colors duration-[var(--duration-normal)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      <motion.div
        className={cn(
          "absolute top-1 w-5 h-5 rounded-full flex items-center justify-center",
          "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)]",
        )}
        animate={{ left: darkMode ? "calc(100% - 24px)" : "4px" }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
      >
        {darkMode ? (
          <Moon className="w-3 h-3" strokeWidth={2} />
        ) : (
          <Sun className="w-3 h-3" strokeWidth={2} />
        )}
      </motion.div>
    </button>
  );
}

/** Compact control for headers and corner placement. */
export function ThemeToggleIconButton({ className }) {
  const theme = useTheme();
  if (!theme) return null;
  const { darkMode, toggleDarkMode } = theme;

  return (
    <button
      type="button"
      onClick={toggleDarkMode}
      className={cn(
        "inline-flex items-center justify-center rounded-[var(--radius-lg)] p-2 shrink-0",
        "border border-[var(--color-border)] bg-[var(--color-surface-2)] text-[var(--color-text)]",
        "hover:bg-[var(--color-surface-3)] hover:border-[var(--color-border-2)]",
        "transition-colors duration-[var(--duration-fast)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
      aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
    >
      {darkMode ? (
        <Moon className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden />
      ) : (
        <Sun className="w-[18px] h-[18px]" strokeWidth={2} aria-hidden />
      )}
    </button>
  );
}

/** Fixed top-right placement helper for auth and minimal layouts. */
export function ThemeToggleFixedCorner() {
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[100] flex justify-end p-3 sm:p-4">
      <div className="pointer-events-auto">
        <ThemeToggleIconButton />
      </div>
    </div>
  );
}
