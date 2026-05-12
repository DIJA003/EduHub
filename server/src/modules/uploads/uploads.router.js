const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const Material = require("../materials/material.model");
const { verifyToken } = require("../../middleware/auth.middleware");
const { optionalGoogleDriveCheck } = require("../../middleware/googleDrive.middleware");
const uploadsController = require("./uploads.controller");

// Download file with original filename (PUBLIC - serves with original filename header)
router.get("/download/:materialId", async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.materialId)
      .select("storagePath originalName title fileUrl")
      .lean();

    if (!material) {
      return res.status(404).json({ success: false, message: "Material not found" });
    }

    // Try storagePath first
    let filePath = null;
    if (material.storagePath) {
      filePath = path.join(__dirname, "../../../../uploads/materials", material.storagePath);
    }

    // Fallback: extract path from fileUrl if storagePath doesn't work
    if (!filePath || !fs.existsSync(filePath)) {
      if (material.fileUrl) {
        // Extract path from fileUrl (e.g., /uploads/materials/... -> ...)
        const urlPath = material.fileUrl.replace(/^.*?\/uploads\/materials\//, "");
        if (urlPath && urlPath !== material.fileUrl) {
          const altPath = path.join(__dirname, "../../../../uploads/materials", urlPath);
          if (fs.existsSync(altPath)) {
            filePath = altPath;
          }
        }
      }
    }

    // Last resort: try to find by filename pattern
    if (!filePath || !fs.existsSync(filePath)) {
      const uploadsDir = path.join(__dirname, "../../../../uploads/materials");
      const filename = material.storagePath ? path.basename(material.storagePath) : null;

      if (filename && fs.existsSync(uploadsDir)) {
        // Search in subdirectories
        const dirs = fs.readdirSync(uploadsDir).filter(f =>
          fs.statSync(path.join(uploadsDir, f)).isDirectory()
        );

        for (const dir of dirs) {
          const subDirs = fs.readdirSync(path.join(uploadsDir, dir)).filter(f =>
            fs.statSync(path.join(uploadsDir, dir, f)).isDirectory()
          );

          for (const subDir of subDirs) {
            const possiblePath = path.join(uploadsDir, dir, subDir, filename);
            if (fs.existsSync(possiblePath)) {
              filePath = possiblePath;
              break;
            }
          }
          if (filePath) break;
        }
      }
    }

    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on disk",
        debug: { storagePath: material.storagePath, fileUrl: material.fileUrl }
      });
    }

    // Use original name if available, otherwise use title
    const ext = path.extname(filePath);
    const downloadName = material.originalName || `${material.title}${ext}`;

    res.setHeader("Content-Disposition", `attachment; filename="${downloadName}"`);
    res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");

    res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
});

// Protected endpoints (require authentication)
router.use(verifyToken);

router.post(
  "/upload",
  optionalGoogleDriveCheck,
  uploadsController.uploadMiddleware,
  uploadsController.handleUpload,
);

router.delete("/file", uploadsController.deleteFile);

router.post(
  "/avatar",
  (req, res, next) => {
    uploadsController.avatarUploadMiddleware(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: "File too large. Maximum size is 2MB.",
            });
          }
          return res.status(400).json({
            success: false,
            message: `Upload error: ${err.message}`,
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  },
  uploadsController.handleAvatarUpload,
);

module.exports = router;
