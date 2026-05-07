const { bucket } = require("../../config/firebase");
const path = require("path");
const crypto = require("crypto");
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

const MAX_FILE_BYTES = 100 * 1024 * 1024; // 100 MB

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
    if (!ALLOWED_MIMES.has(mimeType)) {
      throw new AppError(`File type "${mimeType}" is not allowed.`, 400);
    }

    if (fileSize && fileSize > MAX_FILE_BYTES) {
      throw new AppError(
        `File exceeds the maximum allowed size of ${MAX_FILE_BYTES / 1024 / 1024} MB.`,
        400,
      );
    }

    const ext = path.extname(fileName).toLowerCase() || ".bin";
    const uniqueId = crypto.randomBytes(12).toString("hex");
    const storagePath = `materials/${courseId || "general"}/${userId}/${uniqueId}${ext}`;

    const file = bucket.file(storagePath);
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: mimeType,
    });

    const fileType = detectFileType(mimeType);

    return {
      signedUrl,
      storagePath,
      fileType,
      publicUrl: `https://storage.googleapis.com/${bucket.name}/${storagePath}`,
    };
  },
  async getPublicUrl(storagePath) {
    if (!storagePath) return null;
    try {
      const file = bucket.file(storagePath);
      await file.makePublic();
      return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } catch (err) {
      console.warn("[Uploads] getPublicUrl failed:", err.message);
      try {
        const [url] = await bucket.file(storagePath).getSignedUrl({
          version: "v4",
          action: "read",
          expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        });
        return url;
      } catch {
        return null;
      }
    }
  },

  async deleteFile(storagePath) {
    if (!storagePath) return;
    try {
      await bucket.file(storagePath).delete();
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
