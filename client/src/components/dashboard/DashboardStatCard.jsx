import { cn } from "../../lib/utils";
import { motion, staggerItemProps, usePrefersReducedMotion } from "../../lib/motion";

const tints = {
  accent:
    "bg-[var(--color-accent-soft)] text-[var(--color-accent)] border-[var(--color-accent)]/25",
  success:
    "bg-[var(--color-success-soft)] text-[var(--color-success)] border-[var(--color-success)]/25",
  warning:
    "bg-[var(--color-warning-soft)] text-[var(--color-warning)] border-[var(--color-warning)]/25",
  danger:
    "bg-[var(--color-danger-soft)] text-[var(--color-danger)] border-[var(--color-danger)]/25",
};

export default function DashboardStatCard({
  title,
  value,
  icon,
  tint = "accent",
  className,
}) {
  const reduced = usePrefersReducedMotion();

  return (
    <motion.article
      className={cn(
        "glass relative overflow-hidden rounded-[var(--radius-xl)] border p-5",
        "shadow-[var(--shadow-md)] backdrop-blur-xl",
        "border-[var(--color-border)]",
        "transition-[transform,box-shadow] duration-[var(--duration-normal)]",
        "hover:-translate-y-0.5 hover:shadow-[var(--shadow-lg)]",
        reduced && "hover:translate-y-0",
        className,
      )}
      {...staggerItemProps(reduced)}
    >
      <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--color-accent)]/5 blur-2xl" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="text-[var(--text-xs)] font-semibold uppercase tracking-widest text-[var(--color-text-3)]">
            {title}
          </p>
          <p className="font-display text-3xl font-semibold tabular-nums tracking-tight text-[var(--color-text)]">
            {value ?? "—"}
          </p>
        </div>
        {icon != null && (
          <div
            className={cn(
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)] border text-lg",
              tints[tint] ?? tints.accent,
            )}
            aria-hidden="true"
          >
            {icon}
          </div>
        )}
      </div>
    </motion.article>
  );
}
