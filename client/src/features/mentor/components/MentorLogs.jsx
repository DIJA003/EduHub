import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logsApi } from "../../../lib/api/logs.api";
import EmptyState from "../../../components/common/EmptyStat";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import { formatDateTime } from "../../../lib/utils";
import {
  FileCheck,
  Upload,
  MessageSquare,
  UserCheck,
  Eye,
  Clock,
} from "lucide-react";

const iconByAction = (action = "") => {
  const lower = action.toLowerCase();
  if (lower.includes("review") || lower.includes("approve")) return FileCheck;
  if (lower.includes("upload")) return Upload;
  if (lower.includes("comment") || lower.includes("feedback")) return MessageSquare;
  if (lower.includes("enroll")) return UserCheck;
  return Eye;
};

export default function MentorLogs() {
  const [query, setQuery] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["logs", "mentor"],
    queryFn: () => logsApi.getAll({ limit: 120 }).then((r) => r.data),
    staleTime: 30_000,
  });

  const logs = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter((log) =>
      `${log.action || ""} ${log.message || ""} ${log.userName || ""}`
        .toLowerCase()
        .includes(q)
    );
  }, [logs, query]);

  if (isLoading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="surface p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[var(--color-text)]">Activity Logs</h1>
            <p className="text-sm text-[var(--color-text-3)] mt-1">
              Track your mentoring activities and student interactions.
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-3)]">
            <Clock className="w-4 h-4" />
            <span>Last 7 days</span>
          </div>
        </div>

      </div>

      {/* Search */}
      <div className="surface p-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search actions, messages, or keywords..."
          className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
      </div>

      {/* Logs List */}
      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No activity logs"
            description="Your mentoring activities will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((log) => {
              const IconComponent = iconByAction(log.action);
              return (
                <article
                  key={log._id}
                  className="p-4 sm:p-5 hover:bg-[var(--color-surface-2)] transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center shrink-0">
                      <IconComponent className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">
                        {log.action || "Action"}
                      </h3>
                      <p className="text-sm text-[var(--color-text-2)] mt-0.5">
                        {log.message || "No additional details provided."}
                      </p>
                      <p className="text-xs text-[var(--color-text-3)] mt-2 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDateTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
