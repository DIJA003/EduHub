import { cn } from "../../lib/utils";
import Button from "../ui/Button";

export function Pagination({
  page = 1,
  totalPages: totalPagesProp,
  pages,
  onPageChange,
  onPage,
}) {
  const totalPages = totalPagesProp ?? pages ?? 1;
  const onPageChangeFn = onPageChange ?? onPage;

  if (totalPages <= 1) return null;

  const getPages = () => {
    if (totalPages <= 7)
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3)
      return [
        1,
        "…",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  };

  return (
    <div className="flex flex-col gap-3 border-t border-[var(--color-border)] bg-[var(--color-ink-soft)] px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
        Page{" "}
        <span className="font-semibold text-[var(--color-text-2)]">{page}</span>{" "}
        of {totalPages}
      </p>

      <div className="flex flex-wrap items-center gap-1">
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPageChangeFn?.(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          ‹
        </Button>

        {getPages().map((p, i) =>
          p === "…" ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-[var(--text-xs)] text-[var(--color-text-3)]"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChangeFn?.(p)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? "page" : undefined}
              className={cn(
                "h-8 min-w-[2rem] rounded-[var(--radius-md)] px-1 text-[var(--text-xs)] font-semibold",
                "transition-all duration-[var(--duration-fast)]",
                p === page
                  ? "bg-[var(--color-accent)] text-white shadow-[var(--shadow-accent)]"
                  : "text-[var(--color-text-3)] hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]",
              )}
            >
              {p}
            </button>
          ),
        )}

        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPageChangeFn?.(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          ›
        </Button>
      </div>
    </div>
  );
}

export default Pagination;
