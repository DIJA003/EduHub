import { Moon, Sun } from "lucide-react";
import { cn } from "../../lib/utils";
import { useThemeStore } from "../../stores/theme.store";

export default function ThemeToggle({ className }) {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggleTheme);

  const isDark = theme !== "light";

  return (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        "inline-flex rounded-[var(--radius-md)] p-2 text-[var(--color-text-2)]",
        "transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        className,
      )}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      {isDark ? (
        <Sun className="h-5 w-5" aria-hidden strokeWidth={1.85} />
      ) : (
        <Moon className="h-5 w-5" aria-hidden strokeWidth={1.85} />
      )}
    </button>
  );
}
