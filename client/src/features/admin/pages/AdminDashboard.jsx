import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardShell from "../../../components/layout/DashboardShell";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Pagination from "../../../components/common/Pagination";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { useToasts } from "../../../hooks/useToasts";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";
import { usePagination } from "../../../hooks/usePagination";
import { useDebounce } from "../../../hooks/useDebounce";

function StatCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black text-slate-900">
            {value ?? 0}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-full text-xl ${colors[color]}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function UsersTab() {
  const qc = useQueryClient();
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 350);
  const { page, limit, setPage } = usePagination(1, 20);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", dSearch, page],
    queryFn: async () => {
      const res = await apiClient.get(
        `/users?search=${dSearch}&page=${page}&limit=${limit}`,
      );
      return res.data;
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiClient.delete(`/users/${id}`),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "users"]);
      addToast("User deleted.", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const users = data?.data || [];
  const meta = data?.meta || {};

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          placeholder="Search users…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
        />
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : !users.length ? (
        <EmptyState icon="👤" title="No users found" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  Email
                </th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {u.name}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        u.role === "admin"
                          ? "danger"
                          : u.role === "mentor"
                            ? "warning"
                            : "info"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        u.status === "Active"
                          ? "success"
                          : u.status === "Suspended"
                            ? "danger"
                            : "default"
                      }
                    >
                      {u.status || "Active"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDelete(u)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={meta.pages || 1}
            onPageChange={setPage}
          />
        </div>
      )}
      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.name}?`}
        message="This action soft-deletes the user. They can be restored from the logs."
        variant="danger"
        confirmLabel="Delete user"
        onConfirm={() => {
          deleteMut.mutate(confirmDelete._id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

function MaterialsTab() {
  const qc = useQueryClient();
  const { addToast } = useToasts();
  const [feedback, setFeedback] = useState({});
  const [filter, setFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "materials", filter],
    queryFn: async () => {
      const q = filter !== "all" ? `?status=${filter}` : "";
      const res = await apiClient.get(`/materials${q}`);
      return res.data?.data || [];
    },
  });

  const approveMut = useMutation({
    mutationFn: ({ id, fb }) =>
      apiClient.patch(`/materials/${id}/approve`, { feedback: fb }),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "materials"]);
      addToast("Approved.", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });
  const rejectMut = useMutation({
    mutationFn: ({ id, fb }) =>
      apiClient.patch(`/materials/${id}/reject`, { feedback: fb }),
    onSuccess: () => {
      qc.invalidateQueries(["admin", "materials"]);
      addToast("Rejected.", "info");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const STATUS_OPTIONS = ["pending", "approved", "rejected", "all"];

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}
          >
            {s}
          </button>
        ))}
      </div>
      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !data?.length ? (
        <EmptyState icon="📄" title={`No ${filter} materials`} />
      ) : (
        <div className="space-y-3">
          {data.map((m) => (
            <div
              key={m._id}
              className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
            >
              <div className="flex flex-wrap items-start gap-3 justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-slate-800">{m.title}</h3>
                    <Badge
                      variant={
                        m.status === "approved"
                          ? "success"
                          : m.status === "rejected"
                            ? "danger"
                            : "warning"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {m.courseName || "No course"} · Submitted by{" "}
                    {m.uploaderName || "unknown"} ·{" "}
                    {new Date(m.createdAt).toLocaleDateString()}
                  </p>
                  {m.mentorFeedback && (
                    <p className="mt-1 text-xs text-slate-400 italic">
                      "{m.mentorFeedback}"
                    </p>
                  )}
                </div>
                {m.fileUrl && (
                  <a
                    href={m.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-bold text-blue-600 hover:underline"
                  >
                    View ↗
                  </a>
                )}
              </div>
              {m.status === "pending" && (
                <div className="mt-4 flex flex-wrap gap-3 items-center">
                  <input
                    placeholder="Feedback (optional)"
                    value={feedback[m._id] || ""}
                    onChange={(e) =>
                      setFeedback((f) => ({ ...f, [m._id]: e.target.value }))
                    }
                    className="flex-1 min-w-[180px] rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Button
                    size="sm"
                    loading={approveMut.isPending}
                    onClick={() =>
                      approveMut.mutate({
                        id: m._id,
                        fb: feedback[m._id] || "",
                      })
                    }
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={rejectMut.isPending}
                    onClick={() =>
                      rejectMut.mutate({ id: m._id, fb: feedback[m._id] || "" })
                    }
                  >
                    Reject
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LogsTab() {
  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 400);
  const { page, setPage } = usePagination(1, 50);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "logs", dSearch, page],
    queryFn: async () => {
      const res = await apiClient.get(
        `/logs?search=${dSearch}&page=${page}&limit=50`,
      );
      return res.data;
    },
  });

  const logs = data?.data || [];
  const meta = data?.meta || {};

  const ACTION_COLORS = {
    CREATE: "success",
    DELETE: "danger",
    UPDATE: "info",
    APPROVE: "success",
    REJECT: "danger",
    LOGIN: "default",
    UPLOAD: "warning",
  };

  return (
    <div>
      <input
        placeholder="Search by name or email…"
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1);
        }}
        className="mb-4 w-full sm:w-80 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
      />
      {isLoading ? (
        <LoadingSkeleton rows={6} />
      ) : !logs.length ? (
        <EmptyState icon="📋" title="No log entries" />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left">Action</th>
                <th className="px-4 py-3 text-left">Entity</th>
                <th className="hidden px-4 py-3 text-left md:table-cell">By</th>
                <th className="hidden px-4 py-3 text-left lg:table-cell">
                  When
                </th>
                <th className="px-4 py-3 text-left">OK?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {logs.map((l) => (
                <tr key={l._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Badge variant={ACTION_COLORS[l.action] || "default"}>
                      {l.action}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {l.entity}{" "}
                    {l.entityName && (
                      <span className="text-xs text-slate-400 ml-1">
                        "{l.entityName}"
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {l.performedBy?.name}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-400 text-xs lg:table-cell">
                    {new Date(l.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">{l.success ? "✅" : "❌"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={meta.pages || 1}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}

function OverviewTab() {
  const { data: stats } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: async () => {
      const [users, materials, courses] = await Promise.all([
        apiClient.get("/users?limit=1"),
        apiClient.get("/materials?limit=1"),
        apiClient.get("/courses?limit=1"),
      ]);
      return {
        users: users.data?.meta?.total || 0,
        materials: materials.data?.meta?.total || 0,
        courses: courses.data?.meta?.total || 0,
      };
    },
    staleTime: 60000,
  });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        label="Total Users"
        value={stats?.users}
        icon="👥"
        color="blue"
      />
      <StatCard
        label="Total Courses"
        value={stats?.courses}
        icon="📚"
        color="green"
      />
      <StatCard
        label="Total Materials"
        value={stats?.materials}
        icon="📄"
        color="purple"
      />
    </div>
  );
}

const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "materials", label: "Materials", icon: "📄" },
  { key: "logs", label: "Audit Logs", icon: "📋" },
];

export default function AdminDashboard() {
  const dbUser = useAuthStore((s) => s.dbUser);
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    location.pathname.split("/admin/")[1]?.split("/")[0] || "overview";

  const setTab = (key) => navigate(`/admin/${key}`, { replace: true });

  return (
    <DashboardShell title="Admin Panel" user={dbUser}>
      <div className="mb-6 flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "users" && <UsersTab />}
      {activeTab === "materials" && <MaterialsTab />}
      {activeTab === "logs" && <LogsTab />}
    </DashboardShell>
  );
}
