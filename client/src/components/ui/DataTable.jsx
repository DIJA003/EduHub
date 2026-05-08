import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronUp, ChevronDown, Search, MoreHorizontal } from "lucide-react";
import { cn } from "../../lib/utils";
import Dropdown, { DropdownItem, DropdownDivider } from "./Dropdown";
import Badge from "./Badges";
import { SkeletonTable } from "./Skeleton";

export default function DataTable({
  data = [],
  columns = [],
  loading = false,
  emptyState,
  searchable = false,
  searchPlaceholder = "Search...",
  actions,
  onRowClick,
  className,
}) {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter((row) =>
      columns.some((col) => {
        const value = row[col.key];
        return value?.toString().toLowerCase().includes(search.toLowerCase());
      })
    );
  }, [data, columns, search]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];
      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  if (loading) {
    return <SkeletonTable rows={5} cols={columns.length || 4} className={className} />;
  }

  return (
    <div className={cn("surface overflow-hidden", className)}>
      {searchable && (
        <div className="p-4 border-b border-[var(--color-border)]">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]"
              strokeWidth={2}
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              className={cn(
                "w-full max-w-xs pl-10 pr-4 py-2",
                "bg-[var(--color-surface-2)] border border-[var(--color-border)]",
                "rounded-[var(--radius-lg)] text-[var(--text-sm)]",
                "text-[var(--color-text)] placeholder:text-[var(--color-text-3)]",
                "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]",
                "transition-all duration-[var(--duration-fast)]",
              )}
            />
          </div>
        </div>
      )}

      {sortedData.length === 0 ? (
        <div className="p-12 text-center">
          {emptyState || (
            <div className="text-[var(--color-text-3)]">
              <p className="text-[var(--text-base)] font-medium">No data found</p>
              <p className="text-[var(--text-sm)] mt-1">
                {search ? "Try a different search term" : "No records available"}
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-2)]">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                    className={cn(
                      "px-5 py-3 text-left text-[var(--text-xs)] font-semibold uppercase tracking-wider",
                      "text-[var(--color-text-3)] border-b border-[var(--color-border)]",
                      col.sortable !== false && "cursor-pointer hover:text-[var(--color-text-2)]",
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable !== false && sortConfig.key === col.key && (
                        sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-3.5 h-3.5" strokeWidth={2} />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" strokeWidth={2} />
                        )
                      )}
                    </div>
                  </th>
                ))}
                {actions && <th className="px-5 py-3 w-10" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              <AnimatePresence>
                {sortedData.map((row, i) => (
                  <motion.tr
                    key={row.id ?? i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    onClick={() => onRowClick?.(row)}
                    className={cn(
                      "transition-colors duration-[var(--duration-fast)]",
                      "hover:bg-[var(--color-surface-2)]",
                      onRowClick && "cursor-pointer",
                    )}
                  >
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className="px-5 py-4 text-[var(--text-sm)] text-[var(--color-text-2)]"
                      >
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                        <Dropdown
                          trigger={
                            <button
                              className={cn(
                                "p-1.5 rounded-[var(--radius-md)]",
                                "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
                                "hover:bg-[var(--color-surface-3)]",
                                "transition-colors duration-[var(--duration-fast)]",
                              )}
                            >
                              <MoreHorizontal className="w-4 h-4" strokeWidth={2} />
                            </button>
                          }
                        >
                          {actions(row)}
                        </Dropdown>
                      </td>
                    )}
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// Render helpers
export function TableBadge({ status, children }) {
  const statusMap = {
    active: "success",
    approved: "success",
    completed: "success",
    pending: "warning",
    draft: "warning",
    rejected: "danger",
    dropped: "danger",
    inactive: "gray",
  };

  return (
    <Badge variant={statusMap[status?.toLowerCase()] || "default"} dot>
      {children || status}
    </Badge>
  );
}

export function TableAvatar({ name, email, photoURL }) {
  const hash = [...(name ?? "")].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const hue = hash % 360;
  const initials = (name ?? "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex items-center gap-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 overflow-hidden"
        style={!photoURL ? { background: `hsl(${hue},55%,45%)` } : undefined}
      >
        {photoURL ? (
          <img src={photoURL} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </div>
      <div className="min-w-0">
        <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)] truncate">
          {name}
        </p>
        {email && (
          <p className="text-[var(--text-xs)] text-[var(--color-text-3)] truncate">
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

export { DropdownItem, DropdownDivider };
