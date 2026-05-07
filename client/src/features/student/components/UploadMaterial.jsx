import { useState } from "react";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import { useFirebaseUpload } from "../../materials/hooks/useMaterials";
import { toast } from "../../../hooks/useToasts";

export default function UploadMaterial({ enrollments }) {
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ courseId: "", title: "" });
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const { upload } = useFirebaseUpload();

  const handleFile = (f) => {
    setFile(f);
    if (!form.title)
      setForm((p) => ({ ...p, title: f.name.replace(/\.[^.]+$/, "") }));
  };

  const handleUpload = async () => {
    if (!file || !form.courseId || !form.title.trim())
      return toast.error("Please select a file, course, and title.");
    setUploading(true);
    try {
      await upload(
        { file, courseId: form.courseId, title: form.title },
        setProgress,
      );
      toast.success("Material submitted for review");
      setFile(null);
      setForm({ courseId: "", title: "" });
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
      <h2 className="text-sm font-bold text-slate-900">
        Upload Material for Review
      </h2>

      <FileDropZone
        file={file}
        onFile={handleFile}
        uploading={uploading}
        progress={progress}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Title
          </label>
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g. Chapter 3 Notes"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1.5">
            Course
          </label>
          <select
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={form.courseId}
            onChange={(e) =>
              setForm((p) => ({ ...p, courseId: e.target.value }))
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
        disabled={!file || !form.courseId || !form.title.trim()}
      >
        Submit for Review
      </Button>
      <p className="text-xs text-slate-400">
        📌 Materials are reviewed by your mentor before being visible to others.
      </p>
    </div>
  );
}
