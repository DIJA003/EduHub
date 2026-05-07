import { useState } from "react";
import {
  useMyMaterials,
  useFirebaseUpload,
  useDeleteMaterial,
} from "../../materials/hooks/useMaterials";
import { useQuery } from "@tanstack/react-query";
import api from "../../../lib/api/client";
import { usePagination } from "../../../hooks/usePagination";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import Badge, { statusBadge } from "../../../components/ui/Badges";
import EmptyState from "../../../components/common/EmptyStat";
import ConfirmDialog from "../../../components/common/ConfirmDialog";
import { toast } from "../../../hooks/useToasts";
import { formatDate } from "../../../lib/utils";
import { mentorApi } from "../../../lib/api/mentor.api";

const TYPE_ICON = {
  PDF: "📄",
  Video: "🎬",
  Slides: "📊",
  ZIP: "🗜️",
  Image: "🖼️",
  Other: "📁",
};

export default function MentorUpload() {
  const { page } = usePagination();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [form, setForm] = useState({ courseId: "", title: "" });
  const [file, setFile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data: materialsData, isLoading } = useMyMaterials({ page });
  const materials = Array.isArray(materialsData)
    ? materialsData
    : materialsData?.data || [];

  const { data: coursesData } = useQuery({
    queryKey: ["mentor-my-courses"],
    queryFn: () =>
      mentorApi.getMyCourses().then((r) => r.data?.data ?? r.data ?? []),
  });
  const courses = coursesData || [];

  const { upload } = useFirebaseUpload();
  const deleteMutation = useDeleteMaterial();

  const handleFile = (f) => {
    setFile(f);
    if (!form.title)
      setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleUpload = async () => {
    if (!file || !form.courseId || !form.title.trim())
      return toast.error("Please select a file, course, and title.");
    setUploading(true);
    setUploadProgress(0);
    try {
      await upload(
        { file, courseId: form.courseId, title: form.title },
        setUploadProgress,
      );
      toast.success("Material uploaded successfully");
      setFile(null);
      setForm({ courseId: "", title: "" });
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Upload Material
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Share study materials with your students via Firebase Storage.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-5">
          <FileDropZone
            file={file}
            onFile={handleFile}
            uploading={uploading}
            progress={uploadProgress}
            maxMB={200}
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Material Title <span className="text-red-500">*</span>
              </label>
              <input
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Week 4 Lecture Notes"
                value={form.title}
                onChange={(e) =>
                  setForm((p) => ({ ...p, title: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Course <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={form.courseId}
                onChange={(e) =>
                  setForm((p) => ({ ...p, courseId: e.target.value }))
                }
              >
                <option value="">Select course…</option>
                {courses.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Button
            onClick={handleUpload}
            loading={uploading}
            disabled={!file || !form.courseId || !form.title.trim()}
          >
            Upload Material
          </Button>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-200">
            <h2 className="text-sm font-bold text-slate-900">
              My Uploaded Materials
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading…</div>
          ) : materials.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No materials yet"
              description="Upload your first material above."
            />
          ) : (
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  {["Material", "Course", "Type", "Status", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {materials.map((m) => (
                  <tr
                    key={m._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {TYPE_ICON[m.type] || "📁"}
                        </span>
                        <div>
                          <p className="font-medium text-slate-900 text-sm">
                            {m.title}
                          </p>
                          {m.fileUrl && (
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
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {m.type}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusBadge(m.status)}>{m.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-400">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setDeleteTarget(m)}
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
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Material"
        message={`Delete "${deleteTarget?.title}"?`}
        confirmLabel="Delete"
        onConfirm={() =>
          deleteMutation.mutate(deleteTarget._id, {
            onSuccess: () => setDeleteTarget(null),
          })
        }
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
