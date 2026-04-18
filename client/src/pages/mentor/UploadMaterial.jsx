import { useState, useEffect, useRef } from "react";
import {
  PageHeader,
  TableWrap,
  EmptyState,
  BtnPrimary,
  BtnDanger,
  BtnSecondary,
  Badge,
  FormGroup,
  FormInput,
  FormSelect,
  tw,
} from "../../components/admin/adminUtils";
import { mentorApi } from "../../services/api";
import { useFirebaseUpload } from "../../hooks/useFirebaseUpload";

const TYPES = ["PDF", "Slides", "Video", "ZIP", "Other"];
const TYPE_ICON = {
  PDF: "📄",
  Slides: "📊",
  Video: "🎬",
  ZIP: "🗜️",
  Other: "📁",
};

const STATUS_V = {
  Active: "success",
  Draft: "warning",
  Rejected: "danger",
  pending: "warning",
  approved: "success",
  rejected: "danger",
};

const EMPTY_FORM = { title: "", courseId: "", type: TYPES[0], file: null };

export default function UploadMaterial() {
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const {
    upload,
    uploading,
    progress: uploadProgress,
    error: uploadError,
    reset: resetUpload,
  } = useFirebaseUpload();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [materialsRes, coursesRes] = await Promise.all([
        mentorApi.getMyMaterials(),
        fetch(
          `${process.env.REACT_APP_API_URL || "http://localhost:8000/api"}/mentor/my-courses`,
          {
            headers: { Authorization: `Bearer ${await getToken()}` },
          },
        ).then((r) => r.json()),
      ]);
      setMaterials(materialsRes.data || []);
      setCourses(coursesRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getToken = async () => {
    const { auth } = await import("../../services/firebase");
    return auth.currentUser?.getIdToken();
  };

  const openModal = () => {
    setForm(EMPTY_FORM);
    resetUpload();
    setModal(true);
  };

  const handleFile = (file) => {
    if (file) {
      let detectedType = "Other";
      if (file.type === "application/pdf") detectedType = "PDF";
      else if (file.type.startsWith("video/")) detectedType = "Video";
      else if (file.type.includes("zip") || file.type.includes("compressed"))
        detectedType = "ZIP";
      else if (
        file.type.includes("presentation") ||
        file.type.includes("powerpoint")
      )
        detectedType = "Slides";

      setForm((f) => ({
        ...f,
        file,
        title: f.title || file.name.replace(/\.[^.]+$/, ""),
        type: detectedType,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.file || !form.courseId) {
      setError("Please fill in all fields and select a file.");
      return;
    }

    setError(null);
    try {
      const course = courses.find((c) => c._id === form.courseId);

      const material = await upload({
        file: form.file,
        courseId: form.courseId,
        sectionId: "",
        sectionLabel: "",
        yearId: "",
        title: form.title,
      });

      setMaterials((prev) => [
        {
          _id: material._id,
          title: material.title,
          course: course?.title || "",
          courseRef: { title: course?.title || "" },
          type: material.type,
          size: material.size,
          uploadedByRef: { name: "You" },
          createdAt: new Date().toISOString(),
          status: material.status,
          fileUrl: material.fileUrl,
        },
        ...prev,
      ]);

      setModal(false);
      resetUpload();
    } catch (err) {
      setError(err.message || "Upload failed. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await mentorApi.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Material"
        subtitle="Share study materials with your students. Files are uploaded to Firebase Storage."
        actions={
          <BtnPrimary onClick={openModal}>
            <span className="material-symbols-outlined text-[16px]">
              upload_file
            </span>
            Upload New Material
          </BtnPrimary>
        }
      />

      {error && (
        <div
          className="rounded-lg px-4 py-3 text-sm"
          style={{ background: "var(--danger-bg)", color: "var(--danger)" }}
        >
          {error}{" "}
          <button className="underline ml-2" onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      <TableWrap
        toolbar={
          <span
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-primary)" }}
          >
            {materials.length} material{materials.length !== 1 ? "s" : ""}{" "}
            uploaded
          </span>
        }
      >
        {loading ? (
          <div
            className="flex items-center justify-center py-16"
            style={{ color: "var(--text-muted)" }}
          >
            <span className="material-symbols-outlined animate-spin mr-2">
              progress_activity
            </span>
            Loading…
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon="📁"
            title="No materials yet"
            description="Upload your first material using the button above."
          />
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: "var(--bg-card)" }}>
                {[
                  "Title",
                  "Course",
                  "Type",
                  "Size",
                  "Uploaded By",
                  "Date",
                  "Status",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className={tw.th}
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => (
                <tr
                  key={m._id}
                  className={tw.trHover}
                  style={{ borderBottom: "1px solid var(--border)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-hover)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-primary)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[18px]">
                        {TYPE_ICON[m.type] || "📁"}
                      </span>
                      <div>
                        <span className="font-medium">{m.title}</span>
                        {m.fileUrl && (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-[11px] mt-0.5"
                            style={{ color: "var(--accent-light)" }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            View file ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Badge variant="blue">
                      {m.courseRef?.title || m.course || "—"}
                    </Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Badge variant="default">{m.type}</Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                      fontSize: "12px",
                    }}
                  >
                    {m.size || "—"}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-secondary)",
                      borderColor: "var(--border)",
                      fontSize: "13px",
                    }}
                  >
                    {m.uploadedByRef?.name || m.uploader || "—"}
                  </td>
                  <td
                    className={tw.td}
                    style={{
                      color: "var(--text-muted)",
                      borderColor: "var(--border)",
                    }}
                  >
                    <span className="font-mono text-[12px]">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <Badge variant={STATUS_V[m.status] || "default"}>
                      {m.status}
                    </Badge>
                  </td>
                  <td
                    className={tw.td}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex justify-end">
                      <BtnDanger
                        className="!py-1 !px-3 !text-[12px]"
                        onClick={() => handleDelete(m._id)}
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          delete
                        </span>
                      </BtnDanger>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TableWrap>

      {/* Upload Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center p-5 backdrop-blur-[4px]"
          style={{ background: "rgba(0,0,0,0.72)" }}
          onClick={(e) =>
            e.target === e.currentTarget && !uploading && setModal(false)
          }
        >
          <div
            className="w-full max-w-[520px] rounded-xl overflow-hidden"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border)",
              boxShadow: "0 20px 48px rgba(0,0,0,0.4)",
            }}
          >
            <div
              className="flex items-center justify-between px-6 pt-5 pb-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <h3
                className="text-[16px] font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Upload New Material
              </h3>
              {!uploading && (
                <button
                  onClick={() => setModal(false)}
                  className="text-[20px] cursor-pointer"
                  style={{ color: "var(--text-muted)" }}
                >
                  ×
                </button>
              )}
            </div>

            <div className="p-6 space-y-4">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-150"
                style={{
                  borderColor: dragOver ? "var(--accent)" : "var(--border)",
                  background: dragOver
                    ? "var(--accent-glow)"
                    : "var(--bg-card)",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOver(false);
                  handleFile(e.dataTransfer.files[0]);
                }}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="application/pdf,video/*,.ppt,.pptx,application/zip,application/x-zip-compressed,image/*"
                  onChange={(e) => handleFile(e.target.files[0])}
                />
                <span
                  className="material-symbols-outlined text-[36px] mb-2 block"
                  style={{ color: "var(--accent-light)" }}
                >
                  cloud_upload
                </span>
                {form.file ? (
                  <div>
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--success)" }}
                    >
                      ✅ {form.file.name}
                    </p>
                    <p
                      className="text-[11px] mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {(form.file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <>
                    <p
                      className="text-[13.5px] font-semibold"
                      style={{ color: "var(--text-primary)" }}
                    >
                      Drag & drop or click to browse
                    </p>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: "var(--text-muted)" }}
                    >
                      PDF, Video (mp4/webm), Slides (ppt/pptx), ZIP, Images —
                      max 200 MB
                    </p>
                  </>
                )}
              </div>

              {/* Upload progress */}
              {uploading && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Uploading to Firebase Storage…
                    </span>
                    <span
                      className="text-[12px] font-bold"
                      style={{ color: "var(--accent-light)" }}
                    >
                      {uploadProgress}%
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "var(--bg-card)" }}
                  >
                    <div
                      className="h-full rounded-full transition-[width]"
                      style={{
                        width: `${uploadProgress}%`,
                        background: "var(--accent)",
                      }}
                    />
                  </div>
                </div>
              )}

              {(uploadError || error) && (
                <p className="text-[12.5px]" style={{ color: "var(--danger)" }}>
                  ⚠️ {uploadError || error}
                </p>
              )}

              <FormGroup label="Material Title">
                <FormInput
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="e.g. Week 4 Lecture Notes"
                />
              </FormGroup>

              <div className="grid grid-cols-2 gap-3">
                <FormGroup label="Course">
                  <FormSelect
                    value={form.courseId}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, courseId: e.target.value }))
                    }
                  >
                    <option value="">Select course…</option>
                    {courses.map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.title} {c.code ? `(${c.code})` : ""}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>
                <FormGroup label="Type">
                  <FormSelect
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </FormSelect>
                </FormGroup>
              </div>
            </div>

            <div
              className="flex justify-end gap-2 px-6 py-4"
              style={{
                borderTop: "1px solid var(--border)",
                background: "var(--bg-card)",
              }}
            >
              <BtnSecondary
                onClick={() => !uploading && setModal(false)}
                disabled={uploading}
              >
                Cancel
              </BtnSecondary>
              <BtnPrimary
                onClick={handleSave}
                disabled={
                  uploading || !form.file || !form.title || !form.courseId
                }
              >
                {uploading
                  ? `Uploading ${uploadProgress}%…`
                  : "Upload Material"}
              </BtnPrimary>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
