const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { confirmUpload } = require("../materials/materials.service");
const uploadsService = require("./uploads.service");
const { logAction } = require("../../shared/logger");
const { success, badRequest, created } = require("../../shared/response");

const UPLOAD_DIR = path.join(__dirname, "../../../../uploads/materials");

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

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const courseId = req.body?.courseId || "general";
    const userId = req.user?.id || "unknown";
    const dir = path.join(UPLOAD_DIR, courseId, userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".bin";
    const uniqueId = crypto.randomBytes(12).toString("hex");
    cb(null, `${uniqueId}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error(`File type "${file.mimetype}" is not allowed.`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const detectFileType = (mimeType) => {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.includes("presentation") || mimeType.includes("powerpoint"))
    return "Slides";
  if (mimeType.includes("zip")) return "ZIP";
  return "Other";
};

const formatBytes = (bytes) => {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const uploadsController = {
  uploadMiddleware: upload.single("file"),

  async handleUpload(req, res, next) {
    try {
      if (!req.file) return badRequest(res, "No file uploaded.");

      const courseId = req.body?.courseId || null;
      const userId = req.user.id;
      const storagePath = `${courseId || "general"}/${userId}/${req.file.filename}`;
      const fileUrl = `/uploads/materials/${storagePath}`;
      const fileType = detectFileType(req.file.mimetype);
      const title =
        req.body?.title || req.file.originalname.replace(/\.[^.]+$/, "");

      const material = await confirmUpload({
        uploadedBy: userId,
        uploaderRole: req.user.role,
        body: {
          storagePath,
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          fileSize: req.file.size,
          courseId: courseId || undefined,
          sectionId: req.body?.sectionId || undefined,
          sectionLabel: req.body?.sectionLabel || undefined,
          yearId: req.body?.yearId || undefined,
          title,
          fileUrl,
          fileType,
        },
      });

      await logAction({
        action: "UPLOAD",
        entity: "Material",
        entityId: material._id,
        entityName: material.title,
        performedBy: req.user,
        req,
        details: {
          fileSize: formatBytes(req.file.size),
          mimeType: req.file.mimetype,
          storagePath,
          courseId,
          status: material.status,
        },
      });

      return created(res, material);
    } catch (err) {
      next(err);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const { storagePath } = req.body;
      if (!storagePath) return badRequest(res, "storagePath is required.");
      uploadsService.deleteFile(storagePath);
      return success(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = uploadsController;
