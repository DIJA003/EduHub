const path = require("path");
const crypto = require("crypto");
const fs = require("fs");
const { AppError } = require("../../middleware/error.middleware");

const ALLOWED_MIMES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/zip",
  "application/x-zip-compressed",
  "video/mp4",
  "video/webm",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
]);

const MAX_FILE_BYTES = 100 * 1024 * 1024;

const UPLOAD_DIR = path.join(__dirname, "../../../../uploads/materials");

const detectFileType = (mimeType) => {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Slides";
  if (mimeType.includes("zip")) return "ZIP";
  return "Other";
};

const uploadsService = {
  async getSignedUploadUrl({ fileName, mimeType, fileSize, courseId, userId }) {
    if (!ALLOWED_MIMES.has(mimeType))
      throw new AppError(`File type "${mimeType}" is not allowed.`, 400);

    if (fileSize && fileSize > MAX_FILE_BYTES)
      throw new AppError(
        `File exceeds the maximum allowed size of ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
        400,
      );

    const ext = path.extname(fileName).toLowerCase() || ".bin";
    const uniqueId = crypto.randomBytes(12).toString("hex");
    const storagePath = `${courseId || "general"}/${userId}/${uniqueId}${ext}`;
    const fileType = detectFileType(mimeType);

    // Ensure directory exists
    const dir = path.join(UPLOAD_DIR, courseId || "general", userId);
    fs.mkdirSync(dir, { recursive: true });

    return { storagePath, fileType };
  },

  getPublicUrl(storagePath) {
    if (!storagePath) return null;
    return `/uploads/materials/${storagePath}`;
  },

  deleteFile(storagePath) {
    if (!storagePath) return;
    const fullPath = path.join(UPLOAD_DIR, storagePath);
    try {
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
    } catch (err) {
      console.warn(
        "[Uploads] Could not delete file:",
        storagePath,
        err.message,
      );
    }
  },
};

module.exports = uploadsService;
