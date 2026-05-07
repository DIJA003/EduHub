import { useState, useEffect, useRef } from "react";
import { TableSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Pagination from "../../../components/common/Pagination";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import { useDebounce } from "../../../hooks/useDebounce";

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
  const onSearchRef = useRef(onSearch);
  useEffect(() => {
    onSearchRef.current = onSearch;
  }, [onSearch]);

  useEffect(() => {
    onSearchRef.current?.(debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  return (
    <div className="surface overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)] gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)] shrink-0">
            {title}
            {meta?.total != null && (
              <span className="ml-2 text-[var(--color-text-3)] font-normal">
                ({meta.total})
              </span>
            )}
          </h2>
          {toolbar}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onSearch && (
            <Input
              placeholder="Search…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className="w-48 py-2 text-xs"
              leftIcon={
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <TableSkeleton rows={5} cols={columns.length} />
        ) : data.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
          />
        ) : (
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-5 py-3 text-left text-[var(--text-xs)] font-bold uppercase tracking-wide text-[var(--color-text-3)] whitespace-nowrap"
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
                  className="hover:bg-[var(--color-surface-2)] transition-colors duration-[var(--duration-fast)]"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-5 py-3.5 text-[var(--text-sm)] text-[var(--color-text-2)] whitespace-nowrap"
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

      {/* Pagination */}
      {meta && meta.pages > 1 && (
        <Pagination
          page={page || meta.page}
          totalPages={meta.pages}
          onPageChange={onPage}
        />
      )}
    </div>
  );
}
