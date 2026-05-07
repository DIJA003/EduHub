import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, Trash2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../lib/api/notifications.api";
import { cn } from "../../lib/utils";

function TypeMeta({ type }) {
  const map = {
    material_submitted: { emoji: "📤", label: "Upload" },
    material_approved: { emoji: "✅", label: "Approved" },
    material_rejected: { emoji: "❌", label: "Rejected" },
    system: { emoji: "🔔", label: "System" },
  };
  const meta = map[type] || map.system;
  return (
    <span className="text-lg shrink-0 mt-0.5" title={meta.label}>
      <span aria-hidden>{meta.emoji}</span>
      <span className="sr-only">{meta.label}</span>
    </span>
  );
}

function NotificationItem({ n, onMarkRead, onDelete }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors duration-[var(--duration-fast)]",
        "hover:bg-[var(--color-surface-2)]",
        !n.isRead && "bg-[var(--color-accent-soft)]",
      )}
      role="article"
      onClick={() => !n.isRead && onMarkRead(n._id)}
    >
      <TypeMeta type={n.type} />
      <div className="flex-1 min-w-0">
        {n.title && (
          <p className="text-[var(--text-xs)] font-bold text-[var(--color-accent-2)] mb-0.5">
            {n.title}
          </p>
        )}
        <p className="text-[var(--text-sm)] text-[var(--color-text)] leading-snug whitespace-pre-wrap break-words">
          {n.message}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-1 tabular-nums">
          <time dateTime={n.createdAt}>
            {new Date(n.createdAt).toLocaleString([], {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </time>
        </p>
      </div>
      <button
        type="button"
        className={cn(
          "shrink-0 rounded-[var(--radius-sm)] p-1 ml-1",
          "text-[var(--color-text-3)] hover:text-[var(--color-danger)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
          "transition-colors",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n._id);
        }}
        aria-label="Dismiss notification"
      >
        <Trash2 className="h-4 w-4" strokeWidth={1.85} aria-hidden />
      </button>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll({ limit: 40 }).then((r) => r.data),
    refetchInterval: 15000,
  });

  const notifications = useMemo(
    () => (Array.isArray(data) ? data : (data?.data ?? [])),
    [data],
  );
  const unreadCount =
    data?.meta?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    document.title =
      unreadCount > 0 ? `(${Math.min(unreadCount, 99)}) EduHub` : "EduHub";
  }, [unreadCount]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

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
  const deleteOne = useMutation({
    mutationFn: notificationsApi.deleteOne,
    onSuccess: invalidate,
  });
  const deleteAll = useMutation({
    mutationFn: notificationsApi.deleteAll,
    onSuccess: invalidate,
  });

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const grouped = useMemo(() => {
    const groups = {};
    notifications.forEach((n) => {
      const key = (n.type || "system").split("_")[0] || "system";
      groups[key] = (groups[key] || 0) + 1;
    });
    return groups;
  }, [notifications]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative rounded-[var(--radius-md)] p-2",
          "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
          "hover:bg-[var(--color-surface-2)] transition-colors duration-[var(--duration-fast)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]",
        )}
      >
        <Bell className="w-5 h-5" strokeWidth={1.85} aria-hidden />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5",
              "h-4 min-w-[1rem] px-1 rounded-full flex items-center justify-center",
              "bg-[var(--color-danger)] text-white text-[9px] font-bold",
              "animate-pulse-glow ring-2 ring-[var(--color-ink)]",
            )}
            aria-hidden="true"
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-[min(calc(100vw-24px),20rem)] z-[var(--z-dropdown)]",
            "rounded-[var(--radius-xl)] border border-[var(--color-border-2)] backdrop-blur-xl",
            "bg-[var(--color-surface)]/95 shadow-[var(--shadow-xl)]",
            "animate-scale-in overflow-hidden",
          )}
          role="dialog"
          aria-modal="false"
          aria-label="Notifications panel"
        >
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-border)] px-4 py-3.5">
            <div>
              <span className="text-[var(--text-sm)] font-bold text-[var(--color-text)] flex items-center gap-2 flex-wrap">
                Notifications
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-danger-soft)] text-[var(--color-danger)] text-[10px] font-bold uppercase">
                    {unreadCount} unread
                  </span>
                )}
              </span>
              {Object.keys(grouped).length > 0 ? (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--color-text-3)]">
                  {Object.entries(grouped).map(([k, v]) => `${k}:${v}`).join(" • ")}
                </p>
              ) : (
                <p className="mt-1 text-[10px] text-[var(--color-text-3)]">
                  Lightweight polling refreshes inbox every ~15&nbsp;s.
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  type="button"
                  disabled={markAllRead.isPending}
                  onClick={() => markAllRead.mutate()}
                  className="text-[var(--text-xs)] text-[var(--color-accent)] hover:underline disabled:opacity-60"
                >
                  Mark read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  type="button"
                  disabled={deleteAll.isPending}
                  onClick={() => deleteAll.mutate()}
                  className="text-[var(--text-xs)] text-[var(--color-text-3)] hover:underline disabled:opacity-60"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto divide-y divide-[var(--color-border)] no-scrollbar">
            {notifications.length === 0 ? (
              <div className="py-10 px-6 text-center text-[var(--text-sm)] text-[var(--color-text-3)]">
                You&apos;re caught up ✨ — new alerts pop in automatically.
              </div>
            ) : (
              notifications.map((n) => (
                <NotificationItem
                  key={n._id}
                  n={n}
                  onMarkRead={(id) => markRead.mutate(id)}
                  onDelete={(id) => deleteOne.mutate(id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
