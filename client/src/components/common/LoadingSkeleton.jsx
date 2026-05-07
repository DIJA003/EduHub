import { cn } from "../../lib/utils";

export function Skeleton({ className }) {
  return <div className={cn("skeleton", className)} aria-hidden="true" />;
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div role="status" aria-label="Loading table data">
      <div className="flex gap-4 border-b border-[var(--color-border)] px-5 py-3">
        {Array.from({ length: cols }, (_, i) => (
          <Skeleton key={i} className="h-2.5 max-w-[120px] flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-[var(--color-border)] px-5 py-4 last:border-0"
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
          className="space-y-3 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface)]/60 p-5 backdrop-blur-md"
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
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}
