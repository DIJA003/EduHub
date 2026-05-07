import { useRef, useState } from "react";
import { cn } from "../../lib/utils";

const ACCEPT = "application/pdf,video/*,.ppt,.pptx,application/zip,image/*";

export default function FileDropZone({
  file,
  onFile,
  uploading = false,
  progress = 0,
  maxMB = 100,
  className,
}) {
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-[var(--radius-xl)] p-8 text-center cursor-pointer",
          "transition-all duration-[var(--duration-normal)]",
          dragOver
            ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] scale-[1.01]"
            : file
              ? "border-[var(--color-success)] bg-[var(--color-success-soft)]"
              : "border-[var(--color-border-2)] hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]",
          uploading && "pointer-events-none opacity-60",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept={ACCEPT}
          onChange={(e) => e.target.files[0] && onFile(e.target.files[0])}
        />

        {file ? (
          <div className="space-y-1">
            <div className="text-2xl">📎</div>
            <p className="font-semibold text-[var(--color-success)] text-[var(--text-sm)]">
              {file.name}
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              {(file.size / (1024 * 1024)).toFixed(2)} MB · Click to change
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-[var(--radius-xl)] bg-[var(--color-accent-soft)] flex items-center justify-center text-2xl mx-auto">
              ☁️
            </div>
            <p className="font-semibold text-[var(--color-text)] text-[var(--text-sm)]">
              Drag & drop or click to browse
            </p>
            <p className="text-[var(--text-xs)] text-[var(--color-text-3)]">
              PDF, Video, Slides, ZIP, Images — max {maxMB} MB
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div className="space-y-1.5">
          <div className="flex justify-between text-[var(--text-xs)]">
            <span className="text-[var(--color-text-3)]">Uploading…</span>
            <span className="font-bold text-[var(--color-accent)]">
              {progress}%
            </span>
          </div>
          <div className="h-1.5 bg-[var(--color-surface-3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--color-accent)] rounded-full transition-[width] duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
