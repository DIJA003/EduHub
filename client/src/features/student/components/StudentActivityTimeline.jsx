import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logsApi } from "../../../lib/api/logs.api";
import { formatDateTime } from "../../../lib/utils";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";

const iconByAction = (action = "") => {
  const lower = action.toLowerCase();
  if (lower.includes("upload")) return "📤";
  if (lower.includes("approve")) return "✅";
  if (lower.includes("reject")) return "❌";
  if (lower.includes("login")) return "🔐";
  if (lower.includes("enroll")) return "🎓";
  return "📝";
};

export default function StudentActivityTimeline() {
  const [query, setQuery] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["logs", "student"],
    queryFn: () => logsApi.getAll({ limit: 120 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const logs = useMemo(() => (Array.isArray(data) ? data : data?.data || []), [data]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      `${log.action || ""} ${log.message || ""} ${log.userName || ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [logs, query]);

  const grouped = useMemo(() => {
    return filtered.reduce((acc, log) => {
      const key = new Date(log.createdAt).toDateString();
      if (!acc[key]) acc[key] = [];
      acc[key].push(log);
      return acc;
    }, {});
  }, [filtered]);

  if (isLoading) return <ListSkeleton rows={7} />;

  return (
    <div className="space-y-4">
      <div className="surface p-4 sm:p-5">
        <h2 className="text-lg font-bold text-[var(--color-text)]">Activity Logs</h2>
        <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
          Browse your recent actions, grouped by date.
        </p>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions, messages, or keywords..."
          className="mt-4 w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon="🗂️"
            title="No matching activity"
            description="Try a different keyword or clear your search."
          />
        </div>
      ) : (
        Object.entries(grouped).map(([date, entries]) => (
          <section key={date} className="surface p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--color-text-3)]">
              {date}
            </h3>
            <div className="mt-4 space-y-4">
              {entries.map((entry) => (
                <article
                  key={entry._id}
                  className="relative pl-11 pb-4 border-l border-[var(--color-border)] last:pb-0"
                >
                  <span className="absolute -left-4 top-0 h-8 w-8 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] flex items-center justify-center text-sm">
                    {iconByAction(entry.action)}
                  </span>
                  <div className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-3">
                    <p className="text-sm font-semibold text-[var(--color-text)]">
                      {entry.action || "Action"}
                    </p>
                    <p className="text-[var(--text-sm)] text-[var(--color-text-2)] mt-1">
                      {entry.message || "No additional details provided."}
                    </p>
                    <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-2">
                      {formatDateTime(entry.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  );
}
