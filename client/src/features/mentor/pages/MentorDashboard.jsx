import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import DashboardShell from "../../../components/layout/DashboardShell";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { useToast } from "../../../hooks/useToasts";
import useAuthStore from "../../../stores/auth.store";
import { materialsApi } from "../../../lib/api/materials.api";
import { mentorApi } from "../../../lib/api/mentor.api";

// ─── Stat card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200 flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-3xl font-black text-slate-900">{value ?? 0}</p>
      </div>
      <span className="text-3xl">{icon}</span>
    </div>
  );
}

// ─── Review Queue tab ─────────────────────────────────────────────────────────
function ReviewQueue() {
  const qc = useQueryClient();
  const { addToast } = useToast();
  const [feedback, setFeedback] = useState({});

  const { data: pendingData, isLoading } = useQuery({
    queryKey: ["mentor", "pending"],
    queryFn: () =>
      materialsApi.getPending().then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 15_000,
  });

  const pending = Array.isArray(pendingData) ? pendingData : [];

  const approveMut = useMutation({
    mutationFn: ({ id, fb }) => materialsApi.approve(id, fb),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentor", "pending"] });
      qc.invalidateQueries({ queryKey: ["mentor", "stats"] });
      addToast("Material approved!", "success");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  const rejectMut = useMutation({
    mutationFn: ({ id, fb }) => materialsApi.reject(id, fb),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["mentor", "pending"] });
      qc.invalidateQueries({ queryKey: ["mentor", "stats"] });
      addToast("Material rejected.", "info");
    },
    onError: (err) => addToast(err.message, "error"),
  });

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (!pending.length) {
    return (
      <EmptyState
        icon="✅"
        title="Review queue is empty"
        description="No pending materials to review. Check back later."
      />
    );
  }

  return (
    <div className="space-y-4">
      {pending.map((m) => (
        <div
          key={m._id}
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex flex-wrap items-start gap-3 justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-800 truncate">{m.title}</h3>
                <Badge variant="yellow">Pending</Badge>
                <span className="text-xs text-slate-400">{m.type}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                Course:{" "}
                <span className="font-medium">
                  {m.courseRef?.title || m.courseName || "Unknown"}
                </span>{" "}
                · By:{" "}
                <span className="font-medium">
                  {m.uploadedBy?.name || m.uploaderName || "Unknown"}
                </span>{" "}
                · {new Date(m.createdAt).toLocaleDateString()}
              </p>
              {m.sectionLabel && (
                <p className="mt-0.5 text-xs text-slate-400">
                  Section: {m.sectionLabel}
                </p>
              )}
            </div>
            {m.fileUrl && (
              <a
                href={m.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors"
              >
                View file ↗
              </a>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center">
            <input
              placeholder="Add feedback (optional)"
              value={feedback[m._id] || ""}
              onChange={(e) =>
                setFeedback((f) => ({ ...f, [m._id]: e.target.value }))
              }
              className="flex-1 min-w-[180px] rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Button
              size="sm"
              loading={approveMut.isPending}
              onClick={() =>
                approveMut.mutate({ id: m._id, fb: feedback[m._id] || "" })
              }
            >
              ✓ Approve
            </Button>
            <Button
              size="sm"
              variant="danger"
              loading={rejectMut.isPending}
              onClick={() =>
                rejectMut.mutate({ id: m._id, fb: feedback[m._id] || "" })
              }
            >
              ✗ Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── My Courses tab ───────────────────────────────────────────────────────────
function MyCourses() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ["mentor", "courses"],
    queryFn: () =>
      mentorApi.getMyCourses().then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 60_000,
  });

  const list = Array.isArray(courses) ? courses : [];

  if (isLoading) return <LoadingSkeleton rows={3} />;
  if (!list.length) {
    return (
      <EmptyState
        icon="📚"
        title="No courses assigned"
        description="Contact an admin to be assigned to courses."
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {list.map((c) => (
        <div
          key={c._id}
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase">
              {c.code}
            </span>
            <Badge variant="blue">{c.creditHours || 3} cr</Badge>
          </div>
          <h3 className="font-bold text-slate-900 leading-snug">{c.title}</h3>
          {c.students !== undefined && (
            <p className="mt-2 text-xs text-slate-500">
              👥 {c.students} enrolled students
            </p>
          )}
          <div className="mt-2">
            <Badge variant={c.status === "Published" ? "green" : "yellow"}>
              {c.status || "Draft"}
            </Badge>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Reviewed Materials tab ───────────────────────────────────────────────────
function ReviewedMaterials() {
  const [filter, setFilter] = useState("approved");

  const { data, isLoading } = useQuery({
    queryKey: ["mentor", "reviewed", filter],
    queryFn: () =>
      materialsApi
        .getAll({ status: filter })
        .then((r) => r.data?.data ?? r.data ?? []),
    staleTime: 30_000,
  });

  const list = Array.isArray(data) ? data : [];

  return (
    <div>
      <div className="mb-4 flex gap-2">
        {["approved", "rejected"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold capitalize ${
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
        <LoadingSkeleton rows={3} />
      ) : !list.length ? (
        <EmptyState icon="📄" title={`No ${filter} materials`} />
      ) : (
        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="px-4 py-3 text-left">Title</th>
                <th className="hidden px-4 py-3 text-left sm:table-cell">
                  Course
                </th>
                <th className="hidden px-4 py-3 text-left md:table-cell">
                  Student
                </th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {list.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium text-slate-800 max-w-[180px] truncate">
                    {m.title}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 sm:table-cell max-w-[140px] truncate">
                    {m.courseRef?.title || "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {m.uploadedBy?.name || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={m.status === "approved" ? "green" : "red"}>
                      {m.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Tabs config ──────────────────────────────────────────────────────────────
const TABS = [
  { key: "queue", label: "Review Queue", icon: "📥" },
  { key: "courses", label: "My Courses", icon: "📚" },
  { key: "reviewed", label: "Reviewed", icon: "✅" },
];

// ─── Main page ────────────────────────────────────────────────────────────────
export default function MentorDashboard() {
  const dbUser = useAuthStore((s) => s.dbUser);
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab =
    location.pathname.split("/mentor/")[1]?.split("/")[0] || "queue";
  const setTab = (key) => navigate(`/mentor/${key}`, { replace: true });

  const { data: statsData } = useQuery({
    queryKey: ["mentor", "stats"],
    queryFn: () =>
      mentorApi.getDashboardStats().then((r) => r.data?.data ?? r.data),
    staleTime: 30_000,
  });

  const stats = statsData || {};

  return (
    <DashboardShell title="Mentor Dashboard" user={dbUser}>
      {/* Welcome banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <h2 className="text-xl font-black">
          Welcome, {dbUser?.name?.split(" ")[0] || "Mentor"} 👋
        </h2>
        <p className="mt-1 text-sm text-indigo-100">
          {stats.pendingReviews ?? 0} submission
          {stats.pendingReviews !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {/* Stats row */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Pending Review"
          value={stats.pendingReviews}
          icon="📥"
        />
        <StatCard label="Approved" value={stats.approved} icon="✅" />
        <StatCard label="Rejected" value={stats.rejected} icon="❌" />
        <StatCard label="My Students" value={stats.students} icon="🎓" />
      </div>

      {/* Tab bar */}
      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === t.key
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {t.icon} {t.label}
            {t.key === "queue" && (stats.pendingReviews ?? 0) > 0 && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-black text-white">
                {stats.pendingReviews > 9 ? "9+" : stats.pendingReviews}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "queue" && <ReviewQueue />}
      {activeTab === "courses" && <MyCourses />}
      {activeTab === "reviewed" && <ReviewedMaterials />}
    </DashboardShell>
  );
}
