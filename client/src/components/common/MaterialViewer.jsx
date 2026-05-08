import { useState, useMemo } from "react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

// Get the server origin from API URL for local file serving
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:8000/api";
const SERVER_ORIGIN = API_URL.replace(/\/api$/, "");

/**
 * Resolve a file URL to a full URL for viewing
 * - Static files are served publicly from /uploads
 */
const resolveViewUrl = (url) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `${SERVER_ORIGIN}${url}`;
  return `${SERVER_ORIGIN}/${url}`;
};

/**
 * Get download URL for a material (uses auth endpoint with original filename)
 */
const getDownloadUrl = (materialId) => {
  if (!materialId) return "";
  return `${SERVER_ORIGIN}/api/uploads/download/${materialId}`;
};

const TYPE_ICON = {
  PDF: "📄",
  Video: "🎬",
  Slides: "📊",
  ZIP: "🗜️",
  Image: "🖼️",
  Other: "📁",
};

export default function MaterialViewer({ material, onClose }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use static URL for viewing (public) and auth endpoint for download
  const viewUrl = useMemo(() => resolveViewUrl(material?.fileUrl), [material?.fileUrl]);
  const downloadUrl = useMemo(() => getDownloadUrl(material?._id), [material?._id]);
  // fileUrl is the same as viewUrl for rendering
  const fileUrl = viewUrl;

  if (!material) return null;

  const { title, type, size, originalName } = material;

  const getFileExtension = (url) => {
    if (!url) return "";
    const cleanUrl = url.split("?")[0];
    return cleanUrl.split(".").pop()?.toLowerCase() || "";
  };

  const ext = getFileExtension(fileUrl);

  // Determine viewer type based on file extension and type
  const getViewerType = () => {
    if (["pdf"].includes(ext)) return "pdf";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp"].includes(ext))
      return "image";
    if (["mp4", "webm", "ogg", "mov"].includes(ext)) return "video";
    if (["mp3", "wav", "ogg", "webm"].includes(ext)) return "audio";
    if (type === "PDF") return "pdf";
    if (type === "Image") return "image";
    if (type === "Video") return "video";
    return "unsupported";
  };

  const viewerType = getViewerType();

  const handleDownload = () => {
    // Open download URL in new tab - browser will handle the download with original filename
    // The download endpoint requires auth but the user is logged in
    window.open(downloadUrl, "_blank", "noopener,noreferrer");
  };

  const handleOpenNewTab = () => {
    if (fileUrl) window.open(fileUrl, "_blank", "noopener,noreferrer");
  };

  const renderViewer = () => {
    switch (viewerType) {
      case "pdf":
        return (
          <div className="w-full h-full min-h-[60vh] bg-white">
            <iframe
              src={`${fileUrl}#toolbar=1`}
              className="w-full h-full min-h-[60vh]"
              title={title}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load PDF");
              }}
            />
          </div>
        );

      case "image":
        return (
          <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-slate-900">
            <img
              src={fileUrl}
              alt={title}
              className="max-w-full max-h-[70vh] object-contain"
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load image");
              }}
            />
          </div>
        );

      case "video":
        return (
          <div className="w-full h-full min-h-[50vh] flex items-center justify-center bg-slate-900">
            <video
              controls
              className="max-w-full max-h-[70vh]"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load video");
              }}
            >
              <source src={fileUrl} />
              Your browser does not support the video tag.
            </video>
          </div>
        );

      case "audio":
        return (
          <div className="w-full h-full min-h-[30vh] flex flex-col items-center justify-center bg-slate-50 p-8">
            <div className="text-6xl mb-4">🎵</div>
            <audio
              controls
              className="w-full max-w-md"
              onLoadedData={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError("Failed to load audio");
              }}
            >
              <source src={fileUrl} />
              Your browser does not support the audio tag.
            </audio>
          </div>
        );

      default:
        return (
          <div className="w-full h-full min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="text-6xl mb-4">{TYPE_ICON[type] || "📁"}</div>
            <p className="text-lg font-medium text-slate-700 mb-2">
              This file type cannot be previewed
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {title} ({ext.toUpperCase() || type})
            </p>
            <div className="flex gap-3">
              <Button onClick={handleOpenNewTab} variant="secondary">
                Open in New Tab
              </Button>
              <Button onClick={handleDownload}>Download</Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal
      open={!!material}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span>{TYPE_ICON[type] || "📁"}</span>
          <span className="truncate max-w-md">{title}</span>
        </div>
      }
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="text-sm text-slate-500">
            {size && <span>Size: {size}</span>}
            {size && viewerType !== "unsupported" && (
              <span className="ml-4 capitalize">Type: {viewerType}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {viewerType !== "unsupported" && (
              <Button size="sm" variant="secondary" onClick={handleOpenNewTab}>
                Open in New Tab
              </Button>
            )}
            <Button size="sm" variant="secondary" onClick={handleDownload}>
              Download ({originalName || title || "file"})
            </Button>
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="relative">
        {loading && viewerType !== "unsupported" && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-3" />
              <p className="text-sm text-slate-500">Loading...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="w-full h-full min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="text-5xl mb-4 text-red-500">⚠️</div>
            <p className="text-lg font-medium text-slate-700 mb-2">{error}</p>
            <p className="text-sm text-slate-500 mb-6">
              There was a problem loading this file.
            </p>
            <div className="flex gap-3">
              <Button onClick={handleOpenNewTab} variant="secondary">
                Try Opening in New Tab
              </Button>
              <Button onClick={handleDownload}>Download</Button>
            </div>
          </div>
        ) : (
          renderViewer()
        )}
      </div>
    </Modal>
  );
}
