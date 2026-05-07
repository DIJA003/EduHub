import { useState, useCallback } from "react";
import {
  useMyMaterials,
  useFirebaseUpload,
  useDeleteMaterial,
} from "../../materials/hooks/useMaterials";
import { useQuery } from "@tanstack/react-query";
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

  // Separate state fields to avoid object reference churn
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
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

  // Stable callbacks
  const handleFile = useCallback((f) => {
    setFile(f);
    setTitle((prev) => prev || f.name.replace(/\.[^.]+$/, ""));
  }, []);

  const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);
  const handleCourseChange = useCallback(
    (e) => setCourseId(e.target.value),
    [],
  );

  const handleUpload = async () => {
    if (!file || !courseId || !title.trim())
      return toast.error("Please select a file, course, and title.");
    setUploading(true);
    setUploadProgress(0);
    try {
      await upload({ file, courseId, title: title.trim() }, setUploadProgress);
      toast.success("Material uploaded successfully");
      setFile(null);
      setTitle("");
      setCourseId("");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <>
      <div className="space-y-6 animate-fade-up">
        {/* Header */}
        <div>
          <h1 className="text-[var(--text-3xl)] font-black text-[var(--color-text)]">
            Upload Material
          </h1>
          <p className="text-[var(--text-sm)] text-[var(--color-text-3)] mt-1">
            Share study materials with your students.
          </p>
        </div>

        {/* Upload form */}
        <div className="surface p-6 space-y-5">
          <FileDropZone
            file={file}
            onFile={handleFile}
            uploading={uploading}
            progress={uploadProgress}
            maxMB={200}
          />

          <div className="grid grid-cols-2 gap-4">
            {/* Title */}
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Material Title{" "}
                <span className="text-[var(--color-danger)]">*</span>
              </label>
              <input
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                placeholder="e.g. Week 4 Lecture Notes"
                value={title}
                onChange={handleTitleChange}
              />
            </div>

            {/* Course */}
            <div>
              <label className="block text-[var(--text-sm)] font-medium text-[var(--color-text-2)] mb-1.5">
                Course <span className="text-[var(--color-danger)]">*</span>
              </label>
              <select
                className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3.5 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                value={courseId}
                onChange={handleCourseChange}
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
            disabled={!file || !courseId || !title.trim()}
          >
            Upload Material
          </Button>
        </div>

        {/* Materials table */}
        <div className="surface overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--color-border)]">
            <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)]">
              My Uploaded Materials
            </h2>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-[var(--color-text-3)] text-[var(--text-sm)]">
              Loading…
            </div>
          ) : materials.length === 0 ? (
            <EmptyState
              icon="📁"
              title="No materials yet"
              description="Upload your first material above."
            />
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--color-surface-2)]">
                <tr>
                  {["Material", "Course", "Type", "Status", "Date", ""].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-5 py-3 text-left text-[var(--text-xs)] font-bold uppercase tracking-wide text-[var(--color-text-3)]"
                      >
                        {h}
                      </th>
                    ),
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {materials.map((m) => (
                  <tr
                    key={m._id}
                    className="hover:bg-[var(--color-surface-2)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">
                          {TYPE_ICON[m.type] || "📁"}
                        </span>
                        <div>
                          <p className="font-medium text-[var(--color-text)] text-[var(--text-sm)]">
                            {m.title}
                          </p>
                          {m.fileUrl && (
                            <a
                              href={m.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[var(--text-xs)] text-[var(--color-accent)] hover:underline"
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
                        <span className="text-[var(--color-text-3)]">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-xs)] text-[var(--color-text-3)]">
                      {m.type}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge variant={statusBadge(m.status)}>{m.status}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-[var(--text-xs)] text-[var(--color-text-3)]">
                      {formatDate(m.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Button
                        size="xs"
                        variant="ghost"
                        onClick={() => setDeleteTarget(m)}
                      >
                        <svg
                          className="w-3.5 h-3.5 text-[var(--color-danger)]"
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
