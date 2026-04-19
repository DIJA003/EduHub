const express = require("express");
const router = express.Router();
const path = require("path");
const crypto = require("crypto");
const { bucket } = require("../../config/firebase");
const { verifyToken } = require("../../middleware/auth.middleware");
const { confirmUpload } = require("../materials/material.service");
const { logAction } = require("../../shared/logger");
const { success, badRequest, created } = require("../../shared/response");
const Enrollment = require("../enrollments/enrollment.model");

const ALLOWED_MIME_TYPES = {
  "application/pdf": "PDF",
  "video/mp4": "Video",
  "video/webm": "Video",
  "video/quicktime": "Video",
  "application/zip": "ZIP",
  "application/x-zip-compressed": "ZIP",
  "application/vnd.ms-powerpoint": "Slides",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    "Slides",
  "image/jpeg": "Image",
  "image/png": "Image",
  "image/gif": "Image",
};

const MAX_FILE_SIZE = 200 * 1024 * 1024; // 200MB

router.use(verifyToken);

router.post("/signed-url", async (req, res, next) => {
  try {
    const { fileName, mimeType, fileSize, courseId } = req.body;

    if (!fileName || !mimeType) {
      return badRequest(res, "fileName and mimeType are required");
    }

    const fileType = ALLOWED_MIME_TYPES[mimeType];
    if (!fileType) {
      return badRequest(
        res,
        `File type not allowed. Allowed: ${Object.keys(ALLOWED_MIME_TYPES).join(", ")}`,
      );
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return badRequest(res, "File too large. Maximum size is 200MB");
    }

    // Students must be enrolled
    if (req.user.role === "student" && courseId) {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
        status: "active",
      });
      if (!enrollment) {
        return res
          .status(403)
          .json({
            success: false,
            message: "You are not enrolled in this course",
          });
      }
    }

    const uniqueId = crypto.randomBytes(16).toString("hex");
    const safeFileName = path
      .basename(fileName)
      .replace(/[^a-zA-Z0-9._-]/g, "_");
    const storagePath = `materials/${req.user.role}/${req.user.id}/${uniqueId}_${safeFileName}`;

    const file = bucket.file(storagePath);
    const [signedUrl] = await file.getSignedUrl({
      version: "v4",
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 min
      contentType: mimeType,
    });

    return success(res, { signedUrl, storagePath, fileType });
  } catch (err) {
    next(err);
  }
});

router.post("/confirm", async (req, res, next) => {
  try {
    const { storagePath, fileName, mimeType } = req.body;

    if (!storagePath || !fileName || !mimeType) {
      return badRequest(
        res,
        "storagePath, fileName, and mimeType are required",
      );
    }

    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return badRequest(res, "File not found in storage. Please re-upload.");
    }

    let fileUrl;
    try {
      await file.makePublic();
      fileUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } catch {
      const [longUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 365 * 24 * 60 * 60 * 1000,
      });
      fileUrl = longUrl;
    }

    const fileType = ALLOWED_MIME_TYPES[mimeType] || "Other";

    const material = await confirmUpload({
      uploadedBy: req.user.id,
      uploaderRole: req.user.role,
      body: { ...req.body, fileUrl, fileType },
    });

    await logAction({
      action: "UPLOAD",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: {
        fileType,
        status: material.status,
        courseId: req.body.courseId,
      },
    });

    return created(res, material);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
