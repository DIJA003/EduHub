import { useState, useCallback } from "react";
import { motion,  AnimatePresence } from "framer-motion";
import { Upload, FileText, Info, Check } from "lucide-react";
import FileDropZone from "../../../components/common/FileDropZone";
import Button from "../../../components/ui/Button";
import { Select } from "../../../components/ui/Dropdown";
import { useFirebaseUpload } from "../../materials/hooks/useMaterials";
import { toast } from "../../../hooks/useToasts";
import { cn } from "../../../lib/utils";

export default function UploadMaterial({ enrollments }) {
  const [file, setFile] = useState(null);
  const [courseId, setCourseId] = useState("");
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const { upload } = useFirebaseUpload();

  const handleFile = useCallback((f) => {
    setFile(f);
    setTitle((prev) => prev || f.name.replace(/\.[^.]+$/, ""));
    setUploadSuccess(false);
  }, []);

  const handleTitleChange = useCallback((e) => setTitle(e.target.value), []);

  const handleUpload = async () => {
    if (!file || !courseId || !title.trim())
      return toast.error("Please select a file, course, and title.");
    setUploading(true);
    try {
      await upload({ file, courseId, title: title.trim() }, setProgress);
      toast.success("Material submitted for review");
      setUploadSuccess(true);
      setTimeout(() => {
        setFile(null);
        setTitle("");
        setCourseId("");
        setUploadSuccess(false);
      }, 2000);
    } catch (err) {
      toast.error(err.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const courseOptions = enrollments.map((e) => ({
    value: e.courseId,
    label: e.name,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="surface"
    >
      <div className="p-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-accent-soft)] text-[var(--color-accent)] flex items-center justify-center">
            <Upload className="w-5 h-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-[var(--text-base)] font-bold text-[var(--color-text)]">
              Upload Material
            </h2>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              Submit your work for mentor review
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {uploadSuccess ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center mb-4">
              <Check className="w-8 h-8" strokeWidth={2} />
            </div>
            <h3 className="text-[var(--text-base)] font-semibold text-[var(--color-text)] mb-1">
              Upload Successful
            </h3>
            <p className="text-[var(--text-sm)] text-[var(--color-text-3)]">
              Your material has been submitted for review
            </p>
          </motion.div>
        ) : (
          <>
            <FileDropZone
              file={file}
              onFile={handleFile}
              uploading={uploading}
              progress={progress}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Title */}
              <div>
                <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                  Title
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-3)]" strokeWidth={2} />
                  <input
                    className={cn(
                      "w-full rounded-[var(--radius-lg)] border border-[var(--color-border)]",
                      "bg-[var(--color-surface-2)] pl-10 pr-4 py-2.5",
                      "text-[var(--text-sm)] text-[var(--color-text)]",
                      "placeholder:text-[var(--color-text-3)]",
                      "focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-glow)]",
                      "transition-all duration-[var(--duration-fast)]"
                    )}
                    placeholder="e.g. Chapter 3 Notes"
                    value={title}
                    onChange={handleTitleChange}
                  />
                </div>
              </div>

              {/* Course select */}
              <div>
                <label className="block text-[var(--text-xs)] font-semibold text-[var(--color-text-2)] mb-2 uppercase tracking-wider">
                  Course
                </label>
                <Select
                  value={courseId}
                  onChange={setCourseId}
                  options={courseOptions}
                  placeholder="Select course..."
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-start gap-2 text-[var(--text-xs)] text-[var(--color-text-3)]">
                <Info className="w-4 h-4 shrink-0 mt-0.5" strokeWidth={2} />
                <span>Materials are reviewed by your mentor before being visible to others.</span>
              </div>
              <Button
                onClick={handleUpload}
                loading={uploading}
                disabled={!file || !courseId || !title.trim()}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Submit
              </Button>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
}
