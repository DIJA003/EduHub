import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../../lib/api/notifications.api";
import EmptyState from "../../../components/common/EmptyStat";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import Badge from "../../../components/ui/Badges";
import Button from "../../../components/ui/Button";
import { formatDateTime } from "../../../lib/utils";

export default function MentorNotifications() {
  const [filter, setFilter] = useState("all");
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["mentor-notifications"],
    queryFn: () => notificationsApi.getAll({ limit: 60 }).then((r) => r.data),
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

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (isLoading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      <div className="surface p-4 sm:p-5">
        <h1 className="text-2xl font-black text-[var(--color-text)]">Notifications</h1>
        <p className="text-sm text-[var(--color-text-3)] mt-1">
          Alerts related to review queue, student actions, and platform updates.
        </p>
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
            icon="🔔"
            title="No notifications"
            description="New mentor alerts will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            {filtered.map((n) => (
              <article key={n._id} className="p-4 sm:p-5 hover:bg-[var(--color-surface-2)]">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
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
                  {!n.isRead ? (
                    <Button size="xs" variant="ghost" onClick={() => markRead.mutate(n._id)}>
                      Mark read
                    </Button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
