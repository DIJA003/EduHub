import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../../lib/api/notifications.api";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import EmptyState from "../../../components/common/EmptyStat";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import { formatDateTime } from "../../../lib/utils";

export default function AdminNotificationsPage() {
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => notificationsApi.getAll({ limit: 120 }).then((r) => r.data),
    refetchInterval: 600_000, // 10 minutes
  });

  const notifications = useMemo(
    () => (Array.isArray(data) ? data : data?.data || []),
    [data],
  );

  const filtered = useMemo(() => {
    if (filter === "unread") return notifications.filter((n) => !n.isRead);
    if (filter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, filter]);

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (isLoading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-4 animate-fade-up">
      <div className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
              Notifications
            </h1>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Central inbox for platform alerts and review events.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => markAllRead.mutate()}
            disabled={!notifications.some((n) => !n.isRead)}
            loading={markAllRead.isPending}
          >
            Mark all read
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          {["all", "unread", "read"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-[var(--radius-sm)] text-xs font-semibold capitalize border ${
                filter === f
                  ? "bg-[var(--color-accent-soft)] border-[var(--color-accent)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] text-[var(--color-text-3)]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="📭"
            title="No notifications"
            description="No alerts match your filter."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((n) => (
              <article key={n._id} className="p-4 sm:p-5 hover:bg-[var(--color-surface-2)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="mb-1.5">
                      <Badge variant={n.isRead ? "gray" : "warning"}>
                        {n.isRead ? "Read" : "Unread"}
                      </Badge>
                    </div>
                    {n.title ? (
                      <h3 className="text-sm font-semibold text-[var(--color-text)]">{n.title}</h3>
                    ) : null}
                    <p className="text-sm text-[var(--color-text-2)] mt-1">{n.message}</p>
                    <p className="text-xs text-[var(--color-text-3)] mt-2">
                      {formatDateTime(n.createdAt)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
