import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { notificationsApi } from "../../services/api";

function Navbar() {
  const { dbUser } = useAuth();
  const [isLight, setIsLight] = useState(
    () => localStorage.getItem("eduhub-theme") === "light",
  );
  const [notifCount, setNotifCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isLight) document.documentElement.classList.add("light");
    else document.documentElement.classList.remove("light");
  }, [isLight]);

  const fetchNotifs = () => {
    notificationsApi
      .getAll()
      .then((res) => {
        const data = res.data || [];
        setNotifications(data);
        setNotifCount(data.filter((n) => !n.isRead).length);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleMarkRead = async (id) => {
    await notificationsApi.markRead(id).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
    );
    setNotifCount((c) => Math.max(0, c - 1));
  };

  const handleDeleteOne = async (id) => {
    await notificationsApi.deleteOne(id).catch(() => {});
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    setNotifCount((prev) => {
      const wasUnread = notifications.find((n) => n._id === id && !n.isRead);
      return wasUnread ? Math.max(0, prev - 1) : prev;
    });
  };

  const toggleTheme = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("eduhub-theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("eduhub-theme", "dark");
    }
  };

  const initials = dbUser?.name
    ? dbUser.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "M";

  const TYPE_ICON = {
    material_submitted: "📤",
    material_approved: "✅",
    material_rejected: "❌",
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-7 gap-4 flex-shrink-0 z-10"
      style={{
        background: "var(--bg-surface)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div className="relative flex-1 max-w-[300px]">
        <span
          className="material-symbols-outlined absolute left-[10px] top-1/2 -translate-y-1/2 text-[14px] pointer-events-none"
          style={{ color: "var(--text-muted)" }}
        >
          search
        </span>
        <input
          className="w-full pl-8 pr-3 py-[7px] rounded-sm text-[12.5px] outline-none"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-primary)",
          }}
          placeholder="Search anything..."
          onFocus={(e) => {
            e.target.style.borderColor = "var(--border-focus)";
            e.target.style.boxShadow = "0 0 0 3px var(--accent-glow)";
          }}
          onBlur={(e) => {
            e.target.style.borderColor = "var(--border)";
            e.target.style.boxShadow = "none";
          }}
        />
      </div>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isLight ? "Switch to dark" : "Switch to light"}
          className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer transition-all duration-150"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--bg-hover)";
            e.currentTarget.style.color = "var(--text-primary)";
            e.currentTarget.style.borderColor = "var(--border-focus)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-card)";
            e.currentTarget.style.color = "var(--text-secondary)";
            e.currentTarget.style.borderColor = "var(--border)";
          }}
        >
          <span className="material-symbols-outlined text-[18px]">
            {isLight ? "dark_mode" : "light_mode"}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen((v) => !v)}
            title="Notifications"
            className="w-[34px] h-[34px] rounded-sm flex items-center justify-center cursor-pointer relative transition-all duration-150"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--bg-hover)";
              e.currentTarget.style.borderColor = "var(--border-focus)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--bg-card)";
              e.currentTarget.style.borderColor = "var(--border)";
            }}
          >
            <span className="material-symbols-outlined text-[18px]">
              notifications
            </span>
            {notifCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "var(--danger)" }}
              >
                {notifCount > 9 ? "9+" : notifCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-[340px] rounded-lg overflow-hidden z-50 shadow-2xl"
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}
              >
                <span
                  className="text-[13px] font-semibold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Notifications{" "}
                  {notifCount > 0 && (
                    <span
                      className="ml-1 text-[11px] font-bold px-1.5 py-0.5 rounded-full text-white"
                      style={{ background: "var(--danger)" }}
                    >
                      {notifCount}
                    </span>
                  )}
                </span>
                {notifications.length > 0 && (
                  <button
                    onClick={async () => {
                      await notificationsApi.deleteAll().catch(() => {});
                      setNotifications([]);
                      setNotifCount(0);
                    }}
                    className="text-[11px] font-semibold"
                    style={{ color: "var(--text-muted)" }}
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="overflow-y-auto max-h-[320px]">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <span
                      className="material-symbols-outlined text-[36px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      notifications_none
                    </span>
                    <p
                      className="text-[12.5px]"
                      style={{ color: "var(--text-muted)" }}
                    >
                      No notifications
                    </p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className="flex items-start gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer"
                      style={{
                        background: n.isRead
                          ? "transparent"
                          : "var(--accent-glow)",
                        borderBottom: "1px solid var(--border-light)",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "var(--bg-hover)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = n.isRead
                          ? "transparent"
                          : "var(--accent-glow)")
                      }
                      onClick={() => !n.isRead && handleMarkRead(n._id)}
                    >
                      <span className="text-[20px] flex-shrink-0 mt-0.5">
                        {TYPE_ICON[n.type] || "🔔"}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p
                          className="text-[12.5px] leading-relaxed"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {n.message}
                        </p>
                        <p
                          className="text-[11px] mt-1"
                          style={{ color: "var(--text-muted)" }}
                        >
                          {new Date(n.createdAt).toLocaleString(undefined, {
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
                          handleDeleteOne(n._id);
                        }}
                        className="flex-shrink-0 text-[16px] transition-colors duration-150"
                        style={{ color: "var(--text-muted)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color = "var(--text-muted)")
                        }
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

        <div
          className="w-px h-[22px] flex-shrink-0 mx-1"
          style={{ background: "var(--border)" }}
        />
        <div
          title={dbUser?.name || "Admin"}
          className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold cursor-pointer transition-all duration-150 hover:scale-105"
          style={{ border: "2px solid var(--border)" }}
        >
          {initials}
        </div>
      </div>
    </header>
  );
}

export default Navbar;