import { useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../../lib/firebase";
import DashboardShell from "../../../components/layout/DashboardShell";
import { Skeleton } from "../../../components/common/LoadingSkeleton";
import Button from "../../../components/ui/Button";
import Badge from "../../../components/ui/Badges";
import { useCreateMaterial } from "../../materials/hooks/useMaterials";
import useAuthStore from "../../../stores/auth.store";
import apiClient from "../../../lib/api/client";
import { toast } from "../../../hooks/useToasts";

const MAX_FILE_MB = 50;

function UploadModal({ course, yearId, onClose }) {
  const createMaterial = useCreateMaterial();
  const fileRef = useRef(null);

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [sectionLabel, setSectionLabel] = useState("");
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
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
      const ext = file.name.split(".").pop();
      const storagePath = `materials/${course._id || course.id}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, storagePath);
      const task = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        task.on(
          "state_changed",
          (snap) =>
            setProgress(
              Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
            ),
          reject,
          resolve,
        );
      });

      const fileUrl = await getDownloadURL(task.snapshot.ref);

      await createMaterial.mutateAsync({
        title: title.trim(),
        courseId: course._id || course.id,
        yearId,
        sectionLabel: sectionLabel.trim(),
        type: ext?.toUpperCase() || "Other",
        fileUrl,
        storagePath,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        mimeType: file.type,
      });

      toast.success("Material submitted for review!");
      onClose();
    } catch (err) {
      setError(err.message || "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 py-6">
      <div className="w-full max-w-md rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-bold text-slate-900">Upload Material</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-xl leading-none"
          >
            ×
          </button>
        </div>
        <div className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">
              {error}
            </div>
          )}
          <input
            type="text"
            placeholder="Material title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="text"
            placeholder="Section / chapter (optional)"
            value={sectionLabel}
            onChange={(e) => setSectionLabel(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div
            onClick={() => fileRef.current?.click()}
            className="flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-200 p-6 cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          >
            {file ? (
              <p className="text-sm font-medium text-slate-700">{file.name}</p>
            ) : (
              <>
                <span className="text-2xl">📎</span>
                <p className="text-sm text-slate-500">
                  Click to select a file (max {MAX_FILE_MB} MB)
                </p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              className="hidden"
              onChange={handleFile}
            />
          </div>

          {uploading && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1">
                <span>Uploading…</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <Button variant="secondary" onClick={onClose} disabled={uploading}>
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

export default function CoursePlayer() {
  const { yearId, courseId } = useParams();
  const dbUser = useAuthStore((s) => s.dbUser);
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
      <DashboardShell title="Loading…" user={dbUser}>
        <Skeleton rows={5} />
      </DashboardShell>
    );
  }

  if (!course) {
    return (
      <DashboardShell title="Course Not Found" user={dbUser}>
        <div className="text-center py-16 text-slate-500">
          Course not found.{" "}
          <Link
            to={`/academic-year/${yearId}`}
            className="text-blue-600 hover:underline"
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
    <DashboardShell title={course.title} user={dbUser}>
      <div className="mb-4 flex items-center gap-2 text-sm">
        <Link
          to="/academic-year"
          className="text-slate-400 hover:text-blue-600"
        >
          Academic Years
        </Link>
        <span className="text-slate-300">›</span>
        <Link
          to={`/academic-year/${yearId}`}
          className="text-slate-400 hover:text-blue-600"
        >
          Year
        </Link>
        <span className="text-slate-300">›</span>
        <span className="font-semibold text-slate-700 truncate">
          {course.title}
        </span>
      </div>

      <div className="mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white flex flex-wrap gap-4 items-start justify-between">
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

      {Object.keys(sections).length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 py-16 text-center">
          <p className="text-3xl mb-3">📚</p>
          <p className="text-sm font-medium text-slate-600">No materials yet</p>
          <p className="mt-1 text-xs text-slate-400">
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
        <div className="space-y-4">
          {Object.entries(sections).map(([section, mats]) => (
            <div
              key={section}
              className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden"
            >
              <button
                className="flex w-full items-center justify-between px-5 py-4 font-bold text-slate-800 hover:bg-slate-50 transition-colors"
                onClick={() =>
                  setActiveSection(activeSection === section ? null : section)
                }
              >
                <span className="flex items-center gap-2">
                  <span>📂</span> {section}
                  <span className="text-xs font-normal text-slate-400">
                    ({mats.length} files)
                  </span>
                </span>
                <span className="text-slate-400">
                  {activeSection === section ? "▲" : "▼"}
                </span>
              </button>
              {activeSection === section && (
                <div className="divide-y divide-slate-50 border-t border-slate-100">
                  {mats.map((mat) => (
                    <div
                      key={mat._id || mat.id}
                      className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition-colors"
                    >
                      <span className="text-xl">📄</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {mat.title}
                        </p>
                        <p className="text-xs text-slate-400">
                          {mat.type} · {mat.size}
                        </p>
                      </div>
                      {mat.fileUrl && (
                        <a
                          href={mat.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0 text-xs font-bold text-blue-600 hover:underline"
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
