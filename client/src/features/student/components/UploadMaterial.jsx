import { useState, useCallback } from "react";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import { useFirebaseUpload } from "../../materials/hooks/useMaterials";
import { toast } from "../../../hooks/useToasts";

export default function UploadMaterial({ enrollments }) {
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { upload } = useFirebaseUpload();

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
    try {
      await upload({ file, courseId, title: title.trim() }, setProgress);
      toast.success("Material submitted for review");
      setFile(null);
      setTitle("");
      setCourseId("");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="surface p-6 space-y-4">
      <h2 className="text-[var(--text-sm)] font-bold text-[var(--color-text)]">
        Upload Material for Review
      </h2>

      <FileDropZone
        file={file}
        onFile={handleFile}
        uploading={uploading}
        progress={progress}
      />

      <div className="grid grid-cols-2 gap-3">
        {/* Title */}
        <div>
          <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-2)] mb-1.5">
            Title
          </label>
          <input
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] placeholder:text-[var(--color-text-3)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            placeholder="e.g. Chapter 3 Notes"
            value={title}
            onChange={handleTitleChange}
          />
        </div>

        {/* Course select */}
        <div>
          <label className="block text-[var(--text-xs)] font-medium text-[var(--color-text-2)] mb-1.5">
            Course
          </label>
          <select
            className="w-full rounded-[var(--radius-md)] border border-[var(--color-border-2)] bg-[var(--color-surface-2)] px-3 py-2 text-[var(--text-sm)] text-[var(--color-text)] outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
            value={courseId}
            onChange={handleCourseChange}
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
        disabled={!file || !courseId || !title.trim()}
      >
        Submit for Review
      </Button>

      <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
        📌 Materials are reviewed by your mentor before being visible to others.
      </p>
    </div>
  );
}
