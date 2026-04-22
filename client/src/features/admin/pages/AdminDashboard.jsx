import { useState } from "react";
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
import { usePagination } from "../../../hooks/usePagination";
import { useDebounce } from "../../../hooks/useDebounce";
import { dashboardApi } from "../../../lib/api/dashboard.api";
import { usersApi } from "../../../lib/api/users.api";
import { materialsApi } from "../../../lib/api/materials.api";
import { logsApi } from "../../../lib/api/logs.api";
import { collegesApi } from "../../../lib/api/college.api";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon, color = "blue" }) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
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

// ─── Overview tab ─────────────────────────────────────────────────────────────
function OverviewTab() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin", "stats"],
    queryFn: () => dashboardApi.getStats().then((r) => r.data?.data ?? r.data),
    staleTime: 60_000,
  });

  const { data: activityData } = useQuery({
    queryKey: ["admin", "activity"],
    queryFn: () =>
      dashboardApi.getActivity().then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  });

  const activity = Array.isArray(activityData) ? activityData : [];
  const s = stats || {};

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard
          label="Students"
          value={s.totalStudents}
          icon="🎓"
          color="blue"
        />
        <StatCard
          label="Mentors"
          value={s.totalMentors}
          icon="👨‍🏫"
          color="green"
        />
        <StatCard
          label="Active Courses"
          value={s.activeCourses}
          icon="📚"
          color="amber"
        />
        <StatCard
          label="Pending Reviews"
          value={s.pendingApprovals}
          icon="⏳"
          color="red"
        />
        <StatCard
          label="Enrollments"
          value={s.totalEnrollments}
          icon="📋"
          color="purple"
        />
      </div>

      {activity.length > 0 && (
        <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-900">
              Recent Activity
            </h3>
          </div>
          <div className="divide-y divide-slate-50">
            {activity.slice(0, 8).map((item, i) => (
              <div
                key={item.id || i}
                className="flex items-center gap-3 px-5 py-3"
              >
                <div className="h-7 w-7 shrink-0 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {(item.user || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-slate-800">
                    {item.user}
                  </span>{" "}
                  <span className="text-sm text-slate-500">{item.action}</span>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {new Date(item.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users tab ────────────────────────────────────────────────────────────────
function UsersTab() {
  const qc = useQueryClient();
  const { addToast } = useToasts();
  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 350);
  const { page, limit, setPage } = usePagination(1, 20);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "users", dSearch, page],
    queryFn: () =>
      usersApi.getAll({ search: dSearch, page, limit }).then((r) => r.data),
    keepPreviousData: true,
  });

  const users = data?.data || [];
  const meta = data?.meta || {};

  const deleteMut = useMutation({
    mutationFn: (id) => usersApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "users"] });
      qc.invalidateQueries({ queryKey: ["admin", "stats"] });
      addToast("User deleted.", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-3 items-center justify-between">
        <input
          placeholder="Search by name or email…"
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
                          ? "red"
                          : u.role === "mentor"
                            ? "yellow"
                            : "blue"
                      }
                    >
                      {u.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={
                        u.status === "Active"
                          ? "green"
                          : u.status === "Suspended"
                            ? "red"
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
        message="This soft-deletes the user. They can be restored from the logs."
        confirmVariant="danger"
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

// ─── Materials tab ────────────────────────────────────────────────────────────
function MaterialsTab() {
  const qc = useQueryClient();
  const { addToast } = useToasts();
  const [feedback, setFeedback] = useState({});
  const [filter, setFilter] = useState("pending");

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "materials", filter],
    queryFn: () =>
      materialsApi
        .getAll({ status: filter })
        .then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 15_000,
  });

  const list = Array.isArray(data) ? data : [];

  const approveMut = useMutation({
    mutationFn: ({ id, fb }) => materialsApi.approve(id, fb),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
      addToast("Approved.", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, fb }) => materialsApi.reject(id, fb),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "materials"] });
      addToast("Rejected.", "info");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  return (
    <div>
      <div className="mb-4 flex gap-2 flex-wrap">
        {["pending", "approved", "rejected", "all"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize transition-colors ${
              filter === s
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !list.length ? (
        <EmptyState icon="📄" title={`No ${filter} materials`} />
      ) : (
        <div className="space-y-3">
          {list.map((m) => (
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
                          ? "green"
                          : m.status === "rejected"
                            ? "red"
                            : "yellow"
                      }
                    >
                      {m.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {m.courseRef?.title || "No course"} · Submitted by{" "}
                    {m.uploadedBy?.name || "unknown"} ·{" "}
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

// ─── Logs tab ─────────────────────────────────────────────────────────────────
function LogsTab() {
  const [search, setSearch] = useState("");
  const dSearch = useDebounce(search, 400);
  const { page, setPage } = usePagination(1, 50);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "logs", dSearch, page],
    queryFn: () =>
      logsApi.getAll({ search: dSearch, page, limit: 50 }).then((r) => r.data),
    keepPreviousData: true,
  });

  const logs = data?.data || [];
  const meta = data?.meta || {};

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
                    <Badge
                      variant={
                        ["CREATE", "APPROVE", "REGISTER", "ENROLL"].includes(
                          l.action,
                        )
                          ? "green"
                          : ["DELETE", "REJECT", "UNENROLL"].includes(l.action)
                            ? "red"
                            : l.action === "UPDATE"
                              ? "blue"
                              : "default"
                      }
                    >
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

// ─── Colleges tab ─────────────────────────────────────────────────────────────
function CollegesTab() {
  const qc = useQueryClient();
  const { addToast } = useToasts();
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({
    name: "",
    years: "4",
    semesters: "2",
    programs: "0",
    status: "Active",
  });
  const [adding, setAdding] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", "colleges"],
    queryFn: () =>
      collegesApi.getAll().then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 60_000,
  });

  const colleges = Array.isArray(data) ? data : [];

  const createMut = useMutation({
    mutationFn: (d) => collegesApi.create(d),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "colleges"] });
      setAdding(false);
      addToast("College created.", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => collegesApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "colleges"] });
      addToast("College deleted.", "info");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button size="sm" onClick={() => setAdding((v) => !v)}>
          {adding ? "Cancel" : "+ Add College"}
        </Button>
      </div>

      {adding && (
        <div className="mb-6 rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
          <h3 className="mb-4 text-sm font-bold text-slate-900">New College</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                key: "name",
                label: "Name *",
                placeholder: "Faculty of Engineering",
              },
              { key: "years", label: "Duration (years)", placeholder: "4" },
              { key: "semesters", label: "Semesters/year", placeholder: "2" },
              { key: "programs", label: "Programs count", placeholder: "6" },
            ].map((f) => (
              <div key={f.key}>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  {f.label}
                </label>
                <input
                  value={form[f.key]}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button
              loading={createMut.isPending}
              onClick={() =>
                createMut.mutate({
                  ...form,
                  years: Number(form.years),
                  semesters: Number(form.semesters),
                  programs: Number(form.programs),
                })
              }
              disabled={!form.name.trim()}
            >
              Save College
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <LoadingSkeleton rows={4} />
      ) : !colleges.length ? (
        <EmptyState
          icon="🏫"
          title="No colleges yet"
          description="Add the first college to get started."
        />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left">College Name</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  Duration
                </th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {colleges.map((c) => (
                <tr key={c._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800">
                    {c.name}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell">
                    {c.years} years
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant={c.status === "Active" ? "green" : "default"}
                    >
                      {c.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setConfirmDelete(c)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!confirmDelete}
        title={`Delete ${confirmDelete?.name}?`}
        message="This will soft-delete the college. It can be restored later."
        confirmVariant="danger"
        confirmLabel="Delete"
        onConfirm={() => {
          deleteMut.mutate(confirmDelete._id);
          setConfirmDelete(null);
        }}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "overview", label: "Overview", icon: "📊" },
  { key: "users", label: "Users", icon: "👥" },
  { key: "materials", label: "Materials", icon: "📄" },
  { key: "colleges", label: "Colleges", icon: "🏫" },
  { key: "logs", label: "Audit Logs", icon: "📋" },
];

// ─── Main page ────────────────────────────────────────────────────────────────
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
      {activeTab === "colleges" && <CollegesTab />}
      {activeTab === "logs" && <LogsTab />}
    </DashboardShell>
  );
}
