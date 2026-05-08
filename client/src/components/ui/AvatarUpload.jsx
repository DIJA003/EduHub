import { useState, useRef } from "react";
import { cn, initials } from "../../lib/utils";

export default function AvatarUpload({
  photoURL,
  name,
  onUpload,
  size = "lg",
  editable = true,
  className,
}) {
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const sizeClasses = {
    sm: "w-10 h-10 text-sm",
    md: "w-14 h-14 text-base",
    lg: "w-20 h-20 text-xl",
    xl: "w-28 h-28 text-2xl",
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file (JPEG, PNG, or WebP)");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert("Image size must be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload
    setUploading(true);
    try {
      await onUpload?.(file);
      setPreview(null); // Clear preview after successful upload
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const displayUrl = preview || photoURL;
  const displayName = name || "?";

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "relative rounded-full overflow-hidden",
          "ring-4 ring-[var(--color-accent-soft)]",
          "bg-gradient-to-br from-[var(--color-surface-2)] to-[var(--color-surface-3)]",
          sizeClasses[size],
          editable && "cursor-pointer group",
          uploading && "opacity-70"
        )}
        onClick={() => editable && inputRef.current?.click()}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-[var(--color-accent)] bg-[var(--color-surface-2)]">
            {initials(displayName)}
          </div>
        )}

        {editable && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/50 opacity-0 group-hover:opacity-100",
              "transition-opacity duration-200"
            )}
          >
            {uploading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            )}
          </div>
        )}
      </div>

      {editable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
          disabled={uploading}
        />
      )}

      {uploading && (
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-[var(--color-accent)] text-white text-xs px-2 py-0.5 rounded-full">
          Uploading...
        </div>
      )}
    </div>
  );
}
