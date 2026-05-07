import { cn } from "../../lib/utils";

const variants = {
  default:
    "bg-[var(--color-surface-3)] text-[var(--color-text-2)] border-[var(--color-border-2)]",
  blue: "bg-blue-500/15    text-blue-400    border-blue-500/25",
  info: "bg-blue-500/15    text-blue-400    border-blue-500/25",
  green: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  success: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  yellow: "bg-amber-500/15   text-amber-400   border-amber-500/25",
  warning: "bg-amber-500/15   text-amber-400   border-amber-500/25",
  red: "bg-red-500/15     text-red-400     border-red-500/25",
  danger: "bg-red-500/15     text-red-400     border-red-500/25",
  purple: "bg-purple-500/15  text-purple-400  border-purple-500/25",
  gray: "bg-[var(--color-surface-2)] text-[var(--color-text-3)] border-[var(--color-border)]",
  accent:
    "bg-[var(--color-accent-soft)] text-[var(--color-accent-2)] border-[var(--color-accent)] border-opacity-25",
};

export default function Badge({
  variant = "default",
  children,
  className,
  dot = false,
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 border rounded-full",
        "px-2.5 py-0.5 text-[var(--text-xs)] font-semibold",
        variants[variant] || variants.default,
        className,
      )}
    >
      {dot && (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full shrink-0",
            variant === "yellow" || variant === "warning"
              ? "bg-amber-400 animate-pulse"
              : variant === "green" || variant === "success"
                ? "bg-emerald-400"
                : variant === "red" || variant === "danger"
                  ? "bg-red-400"
                  : variant === "blue" || variant === "info"
                    ? "bg-blue-400"
                    : "bg-[var(--color-text-3)]",
          )}
        />
      )}
      {children}
    </span>
  );
}

export const statusBadge = (status) => {
  const map = {
    active: "green",
    approved: "green",
    completed: "green",
    pending: "yellow",
    draft: "yellow",
    rejected: "red",
    dropped: "red",
    Published: "green",
    Draft: "yellow",
    Archived: "gray",
    Active: "green",
    Suspended: "red",
  };
  return map[status] || "default";
};
