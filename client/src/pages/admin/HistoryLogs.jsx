import { useState, useEffect, useCallback } from "react";
import {
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  tw,
} from "../../components/admin/adminUtils";
import { logsApi } from "../../services/api";

const ENTITY_TYPES = [
  "All",
  "College",
  "Course",
  "Material",
  "User",
  "Enrollment",
  "Session",
  "Notification",
  "AcademicYear",
  "System",
];
const ACTION_TYPES = [
  "All",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "LOGIN",
  "REGISTER",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "EMAIL_VERIFY",
  "ENROLL",
  "UNENROLL",
  "APPROVE",
  "REJECT",
  "UPLOAD",
  "ERROR",
];

const ACTION_STYLE = {
  CREATE: {
    bg: "var(--success-bg)",
    color: "var(--success)",
    icon: "add_circle",
  },
  UPDATE: {
    bg: "var(--accent-glow)",
    color: "var(--accent-light)",
    icon: "edit",
  },
  DELETE: { bg: "var(--danger-bg)", color: "var(--danger)", icon: "delete" },
  RESTORE: {
    bg: "var(--warning-bg)",
    color: "var(--warning)",
    icon: "restore",
  },
  LOGIN: {
    bg: "var(--accent-glow)",
    color: "var(--accent-light)",
    icon: "login",
  },
  REGISTER: {
    bg: "var(--success-bg)",
    color: "var(--success)",
    icon: "person_add",
  },
  LOGOUT: { bg: "var(--bg-card)", color: "var(--text-muted)", icon: "logout" },
  PASSWORD_CHANGE: {
    bg: "var(--warning-bg)",
    color: "var(--warning)",
    icon: "lock_reset",
  },
  EMAIL_VERIFY: {
    bg: "var(--success-bg)",
    color: "var(--success)",
    icon: "mark_email_read",
  },
  ENROLL: {
    bg: "var(--success-bg)",
    color: "var(--success)",
    icon: "how_to_reg",
  },
  UNENROLL: {
    bg: "var(--danger-bg)",
    color: "var(--danger)",
    icon: "person_remove",
  },
  APPROVE: {
    bg: "var(--success-bg)",
    color: "var(--success)",
    icon: "check_circle",
  },
  REJECT: { bg: "var(--danger-bg)", color: "var(--danger)", icon: "cancel" },
  UPLOAD: { bg: "var(--info-bg)", color: "var(--info)", icon: "upload_file" },
  ERROR: { bg: "var(--danger-bg)", color: "var(--danger)", icon: "error" },
};

const ENTITY_ICON = {
  College: "school",
  Course: "menu_book",
  Material: "description",
  User: "person",
  Enrollment: "how_to_reg",
  Session: "login",
  Notification: "notifications",
  AcademicYear: "calendar_today",
  System: "settings",
};

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 day ago" : `${d} days ago`;
}

function formatDate(date) {
  return new Date(date).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function ActionBadge({ action }) {
  const s = ACTION_STYLE[action] || {
    bg: "var(--bg-card)",
    color: "var(--text-secondary)",
    icon: "circle",
  };
  return (
    <span
      className="inline-flex items-center gap-1 px-[10px] py-[3px] rounded-full text-[11px] font-semibold"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.color}30`,
      }}
    >
      <span className="material-symbols-outlined text-[12px]">{s.icon}</span>
      {action}
    </span>
  );
}

function FilterBtn({ label, active, onClick, style = {} }) {
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer"
      style={
        active
          ? {
              background: "var(--accent)",
              borderColor: "var(--accent)",
              color: "#fff",
              ...style,
            }
          : {
              background: "var(--bg-card)",
              borderColor: "var(--border)",
              color: "var(--text-secondary)",
            }
      }
    >
      {label}
    </button>
  );
}

function DetailsPanel({ log, onClose }) {
  if (!log) return null;
  return (
    <div
      className="fixed inset-0 z-[1000] flex justify-end"
      style={{ background: "rgba(0,0,0,0.55)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="h-full w-full max-w-[480px] flex flex-col overflow-hidden"
        style={{
          background: "var(--bg-surface)",
          borderLeft: "1px solid var(--border)",
          animation: "slideIn 0.2s ease",
        }}
      >
        <style>{`@keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }`}</style>
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <div className="flex items-center gap-3">
            <ActionBadge action={log.action} />
            <span
              className="text-[15px] font-bold"
              style={{ color: "var(--text-primary)" }}
            >
              Log Detail
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-sm cursor-pointer text-[20px] transition-all"
            style={{
              color: "var(--text-muted)",
              background: "var(--bg-card)",
              border: "1px solid var(--border)",
            }}
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Record */}
          <section>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Record
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              {[
                ["Entity", log.entity],
                ["Name", log.entityName || "—"],
                ["Action", log.action],
                ["Time", formatDate(log.createdAt)],
                ["Success", log.success ? "✅ Yes" : "❌ No"],
                ...(log.errorMessage ? [["Error", log.errorMessage]] : []),
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <span
                    className="text-[12px] flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[12.5px] text-right font-medium break-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Performed By */}
          <section>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Performed By
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              {[
                ["Name", log.performedBy?.name || "System"],
                ["Email", log.performedBy?.email || "—"],
                ["Role", log.performedBy?.role || "—"],
                ["IP", log.ip || "—"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <span
                    className="text-[12px] flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[12.5px] text-right font-medium break-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>

          {/* Details */}
          {log.details && Object.keys(log.details).length > 0 && (
            <section>
              <p
                className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
                style={{ color: "var(--text-muted)" }}
              >
                What Changed
              </p>
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  border: "1px solid var(--border)",
                  background: "var(--bg-card)",
                }}
              >
                {Object.entries(log.details).map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-start justify-between gap-4 px-4 py-2.5"
                    style={{ borderBottom: "1px solid var(--border-light)" }}
                  >
                    <span
                      className="text-[12px] flex-shrink-0"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                    </span>
                    <span
                      className={`text-[12.5px] text-right break-all ${typeof v !== "string" ? "font-mono" : "font-medium"}`}
                      style={{ color: "var(--text-primary)" }}
                    >
                      {typeof v === "object"
                        ? JSON.stringify(v, null, 2)
                        : String(v)}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* IDs */}
          <section>
            <p
              className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
              style={{ color: "var(--text-muted)" }}
            >
              Internal IDs
            </p>
            <div
              className="rounded-lg overflow-hidden"
              style={{
                border: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              {[
                ["Log ID", log._id],
                ["Entity ID", String(log.entityId || "—")],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-start justify-between gap-4 px-4 py-2.5"
                  style={{ borderBottom: "1px solid var(--border-light)" }}
                >
                  <span
                    className="text-[12px] flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {label}
                  </span>
                  <span
                    className="text-[12.5px] text-right font-mono break-all"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function HistoryLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);
  const [entityFilter, setEntityFilter] = useState("All");
  const [actionFilter, setActionFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const LIMIT = 50;

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { limit: LIMIT, page };
      if (entityFilter !== "All") params.entity = entityFilter;
      if (actionFilter !== "All") params.action = actionFilter;
      if (search.trim()) params.search = search.trim();

      const res = await logsApi.getLogs(params);
      // API returns { success, data, total, page, limit, pages }
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message || "Failed to load logs");
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter, search, page]);

  useEffect(() => {
    setPage(1);
  }, [entityFilter, actionFilter, search]);
  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  return (
    <div>
      <PageHeader
        title="History Logs"
        subtitle="Full audit trail of every action performed in the system."
      />

      {/* Entity filter */}
      <div
        className="rounded-lg px-5 py-4 mb-4"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        {/* Entity row */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.07em] self-center mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            Entity
          </span>
          {ENTITY_TYPES.map((e) => (
            <FilterBtn
              key={e}
              label={e}
              active={entityFilter === e}
              onClick={() => setEntityFilter(e)}
            />
          ))}
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.07em] self-center mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            Action
          </span>
          {ACTION_TYPES.map((a) => {
            const s = ACTION_STYLE[a];
            return (
              <button
                key={a}
                onClick={() => setActionFilter(a)}
                className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer inline-flex items-center gap-1"
                style={
                  actionFilter === a && s
                    ? {
                        background: s.bg,
                        borderColor: s.color + "60",
                        color: s.color,
                      }
                    : actionFilter === a
                      ? {
                          background: "var(--accent)",
                          borderColor: "var(--accent)",
                          color: "#fff",
                        }
                      : {
                          background: "var(--bg-card)",
                          borderColor: "var(--border)",
                          color: "var(--text-secondary)",
                        }
                }
              >
                {s && (
                  <span className="material-symbols-outlined text-[12px]">
                    {s.icon}
                  </span>
                )}
                {a}
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="mt-3">
          <TableSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or entity…"
          />
        </div>
      </div>

      {error && (
        <div
          className="mb-4 rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error} —{" "}
          <button className="underline" onClick={load}>
            Retry
          </button>
        </div>
      )}

      <TableWrap
        toolbar={
          <span
            className="text-[13.5px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {loading ? "Loading…" : `${total.toLocaleString()} log entries`}
          </span>
        }
        footer={
          totalPages > 1 && (
            <>
              <span
                className="text-[12.5px]"
                style={{ color: "var(--text-muted)" }}
              >
                Page {page} of {totalPages}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded-sm text-[12.5px] border disabled:opacity-40 cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Previous
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded-sm text-[12.5px] border disabled:opacity-40 cursor-pointer"
                  style={{
                    background: "var(--bg-card)",
                    borderColor: "var(--border)",
                    color: "var(--text-secondary)",
                  }}
                >
                  Next
                </button>
              </div>
            </>
          )
        }
      >
        {loading ? (
          <div
            className="flex items-center justify-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="material-symbols-outlined animate-spin mr-2">
              progress_activity
            </span>
            Loading history…
          </div>
        ) : logs.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No log entries found"
            description="Actions performed in the system will appear here. Try changing your filters."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                {[
                  "Time",
                  "Action",
                  "Entity",
                  "Record",
                  "Performed By",
                  "Status",
                ].map((h) => (
                  <th
                    key={h}
                    className={tw.th}
                    style={{
                      color: "var(--text-muted)",
                      borderBottomColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr
                  key={log._id}
                  className={`${tw.trHover} cursor-pointer`}
                  onClick={() => setSelected(log)}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  {/* Time */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <div>
                      <span
                        className="font-mono text-[12px]"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {timeAgo(log.createdAt)}
                      </span>
                      <br />
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--text-muted)", opacity: 0.7 }}
                      >
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  </td>

                  {/* Action */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <ActionBadge action={log.action} />
                  </td>

                  {/* Entity */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="material-symbols-outlined text-[14px]"
                        style={{ color: "var(--accent-light)" }}
                      >
                        {ENTITY_ICON[log.entity] || "circle"}
                      </span>
                      <span
                        className="text-[13px]"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {log.entity}
                      </span>
                    </div>
                  </td>

                  {/* Record name */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <span
                      className="font-medium text-[13.5px]"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {log.entityName || "—"}
                    </span>
                  </td>

                  {/* Performed by */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 text-white"
                        style={{ background: "var(--accent)" }}
                      >
                        {(log.performedBy?.name || "?")[0].toUpperCase()}
                      </div>
                      <div>
                        <p
                          className="text-[13px] font-medium"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {log.performedBy?.name || "System"}
                        </p>
                        {log.performedBy?.role && (
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {log.performedBy.role}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Success/Fail */}
                  <td
                    className={tw.td}
                    style={{ borderBottomColor: "var(--border-light)" }}
                  >
                    {log.success !== false ? (
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--success)" }}
                      >
                        ✓ OK
                      </span>
                    ) : (
                      <span
                        className="text-[11px] font-semibold"
                        style={{ color: "var(--danger)" }}
                      >
                        ✗ Failed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      <DetailsPanel log={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

export default HistoryLogs;
