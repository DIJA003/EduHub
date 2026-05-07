import { cn } from "../../lib/utils";
import Button from "../ui/Button";

export function Skeleton({ className, style }) {
  return (
    <div
      className={cn("skeleton", className)}
      style={style}
      aria-hidden="true"
    />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div role="status" aria-label="Loading table data">
      <div className="flex gap-4 px-5 py-3 border-b border-[var(--color-border)]">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-2.5 flex-1 max-w-[120px]" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex gap-4 px-5 py-4 border-b border-[var(--color-border)] last:border-0"
          style={{ opacity: 1 - i * 0.12 }}
        >
          {Array.from({ length: cols }, (_, j) => (
            <Skeleton
              key={j}
              className={cn(
                "h-4 flex-1",
                j === 0 ? "max-w-[180px]" : `max-w-[${100 + j * 30}px]`,
              )}
            />
          ))}
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div
      className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
      aria-label="Loading"
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 space-y-3"
          style={{ opacity: 1 - i * 0.1 }}
        >
          <Skeleton className="h-2.5 w-20" />
          <Skeleton className="h-9 w-16" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }) {
  return (
    <div className="space-y-3" role="status" aria-label="Loading">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton
          key={i}
          className="h-16 w-full rounded-[var(--radius-xl)]"
          style={{ opacity: 1 - i * 0.15 }}
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div
      className="flex items-center gap-4"
      role="status"
      aria-label="Loading profile"
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  compact = false,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "py-10 px-4" : "py-16 px-6",
      )}
      role="status"
    >
      {icon && (
        <div
          className={cn(
            "mb-4 flex items-center justify-center",
            "bg-[var(--color-surface-2)] rounded-[var(--radius-xl)]",
            "text-[var(--color-text-3)]",
            compact ? "w-12 h-12 text-2xl" : "w-16 h-16 text-3xl",
          )}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <h3
        className={cn(
          "font-semibold text-[var(--color-text)]",
          compact ? "text-[var(--text-sm)]" : "text-[var(--text-base)]",
        )}
      >
        {title}
      </h3>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-[var(--color-text-3)] max-w-xs leading-relaxed",
            compact ? "text-[var(--text-xs)]" : "text-[var(--text-sm)]",
          )}
        >
          {description}
        </p>
      )}
      {action && typeof action === "function" && actionLabel && (
        <Button className="mt-5" size="sm" onClick={action}>
          {actionLabel}
        </Button>
      )}
      {action && typeof action !== "function" && (
        <div className="mt-5">{action}</div>
      )}
    </div>
  );
}
