import { cn } from "../../lib/utils";

function Skeleton({ className }) {
  return (
    <div className={cn("animate-pulse rounded-lg bg-slate-200", className)} />
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="flex gap-4 border-b border-slate-100 px-4 py-3">
        {Array.from({ length: cols }).map((_, j) => (
          <Skeleton key={j} className="h-3 flex-1" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 border-b border-slate-50 px-4 py-3.5"
        >
          {Array.from({ length: cols }).map((_, j) => (
            <Skeleton
              key={j}
              className={cn("h-4 flex-1", j === 0 && "max-w-[180px]")}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200 bg-white p-5 space-y-3"
        >
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-8 w-14" />
          <Skeleton className="h-3 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function LoadingSkeleton({ rows = 4, cols }) {
  if (cols) return <TableSkeleton rows={rows} cols={cols} />;
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-14 w-full rounded-xl",
            i % 3 === 0 && "opacity-90",
            i % 3 === 1 && "opacity-70",
            i % 3 === 2 && "opacity-50",
          )}
        />
      ))}
    </div>
  );
}
