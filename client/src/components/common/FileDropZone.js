import { useRef } from "react";
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

  const handleDrop = (e) => {
    e.preventDefault();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={cn(
          "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors",
          "border-slate-300 hover:border-blue-400 hover:bg-blue-50",
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
          <div>
            <p className="font-semibold text-emerald-600 text-sm">
              ✅ {file.name}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {(file.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>
        ) : (
          <div>
            <p className="text-2xl mb-2">☁️</p>
            <p className="font-semibold text-slate-700 text-sm">
              Drag & drop or click to browse
            </p>
            <p className="text-xs text-slate-400 mt-1">
              PDF, Video, Slides, ZIP, Images — max {maxMB}MB
            </p>
          </div>
        )}
      </div>

      {uploading && (
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-500">Uploading…</span>
            <span className="font-bold text-blue-600">{progress}%</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-[width]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
