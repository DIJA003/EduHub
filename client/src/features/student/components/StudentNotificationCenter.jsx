import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../../lib/api/notifications.api";
import { formatDateTime } from "../../../lib/utils";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { ListSkeleton } from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";

const TYPE_META = {
  material_submitted: { icon: "📤", label: "Submitted" },
  material_approved: { icon: "✅", label: "Approved" },
  material_rejected: { icon: "❌", label: "Rejected" },
  system: { icon: "🔔", label: "System" },
};

export default function StudentNotificationCenter() {
  const [activeFilter, setActiveFilter] = useState("all");
  const qc = useQueryClient();

  const { data: raw, isLoading } = useQuery({
    queryKey: ["notifications", "center"],
    queryFn: () => notificationsApi.getAll({ limit: 80 }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const notifications = useMemo(
    () => (Array.isArray(raw) ? raw : raw?.data || []),
    [raw],
  );

  const filtered = useMemo(() => {
    if (activeFilter === "unread") return notifications.filter((n) => !n.isRead);
    if (activeFilter === "read") return notifications.filter((n) => n.isRead);
    return notifications;
  }, [notifications, activeFilter]);

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: ["notifications"] });

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: invalidate,
  });
  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: invalidate,
  });

  if (isLoading) return <ListSkeleton rows={6} />;

  return (
    <div className="space-y-4">
      <div className="surface p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-[var(--color-text)]">
              Notification Center
            </h2>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
              Stay updated on reviews, submissions, and system updates.
            </p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => markAllRead.mutate()}
            loading={markAllRead.isPending}
            disabled={!notifications.some((n) => !n.isRead)}
          >
            Mark all as read
          </Button>
        </div>
        <div className="mt-4 flex gap-2">
          {["all", "unread", "read"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activeFilter === filter
                  ? "border-[var(--color-accent)] text-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                  : "border-[var(--color-border)] text-[var(--color-text-3)] hover:text-[var(--color-text)]"
              }`}
            >
              {filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="surface overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState
            icon="🔔"
            title="No notifications found"
            description="You're all caught up. New alerts will appear here."
          />
        ) : (
          <div className="divide-y divide-[var(--color-border)]">
            <AnimatePresence>
              {filtered.map((n) => {
                const meta = TYPE_META[n.type] || TYPE_META.system;
                return (
                  <motion.article
                    key={n._id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className={`p-4 sm:p-5 transition-colors hover:bg-[var(--color-surface-2)] ${
                      n.isRead ? "" : "bg-[var(--color-accent-soft)]/40"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-[var(--radius-md)] bg-[var(--color-surface-2)] flex items-center justify-center text-lg shrink-0">
                        {meta.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant={n.isRead ? "gray" : "accent"}>
                            {meta.label}
                          </Badge>
                          {!n.isRead ? <Badge variant="warning">Unread</Badge> : null}
                        </div>
                        {n.title ? (
                          <h3 className="text-sm font-semibold text-[var(--color-text)]">
                            {n.title}
                          </h3>
                        ) : null}
                        <p className="text-[var(--text-sm)] text-[var(--color-text-2)] mt-1">
                          {n.message}
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-2">
                          {formatDateTime(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead ? (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => markRead.mutate(n._id)}
                          loading={markRead.isPending}
                        >
                          Mark read
                        </Button>
                      ) : null}
                    </div>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
