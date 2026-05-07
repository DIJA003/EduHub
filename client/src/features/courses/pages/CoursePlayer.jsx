import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import DashboardShell from "../../../components/layout/DashboardShell";
import { Skeleton } from "../../../components/common/LoadingSkeleton";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { useFirebaseUpload } from "../../materials/hooks/useMaterials";
import apiClient from "../../../lib/api/client";
import { useToasts } from "../../../hooks/useToasts";

const MAX_FILE_MB = 50;

function UploadModal({ course, yearId, onClose }) {
  const { addToast } = useToasts();
  const { upload } = useFirebaseUpload();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [sectionLabel, setSectionLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (f) => {
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File exceeds ${MAX_FILE_MB} MB limit.`);
      return;
    }
    setFile(f);
    setError("");
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  };

  const handleUpload = async () => {
    if (!file) return setError("Please select a file.");
    if (!title.trim()) return setError("Please enter a title.");
    setUploading(true);
    setError("");
    try {
      await upload(
        {
          file,
          courseId: course._id || course.id,
          yearId,
          sectionLabel: sectionLabel.trim(),
          title: title.trim(),
        },
        setProgress,
      );
      addToast("Material submitted for review!", "success");
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[var(--z-modal)] flex items-end sm:items-center justify-center px-4 py-6"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}
    >
      <div className="w-full max-w-md rounded-[var(--radius-2xl)] bg-[var(--color-surface)] border border-[var(--color-border-2)] shadow-[var(--shadow-xl)] animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h2 className="font-bold text-[var(--color-text)]">
            Upload Material
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-3)] hover:text-[var(--color-text)] text-xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)] border-opacity-30 px-4 py-2 text-[var(--text-sm)] text-[var(--color-danger)]">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Material title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
          />
          <input
            type="text"
            placeholder="Section / chapter (optional)"
            value={sectionLabel}
            onChange={(e) => setSectionLabel(e.target.value)}
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-4 py-2.5 text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
          />

          <FileDropZone
            file={file}
            onFile={handleFile}
            uploading={uploading}
            progress={progress}
            maxMB={MAX_FILE_MB}
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-[var(--color-border)] px-6 py-4">
          <Button variant="ghost" onClick={onClose} disabled={uploading}>
            Cancel
          </Button>
          <Button loading={uploading} onClick={handleUpload}>
            Upload
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function CoursePlayer() {
  const { yearId, courseId } = useParams();
  const [showUpload, setShowUpload] = useState(false);
  const [activeSection, setActiveSection] = useState(null);

  const { data: course, isLoading } = useQuery({
    queryKey: ["course", courseId],
    queryFn: async () => {
      const res = await apiClient.get(`/courses/${courseId}`);
      return res.data?.data || res.data;
    },
    enabled: !!courseId,
  });

  const { data: materials = [] } = useQuery({
    queryKey: ["materials", "course", courseId],
    queryFn: async () => {
      const res = await apiClient.get(
        `/materials?courseId=${courseId}&status=approved`,
      );
      return res.data?.data || [];
    },
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <DashboardShell title="Loading…">
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell title="Course Not Found">
        <div className="text-center py-16 text-[var(--color-text-3)]">
          Course not found.{" "}
          <Link
            to={`/academic-year/${yearId}`}
            className="text-[var(--color-accent)] hover:underline"
          >
            Go back
          </Link>
        </div>
      </DashboardShell>
    );
  }

  const sections = materials.reduce((acc, mat) => {
    const key = mat.sectionLabel || "General";
    if (!acc[key]) acc[key] = [];
    acc[key].push(mat);
    return acc;
  }, {});

  return (
    <DashboardShell title={course.title}>
      {/* Breadcrumb */}
      <div className="mb-4 flex items-center gap-2 text-[var(--text-sm)]">
        <Link
          to="/academic-year"
          className="text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors"
        >
          Academic Years
        </Link>
        <span className="text-[var(--color-text-3)]">›</span>
        <Link
          to={`/academic-year/${yearId}`}
          className="text-[var(--color-text-3)] hover:text-[var(--color-accent)] transition-colors"
        >
          Year {yearId}
        </Link>
        <span className="text-[var(--color-text-3)]">›</span>
        <span className="font-semibold text-[var(--color-text)] truncate">
          {course.title}
        </span>
      </div>

      {/* Course hero banner */}
      <div className="mb-6 rounded-[var(--radius-2xl)] bg-gradient-to-r from-[var(--color-accent)] to-[#7b9cff] p-6 text-white flex flex-wrap gap-4 items-start justify-between shadow-[var(--shadow-accent)]">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold bg-white/20 px-2 py-0.5 rounded">
              {course.code}
            </span>
            <Badge
              variant="default"
              className="bg-white/20 text-white border-transparent"
            >
              {course.creditHours} credits
            </Badge>
          </div>
          <h2 className="text-xl font-black">{course.title}</h2>
          {course.instructor && (
            <p className="mt-1 text-sm text-blue-100">👨‍🏫 {course.instructor}</p>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowUpload(true)}
          className="bg-white/20 text-white border-white/30 hover:bg-white/30"
        >
          + Upload material
        </Button>
      </div>

      {/* Materials list */}
      {Object.keys(sections).length === 0 ? (
        <div className="rounded-[var(--radius-2xl)] border-2 border-dashed border-[var(--color-border-2)] py-16 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-[var(--text-sm)] font-medium text-[var(--color-text-2)]">
            No materials yet
          </p>
          <p className="mt-1 text-[var(--text-xs)] text-[var(--color-text-3)]">
            Upload the first material for this course.
          </p>
          <Button
            size="sm"
            className="mt-4"
            onClick={() => setShowUpload(true)}
          >
            Upload material
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {Object.entries(sections).map(([section, mats]) => (
            <div key={section} className="surface overflow-hidden">
              <button
                className="flex w-full items-center justify-between px-5 py-4 font-bold text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-colors"
                onClick={() =>
                  setActiveSection(activeSection === section ? null : section)
                }
              >
                <span className="flex items-center gap-2">
                  <span>📂</span> {section}
                  <span className="text-[var(--text-xs)] font-normal text-[var(--color-text-3)]">
                    ({mats.length} files)
                  </span>
                </span>
                <span className="text-[var(--color-text-3)]">
                  {activeSection === section ? "▲" : "▼"}
                </span>
              </button>

              {activeSection === section && (
                <div className="divide-y divide-[var(--color-border)] border-t border-[var(--color-border)]">
                  {mats.map((mat) => (
                    <div
                      key={mat._id || mat.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--color-surface-2)] transition-colors"
                    >
                      <span className="text-xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[var(--text-sm)] font-medium text-[var(--color-text)] truncate">
                          {mat.title}
                        </p>
                        <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
                          {mat.type} · {mat.size}
                        </p>
                      </div>
                      {mat.fileUrl && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-[var(--text-xs)] font-bold text-[var(--color-accent)] hover:underline"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload modal — rendered outside the list so state is stable */}
      {showUpload && (
        <UploadModal
          course={course}
          yearId={yearId}
          onClose={() => setShowUpload(false)}
        />
      )}
    </DashboardShell>
  );
}
