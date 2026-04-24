import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  useMyEnrollments,
  useUnenroll,
} from "../../enrollment/hooks/useEnrollments";
import {
  useMyMaterials,
  useFirebaseUpload,
  useDeleteMaterial,
} from "../../materials/hooks/useMaterials";
import DashboardShell from "../../../components/layout/DashboardShell";
import Button from "../../../components/ui/Button";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import EmptyState from "../../../components/common/EmptyStat";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import {
  CardSkeleton,
  TableSkeleton,
} from "../../../components/common/LoadingSkeleton";
import { timeAgo, initials } from "../../../lib/utils";
import { toast } from "../../../hooks/useToast";
import { useRef } from "react";

const NAV_ITEMS = [
  { to: "/std-dashboard", icon: "📊", label: "Dashboard", end: true },
  { to: "/std-dashboard/courses", icon: "📚", label: "My Courses" },
  { to: "/std-dashboard/upload", icon: "📎", label: "Upload Material" },
  { to: "/std-dashboard/materials", icon: "📋", label: "My Materials" },
];

export default function StudentDashboard() {
  return (
    <DashboardShell navItems={NAV_ITEMS} portalTitle="Student Portal">
      <StudentDashboardContent />
    </DashboardShell>
  );
}

function StudentDashboardContent() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.name?.split(" ")[0] || "Student";

  const { data: enrollmentsData, isLoading: enrollLoading } =
    useMyEnrollments();
  const { data: materialsData, isLoading: matLoading } = useMyMaterials();

  const enrollments = Array.isArray(enrollmentsData)
    ? enrollmentsData
    : enrollmentsData?.data || [];
  const materials = Array.isArray(materialsData)
    ? materialsData
    : materialsData?.data || [];

  const inProgress = enrollments.filter(
    (e) => e.progress > 0 && e.progress < 100,
  ).length;
  const completed = enrollments.filter((e) => e.progress >= 100).length;
  const pending = materials.filter((m) => m.status === "pending").length;

  const unenrollMutation = useUnenroll();
  const deleteMutation = useDeleteMaterial();
  const [unenrollTarget, setUnenrollTarget] = useState(null);

  // Upload state
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadForm, setUploadForm] = useState({ courseId: "", title: "" });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef(null);
  const { upload } = useFirebaseUpload();

  const handleUpload = async () => {
    if (!uploadFile || !uploadForm.courseId || !uploadForm.title.trim()) {
      return toast.error("Please select a file, course, and title.");
    }
    setUploading(true);
    try {
      await upload(
        {
          file: uploadFile,
          courseId: uploadForm.courseId,
          title: uploadForm.title,
        },
        setUploadProgress,
      );
      toast.success("Material submitted for review");
      setUploadFile(null);
      setUploadForm({ courseId: "", title: "" });
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const TYPE_ICON = {
    PDF: "📄",
    Video: "🎬",
    Slides: "📊",
    ZIP: "🗜️",
    Image: "🖼️",
    Other: "📁",
  };
  const STATUS_LABEL = {
    pending: "⏳ Pending review",
    approved: "✅ Approved",
    rejected: "❌ Rejected",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-slate-900">
          Welcome back, {firstName} 👋
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Here's what's happening with your studies today.
        </p>
      </div>

      {/* Stats */}
      {enrollLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Enrolled Courses",
              value: enrollments.length,
              icon: "📚",
              color: "bg-blue-50 text-blue-600",
            },
            {
              label: "In Progress",
              value: inProgress,
              icon: "▶️",
              color: "bg-amber-50 text-amber-600",
            },
            {
              label: "Completed",
              value: completed,
              icon: "🎓",
              color: "bg-emerald-50 text-emerald-600",
            },
            {
              label: "Materials Uploaded",
              value: materials.length,
              icon: "📎",
              color: "bg-purple-50 text-purple-600",
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-slate-200 p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  {s.label}
                </p>
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${s.color}`}
                >
                  {s.icon}
                </div>
              </div>
              <p className="text-3xl font-black text-slate-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Enrolled Courses */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">
            My Courses ({enrollments.length})
          </h2>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate("/academic-year")}
          >
            Browse Courses
          </Button>
        </div>

        {enrollLoading ? (
          <TableSkeleton rows={3} cols={5} />
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon="📚"
            title="No courses enrolled"
            description="Browse available courses to get started."
            action={() => navigate("/academic-year")}
            actionLabel="Browse Courses"
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Course", "Code", "Progress", "Next Up", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrollments.map((e) => (
                <tr
                  key={e.enrollmentId || e.courseId}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <button
                      className="font-medium text-blue-600 hover:underline text-left"
                      onClick={() =>
                        navigate(
                          `/academic-year/${e.yearId}/course/${e.courseId}`,
                        )
                      }
                    >
                      {e.name}
                    </button>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge variant="blue">{e.code}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-200 overflow-hidden min-w-[60px]">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-[width]"
                          style={{ width: `${e.progress}%` }}
                        />
                      </div>
                      <span
                        className={`text-xs font-mono ${e.progress >= 100 ? "text-emerald-600" : "text-slate-500"}`}
                      >
                        {e.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {e.progress >= 100 ? "✓ Completed" : e.nextItem}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center gap-1.5 justify-end">
                      <Button
                        size="xs"
                        variant="secondary"
                        onClick={() =>
                          navigate(
                            `/academic-year/${e.yearId}/course/${e.courseId}`,
                          )
                        }
                      >
                        Open
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        onClick={() => setUnenrollTarget(e)}
                      >
                        Unenroll
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Upload Material */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">
          Upload Material for Review
        </h2>

        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors mb-4 ${dragOver ? "border-blue-500 bg-blue-50" : "border-slate-300 hover:border-slate-400"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const f = e.dataTransfer.files[0];
            setUploadFile(f);
            if (!uploadForm.title)
              setUploadForm((p) => ({
                ...p,
                title: f.name.replace(/\.[^.]+$/, ""),
              }));
          }}
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            className="hidden"
            accept="application/pdf,video/*,.ppt,.pptx,application/zip,image/*"
            onChange={(e) => {
              const f = e.target.files[0];
              setUploadFile(f);
              if (!uploadForm.title)
                setUploadForm((p) => ({
                  ...p,
                  title: f.name.replace(/\.[^.]+$/, ""),
                }));
            }}
          />
          {uploadFile ? (
            <p className="font-semibold text-emerald-600 text-sm">
              ✅ {uploadFile.name}
            </p>
          ) : (
            <p className="text-slate-500 text-sm">
              Drag & drop or click to select file
            </p>
          )}
        </div>

        {uploading && (
          <div className="mb-4">
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-[width]"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-400 mt-1 text-right">
              {uploadProgress}%
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Title
            </label>
            <input
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Chapter 3 Notes"
              value={uploadForm.title}
              onChange={(e) =>
                setUploadForm((p) => ({ ...p, title: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              Course
            </label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={uploadForm.courseId}
              onChange={(e) =>
                setUploadForm((p) => ({ ...p, courseId: e.target.value }))
              }
            >
              <option value="">Select course…</option>
              {enrollments.map((e) => (
                <option key={e.courseId} value={e.courseId}>
                  {e.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button
          onClick={handleUpload}
          loading={uploading}
          disabled={
            !uploadFile || !uploadForm.courseId || !uploadForm.title.trim()
          }
        >
          Submit for Review
        </Button>
        <p className="mt-2 text-xs text-slate-400">
          📌 Materials are reviewed by your mentor before being visible to
          others.
        </p>
      </div>

      {/* My Materials */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200">
          <h2 className="text-sm font-bold text-slate-900">
            My Uploaded Materials ({materials.length})
          </h2>
        </div>

        {matLoading ? (
          <TableSkeleton rows={3} cols={4} />
        ) : materials.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No materials uploaded yet"
            description="Upload materials above to see them here."
          />
        ) : (
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {["Material", "Course", "Status", "Uploaded", ""].map((h) => (
                  <th
                    key={h}
                    className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {materials.map((m) => (
                <tr key={m._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {TYPE_ICON[m.type] || "📁"}
                      </span>
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {m.title}
                        </p>
                        {m.fileUrl && m.status === "approved" && (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-600 hover:underline"
                          >
                            View file ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {m.courseRef?.title ? (
                      <Badge variant="blue">{m.courseRef.title}</Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs">
                      {STATUS_LABEL[m.status] || m.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-slate-400">
                    {timeAgo(m.createdAt)}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <Button
                      size="xs"
                      variant="ghost"
                      onClick={() => deleteMutation.mutate(m._id)}
                    >
                      <svg
                        className="w-3.5 h-3.5 text-red-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDialog
        open={!!unenrollTarget}
        title="Unenroll from course?"
        message={`Remove enrollment from "${unenrollTarget?.name}"?`}
        confirmLabel="Unenroll"
        onConfirm={() =>
          unenrollMutation.mutate(unenrollTarget.courseId, {
            onSuccess: () => setUnenrollTarget(null),
          })
        }
        onCancel={() => setUnenrollTarget(null)}
        loading={unenrollMutation.isPending}
      />
    </div>
  );
}
