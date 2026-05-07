import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { logsApi } from "../../../lib/api/logs.api";
import { usePagination } from "../../../hooks/usePagination";
import DataTable from "./DataTable";
import Badge from "../../../components/ui/Badges";
import { timeAgo, formatDateTime } from "../../../lib/utils";

const ACTION_COLORS = {
  CREATE: "green",
  UPDATE: "blue",
  DELETE: "red",
  RESTORE: "yellow",
  LOGIN: "blue",
  REGISTER: "green",
  ENROLL: "green",
  UNENROLL: "red",
  APPROVE: "green",
  REJECT: "red",
  UPLOAD: "blue",
  ERROR: "red",
};

const ACTIONS = [
  "All",
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
  "LOGIN",
  "REGISTER",
  "ENROLL",
  "UNENROLL",
  "APPROVE",
  "REJECT",
  "UPLOAD",
];
const ENTITIES = [
  "All",
  "College",
  "Course",
  "Material",
  "User",
  "Enrollment",
  "Session",
  "AcademicYear",
  "System",
];

export default function LogsPage() {
  const { page, setPage } = usePagination(1, 50);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("All");
  const [entityFilter, setEntityFilter] = useState("All");

  const { data, isLoading } = useQuery({
    queryKey: [
      "logs",
      { page, search, action: actionFilter, entity: entityFilter },
    ],
    queryFn: () =>
      logsApi
        .getAll({
          page,
          limit: 50,
          search,
          action: actionFilter,
          entity: entityFilter,
        })
        .then((r) => r.data),
  });

  const logs = Array.isArray(data) ? data : data?.data || [];
  const meta = data?.meta;

  const COLUMNS = [
    {
      key: "createdAt",
      label: "Time",
      render: (l) => (
        <span className="text-xs text-slate-400">{timeAgo(l.createdAt)}</span>
      ),
    },
    {
      key: "action",
      label: "Action",
      render: (l) => (
        <Badge variant={ACTION_COLORS[l.action] || "default"}>{l.action}</Badge>
      ),
    },
    {
      key: "entity",
      label: "Entity",
      render: (l) => <span className="text-xs text-slate-600">{l.entity}</span>,
    },
    {
      key: "entityName",
      label: "Record",
      render: (l) => (
        <span className="font-medium text-slate-900 text-xs">
          {l.entityName || "—"}
        </span>
      ),
    },
    {
      key: "performedBy",
      label: "Performed By",
      render: (l) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
            {(l.performedBy?.name || "?")[0].toUpperCase()}
          </div>
          <div>
            <p className="text-xs font-medium text-slate-900">
              {l.performedBy?.name || "System"}
            </p>
            {l.performedBy?.role && (
              <p className="text-[10px] text-slate-400 capitalize">
                {l.performedBy.role}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "success",
      label: "Status",
      render: (l) =>
        l.success !== false ? (
          <span className="text-xs font-semibold text-emerald-600">✓ OK</span>
        ) : (
          <span className="text-xs font-semibold text-red-600">✗ Failed</span>
        ),
    },
  ];

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-black text-slate-900">History Logs</h1>
        <p className="text-sm text-slate-500 mt-1">
          Full audit trail of every action in the system.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
        <div>
          <p className="text-xs font-bold uppercase text-slate-400 mb-2">
            Entity
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ENTITIES.map((e) => (
              <button
                key={e}
                onClick={() => {
                  setEntityFilter(e);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${entityFilter === e ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-bold uppercase text-slate-400 mb-2">
            Action
          </p>
          <div className="flex flex-wrap gap-1.5">
            {ACTIONS.map((a) => (
              <button
                key={a}
                onClick={() => {
                  setActionFilter(a);
                  setPage(1);
                }}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${actionFilter === a ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      <DataTable
        title="Log Entries"
        data={logs}
        columns={COLUMNS}
        loading={isLoading}
        meta={meta}
        page={page}
        onPage={setPage}
        onSearch={(s) => {
          setSearch(s);
          setPage(1);
        }}
        emptyIcon="📋"
        emptyTitle="No log entries found"
        emptyDescription="Try adjusting your filters."
      />
    </div>
  );
}
