import { useState, useEffect } from "react";
import { TableSkeleton } from "../common/LoadingSkeleton";
import EmptyState from "../common/EmptyStat";
import Pagination from "../common/Pagination";
import Input from "./Input";
import Button from "./Button";
import { Card } from "./Card";
import { useDebounce } from "../../hooks/useDebounce";
import { cn } from "../../lib/utils";

export default function DataTable({
  title,
  data = [],
  columns = [],
  loading = false,
  meta,
  onPage,
  onSearch,
  onAdd,
  addLabel,
  emptyIcon = "📋",
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or add a new record.",
  toolbar,
  page,
}) {
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebounce(searchValue, 400);

  useEffect(() => {
    onSearch?.(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to debounced query
  }, [debouncedSearch]);

  return (
    <Card variant="glass" padding={false} className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-[var(--color-border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-3 sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <h2 className="shrink-0 text-[var(--text-sm)] font-semibold text-[var(--color-text)]">
            {title}
            {meta?.total != null && (
              <span className="ml-2 font-normal text-[var(--color-text-3)]">
                ({meta.total})
              </span>
            )}
          </h2>
          {toolbar}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          {onSearch && (
            <Input
              placeholder="Search…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-full py-2 text-[var(--text-sm)] sm:w-48"
              autoComplete="off"
              leftIcon={
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
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0"
                  />
                </svg>
              }
            />
          )}
          {onAdd && (
            <Button
              size="sm"
              onClick={onAdd}
              leftIcon={
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
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              }
            >
              {addLabel || "Add New"}
            </Button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={5} cols={Math.max(columns.length, 3)} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            compact
          />
        ) : (
          <table className="w-full min-w-[640px] text-left">
            <thead className="bg-[var(--color-surface-2)]/80">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    scope="col"
                    className="whitespace-nowrap px-4 py-3 text-[var(--text-xs)] font-semibold uppercase tracking-wider text-[var(--color-text-3)] sm:px-5"
                    style={{ width: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {data.map((row, i) => (
                <tr
                  key={row._id || i}
                  className={cn(
                    "transition-colors duration-[var(--duration-fast)]",
                    "hover:bg-[var(--color-surface-2)]/60",
                  )}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="whitespace-nowrap px-4 py-3.5 text-[var(--text-sm)] text-[var(--color-text-2)] sm:px-5"
                    >
                      {col.render ? col.render(row) : (row[col.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {meta && meta.pages > 1 && (
        <Pagination
          page={page || meta.page}
          pages={meta.pages}
          onPage={onPage}
        />
      )}
    </Card>
  );
}
