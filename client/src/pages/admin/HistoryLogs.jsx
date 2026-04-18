import { useState, useEffect, useCallback } from "react";
import {
  PageHeader,
  TableWrap,
  TableSearch,
  EmptyState,
  tw,
} from "../../components/admin/adminUtils";
import { logsApi } from "../../services/api";

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
};

const ENTITY_ICON = {
  College: "school",
  Course: "menu_book",
  Material: "description",
  User: "person",
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

const ENTITIES = ["All", "College", "Course", "Material", "User"];
const ACTIONS = ["All", "CREATE", "UPDATE", "DELETE", "RESTORE"];

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
      setLogs(res.data || []);
      setTotal(res.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [entityFilter, actionFilter, search, page]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [entityFilter, actionFilter, search]);
  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const FilterBtn = ({ label, active, onClick }) => (
    <button
      onClick={onClick}
      className="px-3 py-1.5 rounded-sm text-[12.5px] font-semibold border transition-all duration-150 cursor-pointer"
      style={
        active
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
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--bg-hover)";
          e.currentTarget.style.color = "var(--text-primary)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "var(--bg-card)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }
      }}
    >
      {label}
    </button>
  );

  const ActionBadge = ({ action }) => {
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
  };
  const Section = ({ label, children }) => (
    <div>
      <p
        className="text-[10px] font-bold uppercase tracking-[0.1em] mb-2"
        style={{ color: "var(--text-muted)" }}
      >
        {label}
      </p>
      <div
        className="rounded-lg overflow-hidden"
        style={{
          border: "1px solid var(--border)",
          background: "var(--bg-card)",
        }}
      >
        {children}
      </div>
    </div>
  );

  const Field = ({ label, value, mono }) => (
    <div
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
        className={`text-[12.5px] text-right break-all ${mono ? "font-mono" : "font-medium"}`}
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div>
      <PageHeader
        title="History Logs"
        subtitle="Full logs trail of every create, update, delete, and restore action."
      />

      {/* Filters */}
      <div
        className="rounded-lg px-5 py-4 mb-4 flex flex-wrap items-center gap-3"
        style={{
          background: "var(--bg-surface)",
          border: "1px solid var(--border)",
        }}
      >
        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.07em] self-center mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            Entity
          </span>
          {ENTITIES.map((e) => (
            <FilterBtn
              key={e}
              label={e}
              active={entityFilter === e}
              onClick={() => setEntityFilter(e)}
            />
          ))}
        </div>

        <div
          className="w-px h-6 flex-shrink-0"
          style={{ background: "var(--border)" }}
        />

        <div className="flex flex-wrap gap-1.5">
          <span
            className="text-[11px] font-bold uppercase tracking-[0.07em] self-center mr-1"
            style={{ color: "var(--text-muted)" }}
          >
            Action
          </span>
          {ACTIONS.map((a) => {
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
                onMouseEnter={(e) => {
                  if (actionFilter !== a) {
                    e.currentTarget.style.background = "var(--bg-hover)";
                    e.currentTarget.style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (actionFilter !== a) {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.color = "var(--text-secondary)";
                  }
                }}
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

        <div className="ml-auto">
          <TableSearch
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name…"
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
            {loading ? "Loading…" : `${total} log entries`}
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
            description="Actions performed on colleges, courses, materials, and users will appear here."
          />
        ) : (
          <table className="w-full border-collapse">
            <thead style={{ background: "var(--bg-card)" }}>
              <tr>
                {[
                  "Time",
                  "Action",
                  "Entity",
                  "Record Name",
                  "Performed By",
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

                  {/* Action badge */}
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
                        {log.performedBy?.email && (
                          <p
                            className="text-[11px]"
                            style={{ color: "var(--text-muted)" }}
                          >
                            {log.performedBy.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>
      {selected && (
        <div
          className="fixed inset-0 z-[1000] flex justify-end"
          style={{ background: "rgba(0,0,0,0.55)" }}
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
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
                <ActionBadge action={selected.action} />
                <span
                  className="text-[15px] font-bold"
                  style={{ color: "var(--text-primary)" }}
                >
                  Log Detail
                </span>
              </div>
              <button
                onClick={() => setSelected(null)}
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
              <Section label="Record">
                <Field label="Entity" value={selected.entity} />
                <Field label="Name" value={selected.entityName || "—"} />
                <Field label="Action" value={selected.action} />
                <Field label="Time" value={formatDate(selected.createdAt)} />
              </Section>
              <Section label="Performed By">
                <Field
                  label="Name"
                  value={selected.performedBy?.name || "System"}
                />
                <Field
                  label="Email"
                  value={selected.performedBy?.email || "—"}
                />
              </Section>
              {selected.details && Object.keys(selected.details).length > 0 && (
                <Section label="What Changed">
                  {Object.entries(selected.details).map(([k, v]) => (
                    <Field
                      key={k}
                      label={k.replace(/([A-Z])/g, " $1").replace(/_/g, " ")}
                      value={
                        typeof v === "object"
                          ? JSON.stringify(v, null, 2)
                          : String(v)
                      }
                      mono={typeof v !== "string"}
                    />
                  ))}
                </Section>
              )}
              <Section label="Internal IDs">
                <Field label="Log ID" value={selected._id} mono />
                <Field
                  label="Entity ID"
                  value={String(selected.entityId)}
                  mono
                />
              </Section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryLogs;
