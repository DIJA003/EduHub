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

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const qc = useQueryClient();

  const { data } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll({ limit: 20 }).then((r) => r.data),
    refetchInterval: 30_000,
  });

  const notifications = Array.isArray(data) ? data : data?.data || [];
  const unreadCount =
    data?.meta?.unreadCount ?? notifications.filter((n) => !n.isRead).length;

  const markRead = useMutation({
    mutationFn: notificationsApi.markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllRead = useMutation({
    mutationFn: notificationsApi.markAllRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteOne = useMutation({
    mutationFn: notificationsApi.deleteOne,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteAll = useMutation({
    mutationFn: notificationsApi.deleteAll,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

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
        className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-colors"
        aria-label="Notifications"
      >
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
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 rounded-xl bg-white shadow-xl border border-slate-200 z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-semibold text-slate-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </span>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={() => markAllRead.mutate()}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  onClick={() => deleteAll.mutate()}
                  className="text-xs text-slate-400 hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-slate-400">
                No notifications
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer transition-colors",
                    !n.isRead && "bg-blue-50/50",
                  )}
                  onClick={() => !n.isRead && markRead.mutate(n._id)}
                >
                  <span className="text-xl shrink-0 mt-0.5">
                    {TYPE_ICON[n.type] || "🔔"}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-900 leading-relaxed">
                      {n.message}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteOne.mutate(n._id);
                    }}
                    className="shrink-0 text-slate-300 hover:text-red-500 transition-colors text-lg leading-none"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
