import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardShell from "../../../components/layout/DashboardShell";
import LoadingSkeleton from "../../../components/common/LoadingSkeleton";
import EmptyState from "../../../components/common/EmptyStat";
import Badge from "../../../components/ui/Badges";
import { useMyEnrollments } from "../../courses/hooks/useEnrollments";
import { useMyMaterials } from "../../materials/hooks/useMaterials";
import useAuthStore from "../../../stores/auth.store";

const STATUS_COLORS = {
  approved: "success",
  pending: "warning",
  rejected: "danger",
  active: "info",
};

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            {label}
          </p>
          <p className="mt-1 text-3xl font-black text-slate-900">
            {value ?? 0}
          </p>
          {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  const pct = Math.round(Math.min(100, Math.max(0, value ?? 0)));
  return (
    <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="absolute inset-y-0 left-0 rounded-full bg-blue-500 transition-all duration-500"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function MyCourses({ enrollments, loading }) {
  if (loading) return <LoadingSkeleton rows={3} />;
  if (!enrollments?.length) {
    return (
      <EmptyState
        icon="📚"
        title="No courses enrolled yet"
        description="Browse the academic years and enroll in courses to get started."
        action={
          <Link
            to="/academic-year"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            Browse courses
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {enrollments.map((enr) => (
        <div
          key={enr.enrollmentId || enr.id}
          className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-slate-200"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-slate-900 truncate">
                  {enr.name}
                </h3>
                <span className="shrink-0 text-xs font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  {enr.code}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {enr.credits} credit hours · Year {enr.yearId}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <ProgressBar value={enr.progress} />
                <span className="shrink-0 text-xs font-bold text-slate-600">
                  {Math.round(enr.progress || 0)}%
                </span>
              </div>
              {enr.nextItem && (
                <p className="mt-1.5 text-xs text-slate-400 truncate">
                  Next: {enr.nextItem}
                </p>
              )}
            </div>
            <Link
              to={`/academic-year/${enr.yearId}/course/${enr.courseId || enr.id}`}
              className="shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-colors"
            >
              Continue →
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

function MyMaterials({ materials, loading }) {
  if (loading) return <LoadingSkeleton rows={3} />;
  if (!materials?.length) {
    return (
      <EmptyState
        icon="📄"
        title="No materials submitted yet"
        description="Open a course and upload your first study material for review."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <th className="px-4 py-3 text-left">Title</th>
            <th className="hidden px-4 py-3 text-left sm:table-cell">Course</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="hidden px-4 py-3 text-left md:table-cell">
              Uploaded
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {materials.map((m) => (
            <tr
              key={m._id || m.id}
              className="hover:bg-slate-50 transition-colors"
            >
              <td className="px-4 py-3 font-medium text-slate-800 max-w-[200px] truncate">
                {m.title}
              </td>
              <td className="hidden px-4 py-3 text-slate-500 sm:table-cell max-w-[140px] truncate">
                {m.courseName || "—"}
              </td>
              <td className="px-4 py-3">
                <Badge variant={STATUS_COLORS[m.status] || "default"}>
                  {m.status}
                </Badge>
                {m.status === "rejected" && m.mentorFeedback && (
                  <p
                    className="mt-1 text-xs text-red-500 max-w-[180px] truncate"
                    title={m.mentorFeedback}
                  >
                    {m.mentorFeedback}
                  </p>
                )}
              </td>
              <td className="hidden px-4 py-3 text-slate-400 md:table-cell text-xs">
                {m.createdAt ? new Date(m.createdAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const TABS = ["Overview", "My Courses", "My Materials"];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const dbUser = useAuthStore((s) => s.dbUser);
  const { data: enrollments = [], isLoading: loadEnroll } = useMyEnrollments();
  const { data: materials = [], isLoading: loadMat } = useMyMaterials();

  const approved = materials.filter((m) => m.status === "approved").length;
  const pending = materials.filter((m) => m.status === "pending").length;
  const avgProgress = enrollments.length
    ? Math.round(
        enrollments.reduce((s, e) => s + (e.progress || 0), 0) /
          enrollments.length,
      )
    : 0;

  return (
    <DashboardShell title="My Dashboard" user={dbUser}>
      {/* Welcome banner */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
        <h2 className="text-xl font-black">
          Welcome back, {dbUser?.name?.split(" ")[0] || "Student"} 👋
        </h2>
        <p className="mt-1 text-sm text-blue-100">
          {enrollments.length} course{enrollments.length !== 1 ? "s" : ""}{" "}
          enrolled · {avgProgress}% average progress
        </p>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Courses Enrolled"
          value={enrollments.length}
          icon="📚"
          sub={`${avgProgress}% avg progress`}
        />
        <StatCard
          label="Materials Submitted"
          value={materials.length}
          icon="📤"
        />
        <StatCard label="Approved" value={approved} icon="✅" sub="by mentor" />
        <StatCard label="Pending Review" value={pending} icon="⏳" />
      </div>

      <div className="mb-6 flex gap-1 border-b border-slate-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2.5 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">
              Recent Courses
            </h3>
            <MyCourses
              enrollments={enrollments.slice(0, 3)}
              loading={loadEnroll}
            />
            {enrollments.length > 3 && (
              <button
                onClick={() => setActiveTab("My Courses")}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                View all {enrollments.length} courses →
              </button>
            )}
          </div>
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">
              Recent Submissions
            </h3>
            <MyMaterials materials={materials.slice(0, 5)} loading={loadMat} />
            {materials.length > 5 && (
              <button
                onClick={() => setActiveTab("My Materials")}
                className="mt-3 text-xs font-semibold text-blue-600 hover:underline"
              >
                View all {materials.length} submissions →
              </button>
            )}
          </div>
        </div>
      )}
      {activeTab === "My Courses" && (
        <MyCourses enrollments={enrollments} loading={loadEnroll} />
      )}
      {activeTab === "My Materials" && (
        <MyMaterials materials={materials} loading={loadMat} />
      )}
    </DashboardShell>
  );
}
