const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const multer = require("multer");
const { confirmUpload } = require("../materials/materials.service");
const uploadsService = require("./uploads.service");
const { logAction } = require("../../shared/logger");
const { success, badRequest, created } = require("../../shared/response");
const { optionalGoogleDriveCheck } = require("../../middleware/googleDrive.middleware");
const googleDriveService = require("../../../services/googleDriveService");

const UPLOAD_DIR = path.join(__dirname, "../../../../uploads/materials");
const AVATAR_DIR = path.join(__dirname, "../../../../uploads/avatars");

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

const ALLOWED_AVATAR_MIMES = new Set(["image/jpeg", "image/png", "image/webp"]);

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

const avatarStorage = multer.diskStorage({
  destination(req, file, cb) {
    const userId = req.user?.id || "unknown";
    const dir = path.join(AVATAR_DIR, userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    cb(null, `avatar${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error(`File type "${file.mimetype}" is not allowed.`));
};

const avatarFileFilter = (req, file, cb) => {
  if (ALLOWED_AVATAR_MIMES.has(file.mimetype)) return cb(null, true);
  cb(new Error(`Avatar must be JPEG, PNG, or WebP. Got: ${file.mimetype}`));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
});

const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max for avatars
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

const getServerOrigin = () => {
  if (process.env.SERVER_URL) return process.env.SERVER_URL.replace(/\/$/, "");
  const port = process.env.PORT || 8000;
  return `http://localhost:${port}`;
};

const uploadsController = {
  uploadMiddleware: upload.single("file"),

  async handleUpload(req, res, next) {
    try {
      if (!req.file) return badRequest(res, "No file uploaded.");

      const courseId = req.body?.courseId || null;
      const userId = req.user.id;
      const useGoogleDrive = req.body?.useGoogleDrive === 'true' && req.googleDriveAvailable;

      let storagePath, fileUrl, fileSize;

      if (useGoogleDrive) {
        // Upload to Google Drive
        const driveResult = await googleDriveService.uploadFile({
          fileName: req.file.originalname,
          mimeType: req.file.mimetype,
          buffer: fs.readFileSync(req.file.path)
        }, {
          userId,
          courseId
        });

        storagePath = `googledrive://${driveResult.fileId}`;
        fileUrl = driveResult.webContentLink;
        fileSize = driveResult.size;

        // Clean up temporary file
        fs.unlinkSync(req.file.path);
      } else {
        // Use local storage (existing logic)
        storagePath = `${courseId || "general"}/${userId}/${req.file.filename}`;
        const serverOrigin = getServerOrigin();
        fileUrl = `${serverOrigin}/uploads/materials/${storagePath}`;
        fileSize = req.file.size;
      }

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
          fileSize,
          courseId: courseId || undefined,
          sectionId: req.body?.sectionId || undefined,
          sectionLabel: req.body?.sectionLabel || undefined,
          yearId: req.body?.yearId || undefined,
          title,
          fileUrl, // ← fully qualified URL
          fileType,
          storageProvider: useGoogleDrive ? 'googledrive' : 'local',
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
          fileSize: formatBytes(fileSize),
          mimeType: req.file.mimetype,
          storagePath,
          fileUrl,
          courseId,
          storageProvider: useGoogleDrive ? 'Google Drive' : 'Local',
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

  avatarUploadMiddleware: avatarUpload.single("avatar"),

  async handleAvatarUpload(req, res, next) {
    try {
      console.log("[Avatar Upload] Request received", req.user?.id);
      
      if (!req.file) {
        console.log("[Avatar Upload] No file in request");
        return badRequest(res, "No avatar file uploaded.");
      }

      console.log("[Avatar Upload] File received:", req.file.originalname, req.file.mimetype, req.file.size);
      console.log("[Avatar Upload] File path:", req.file.path);

      // Verify file exists on disk
      const fileExists = fs.existsSync(req.file.path);
      console.log("[Avatar Upload] File exists on disk:", fileExists);

      const userId = req.user.id;
      const storagePath = `${userId}/${req.file.filename}`;
      const fullPath = path.join(AVATAR_DIR, storagePath);

      const serverOrigin = getServerOrigin();
      const photoURL = `${serverOrigin}/uploads/avatars/${storagePath}`;

      console.log("[Avatar Upload] Storage path:", storagePath);
      console.log("[Avatar Upload] Full path:", fullPath);
      console.log("[Avatar Upload] Photo URL:", photoURL);
      console.log("[Avatar Upload] AVATAR_DIR:", AVATAR_DIR);

      // Log action but don't fail if logging fails
      try {
        await logAction({
          action: "AVATAR_UPLOAD",
          entity: "User",
          entityId: userId,
          entityName: req.user?.name || "User",
          performedBy: req.user,
          req,
          details: {
            fileSize: formatBytes(req.file.size),
            mimeType: req.file.mimetype,
            storagePath,
            photoURL,
          },
        });
      } catch (logErr) {
        console.log("[Avatar Upload] Log failed but continuing:", logErr.message);
      }

      console.log("[Avatar Upload] Success - returning photoURL");
      return success(res, { photoURL, storagePath });
    } catch (err) {
      console.error("[Avatar Upload] Error:", err);
      next(err);
    }
  },
};

module.exports = uploadsController;
