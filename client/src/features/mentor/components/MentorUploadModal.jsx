import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Info, Check, Folder } from "lucide-react";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import Modal from "../../../components/ui/Modal";
import { useFirebaseUpload } from "../../materials/hooks/useMaterials";
import { toast } from "../../../hooks/useToasts";
import { cn } from "../../../lib/utils";

export default function MentorUploadModal({ open, onClose, courses = [] }) {
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [sectionLabel, setSectionLabel] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { upload } = useFirebaseUpload();

  const resetForm = useCallback(() => {
    setFile(null);
    setCourseId("");
    setSectionLabel("");
    setTitle("");
    setUploadSuccess(false);
    setProgress(0);
  }, []);

  const handleClose = useCallback(() => {
    if (!uploading) {
      resetForm();
      onClose();
    }
  }, [uploading, onClose, resetForm]);

  const handleFile = useCallback((f) => {
    setFile(f);
    setTitle((prev) => prev || f.name.replace(/\.[^.]+$/, ""));
    setUploadSuccess(false);
  }, []);

  const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);
  const handleCourseChange = useCallback((e) => setCourseId(e.target.value), []);

  const handleUpload = async () => {
    if (!file || !courseId || !title.trim())
      return toast.error("Please select a file, course, and title.");
    setUploading(true);
    try {
      await upload({ file, courseId, title: title.trim(), sectionLabel: sectionLabel || "General" }, setProgress);
      toast.success("Material uploaded successfully");
      setUploadSuccess(true);
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const courseOptions = courses.map((c) => ({
    value: c._id,
    label: c.title,
  }));

  const sectionOptions = [
    { value: "", label: "General" },
    { value: "Lecture 1", label: "Lecture 1" },
    { value: "Lecture 2", label: "Lecture 2" },
    { value: "Lecture 3", label: "Lecture 3" },
    { value: "Lecture 4", label: "Lecture 4" },
    { value: "Lecture 5", label: "Lecture 5" },
    { value: "Lecture 6", label: "Lecture 6" },
    { value: "Lecture 7", label: "Lecture 7" },
    { value: "Lecture 8", label: "Lecture 8" },
    { value: "Section A", label: "Section A" },
    { value: "Section B", label: "Section B" },
    { value: "Labs", label: "Labs" },
    { value: "Assignments", label: "Assignments" },
    { value: "Exams", label: "Exams" },
    { value: "Resources", label: "Resources" },
  ];

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Upload Material"
      subtitle="Share study materials with your students"
      size="lg"
      footer={
        !uploadSuccess && (
          <>
            <Button variant="ghost" onClick={handleClose} disabled={uploading}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              loading={uploading}
              disabled={!file || !courseId || !title.trim()}
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload
            </Button>
          </>
        )
      }
    >
      <div className="space-y-5">
        <AnimatePresence mode="wait">
          {uploadSuccess ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
                <Check className="w-8 h-8" strokeWidth={2} />
              </div>
              <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-1">
                Upload Successful
              </h3>
              <p className="text-[var(--text-sm)] text-[var(--color-text-3)]">
                Your material has been uploaded and is now available to students
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              <FileDropZone
                file={file}
                onFile={handleFile}
                uploading={uploading}
                progress={progress}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                    Title
                  </label>
                  <div className="relative">
                    <FileText
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]"
                      strokeWidth={2}
                    />
                    <input
                      className={cn(
                        "w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]",
                        "bg-[var(--color-surface-2)] pl-10 pr-4 py-2.5",
                        "text-[var(--text-sm)] text-[var(--color-text)]",
                        "placeholder:text-[var(--color-text-3)]",
                        "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]",
                        "transition-all duration-[var(--duration-fast)]"
                      )}
                      placeholder="e.g. Week 4 Lecture Notes"
                      value={title}
                      onChange={handleTitleChange}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                    Course
                  </label>
                  <select
                    className={cn(
                      "w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]",
                      "bg-[var(--color-surface-2)] px-4 py-2.5",
                      "text-[var(--text-sm)] text-[var(--color-text)]",
                      "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]",
                      "transition-all duration-[var(--duration-fast)]"
                    )}
                    value={courseId}
                    onChange={handleCourseChange}
                  >
                    <option value="">Select course...</option>
                    {courseOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                    <span className="flex items-center gap-1">
                      <Folder className="w-3 h-3" />
                      Folder
                    </span>
                  </label>
                  <select
                    className={cn(
                      "w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]",
                      "bg-[var(--color-surface-2)] px-4 py-2.5",
                      "text-[var(--text-sm)] text-[var(--color-text)]",
                      "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]",
                      "transition-all duration-[var(--duration-fast)]"
                    )}
                    value={sectionLabel}
                    onChange={(e) => setSectionLabel(e.target.value)}
                  >
                    {sectionOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-start gap-2 text-[var(--text-xs)] text-[var(--color-text-3)] bg-[var(--color-surface-2)] p-3 rounded-[var(--radius-md)]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                <span>
                  Materials you upload will be immediately available to students in the selected course.
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Modal>
  );
}
