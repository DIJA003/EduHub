import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../../lib/api/notifications.api";
import { cn } from "../../lib/utils";

const TYPE_ICON = {
  material_submitted: "📤",
  material_approved: "✅",
  material_rejected: "❌",
  system: "🔔",
};

const BellIcon = () => (
  <svg
    className="w-5 h-5"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
);

function NotificationItem({ n, onMarkRead, onDelete }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 px-4 py-3 cursor-pointer",
        "hover:bg-[var(--color-surface-2)]",
        "transition-colors duration-[var(--duration-fast)]",
        !n.isRead && "bg-[var(--color-accent-soft)]",
      )}
      onClick={() => !n.isRead && onMarkRead(n._id)}
      role="article"
    >
      <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">
        {TYPE_ICON[n.type] ?? "🔔"}
      </span>
      <div className="flex-1 min-w-0">
        {n.title && (
          <p className="text-[var(--text-xs)] font-bold text-[var(--color-accent-2)] mb-0.5">
            {n.title}
          </p>
        )}
        <p className="text-[var(--text-sm)] text-[var(--color-text)] leading-snug">
          {n.message}
        </p>
        <p className="text-[var(--text-xs)] text-[var(--color-text-3)] mt-1">
          {new Date(n.createdAt).toLocaleString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(n._id);
        }}
        className="shrink-0 text-[var(--color-text-3)] hover:text-[var(--color-danger)] transition-colors ml-1"
        aria-label="Delete notification"
      >
        <svg
          className="w-3.5 h-3.5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  );
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data: raw } = useQuery({
    queryKey: ["notifications"],
    // r.data is { success, data: [...], meta: { unreadCount, ... } }
    queryFn: () => notificationsApi.getAll({ limit: 20 }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  // Normalise — the server wraps in { success, data, meta }
  const notifications = Array.isArray(raw) ? raw : (raw?.data ?? []);
  const unreadCount =
    raw?.meta?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    document.title = unreadCount > 0 ? `(${unreadCount}) EduHub` : "EduHub";
  }, [unreadCount]);

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

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount ? ` (${unreadCount} unread)` : ""}`}
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative rounded-[var(--radius-md)] p-2",
          "text-[var(--color-text-3)] hover:text-[var(--color-text)]",
          "hover:bg-[var(--color-surface-2)] transition-colors duration-[var(--duration-fast)]",
        )}
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5",
              "h-4 w-4 rounded-full flex items-center justify-center",
              "bg-[var(--color-danger)] text-white text-[9px] font-bold",
              "animate-pulse-glow",
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
            "absolute right-0 top-full mt-2 w-80 z-[var(--z-dropdown)]",
            "bg-[var(--color-surface)] border border-[var(--color-border-2)]",
            "rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)]",
            "animate-scale-in overflow-hidden",
          )}
          role="dialog"
          aria-label="Notifications panel"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--color-border)]">
            <span className="text-[var(--text-sm)] font-bold text-[var(--color-text)] flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[var(--color-danger)] text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex gap-3">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-[var(--text-xs)] text-[var(--color-accent)] hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => deleteAll.mutate()}
                  className="text-[var(--text-xs)] text-[var(--color-text-3)] hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[var(--color-border)]">
            {notifications.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-2xl mb-2">🔔</p>
                <p className="text-[var(--text-sm)] text-[var(--color-text-3)]">
                  No notifications
                </p>
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
