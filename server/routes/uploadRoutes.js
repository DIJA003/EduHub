const express = require("express");
const router = express.Router();
const { bucket } = require("../config/firebase_admin");
const { verifyToken } = require("../middleware/authMiddleware");
const Material = require("../models/Material");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { logAction } = require("../utils/Logger");
const { createNotification } = require("../controllers/notificationController");
const User = require("../models/User");
const path = require("path");
const crypto = require("crypto");

const ALLOWED_MIME_TYPES = {
  "application/pdf": { ext: "pdf", type: "PDF" },
  "video/mp4": { ext: "mp4", type: "Video" },
  "video/webm": { ext: "webm", type: "Video" },
  "video/quicktime": { ext: "mov", type: "Video" },
  "application/zip": { ext: "zip", type: "ZIP" },
  "application/x-zip-compressed": { ext: "zip", type: "ZIP" },
  "application/vnd.ms-powerpoint": { ext: "ppt", type: "Slides" },
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": {
    ext: "pptx",
    type: "Slides",
  },
  "image/jpeg": { ext: "jpg", type: "Other" },
  "image/png": { ext: "png", type: "Other" },
};

const MAX_FILE_SIZE = 200 * 1024 * 1024;

router.use(verifyToken);

router.post("/signed-url", async (req, res) => {
  try {
    const {
      fileName,
      mimeType,
      fileSize,
      courseId,
      sectionId,
      sectionLabel,
      yearId,
    } = req.body;

    if (!fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        message: "fileName and mimeType are required",
      });
    }

    const mimeInfo = ALLOWED_MIME_TYPES[mimeType];
    if (!mimeInfo) {
      return res.status(400).json({
        success: false,
        message: `File type not allowed. Allowed: PDF, Video (mp4/webm/mov), ZIP, Slides (ppt/pptx), Images`,
      });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: `File too large. Maximum size is 200MB`,
      });
    }

    if (courseId && req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        student: req.user.id,
        course: courseId,
        status: "active",
      });
      if (!enrollment) {
        return res.status(403).json({
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
      expires: Date.now() + 15 * 60 * 1000,
      contentType: mimeType,
    });

    res.json({
      success: true,
      data: {
        signedUrl,
        storagePath,
        mimeType,
        fileType: mimeInfo.type,
      },
    });
  } catch (err) {
    console.error("[Upload] signed-url error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/confirm", async (req, res) => {
  try {
    const {
      storagePath,
      fileName,
      mimeType,
      fileSize,
      courseId,
      sectionId,
      sectionLabel,
      yearId,
      title,
    } = req.body;

    if (!storagePath || !fileName || !mimeType) {
      return res.status(400).json({
        success: false,
        message: "storagePath, fileName, mimeType are required",
      });
    }

    const mimeInfo = ALLOWED_MIME_TYPES[mimeType] || { type: "Other" };

    const file = bucket.file(storagePath);
    const [exists] = await file.exists();
    if (!exists) {
      return res.status(400).json({
        success: false,
        message: "File not found in storage. Please re-upload.",
      });
    }

    let fileUrl;
    try {
      await file.makePublic();
      fileUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
    } catch {
      const [longUrl] = await file.getSignedUrl({
        version: "v4",
        action: "read",
        expires: Date.now() + 7 * 365 * 24 * 60 * 60 * 1000,
      });
      fileUrl = longUrl;
    }

    let courseName = "";
    let courseRef = null;
    if (courseId) {
      const course = await Course.findById(courseId).select("title").lean();
      if (course) {
        courseName = course.title;
        courseRef = courseId;
      }
    }

    const status = req.user.role === "student" ? "pending" : "Active";

    const formatSize = (bytes) => {
      if (!bytes) return "";
      if (bytes < 1024) return `${bytes} B`;
      if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const material = await Material.create({
      title: title || fileName,
      course: courseName,
      type: mimeInfo.type,
      size: formatSize(fileSize),
      uploader: req.user.name || req.user.email || "Unknown",
      status,
      fileUrl,
      storagePath,
      courseRef,
      uploadedByRef: req.user.id,
      uploaderRole: req.user.role,
      yearId: yearId || "",
      courseId: courseId || "",
      sectionId: sectionId || "",
      sectionLabel: sectionLabel || "",
      uploaded: new Date().toISOString().split("T")[0],
    });

    await logAction({
      action: "UPLOAD",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: {
        course: courseName,
        courseId,
        sectionId,
        type: material.type,
        status,
        fileUrl,
        storagePath,
      },
    });

    if (req.user.role === "student" && courseRef) {
      const course = await Course.findById(courseRef).select(
        "title instructorRef",
      );
      if (course?.instructorRef) {
        await createNotification({
          recipient: course.instructorRef,
          sender: req.user.id,
          type: "material_submitted",
          message: `${req.user.name || "A student"} submitted "${material.title}" for review in ${course.title}.`,
          materialRef: material._id,
          courseRef: course._id,
        });
      }
      const admins = await User.find({
        role: "admin",
        isDeleted: { $ne: true },
      }).select("_id");
      for (const admin of admins) {
        if (admin._id.toString() !== course?.instructorRef?.toString()) {
          await createNotification({
            recipient: admin._id,
            sender: req.user.id,
            type: "material_submitted",
            message: `${req.user.name || "A student"} submitted "${material.title}" pending review.`,
            materialRef: material._id,
            courseRef: course?._id,
          });
        }
      }
    }

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    console.error("[Upload] confirm error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.delete("/:materialId", async (req, res) => {
  try {
    const material = await Material.findById(req.params.materialId);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    const isOwner = material.uploadedByRef?.toString() === req.user.id;
    const isAdmin = req.user.role === "admin";
    let isMentor = false;
    if (req.user.role === "mentor" && material.courseRef) {
      const course = await Course.findOne({
        _id: material.courseRef,
        instructorRef: req.user.id,
      });
      isMentor = !!course;
    }

    if (!isOwner && !isAdmin && !isMentor) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this material",
      });
    }

    if (material.storagePath) {
      try {
        await bucket.file(material.storagePath).delete();
      } catch (storageErr) {
        console.warn("[Upload] Firebase delete warning:", storageErr.message);
      }
    }
    await Material.findByIdAndUpdate(req.params.materialId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user.id,
    });

    await logAction({
      action: "DELETE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: {
        deletedBy: req.user.name,
        storageDeleted: !!material.storagePath,
      },
    });

    res.json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    console.error("[Upload] delete error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
