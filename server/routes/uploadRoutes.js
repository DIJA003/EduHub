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

    if (!ALLOWED_MIME_TYPES[mimeType]) {
      return res.status(400).json({
        success: false,
        message: "File type not allowed",
      });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: "File size exceeds 200MB limit",
      });
    }

    // Verify course exists and user has access
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check user access (mentor or enrolled student)
    let hasAccess = false;
    if (req.user.role === "mentor" && course.instructorRef === req.user.id) {
      hasAccess = true;
    } else if (req.user.role === "student") {
      const enrollment = await Enrollment.findOne({
        studentRef: req.user.id,
        courseRef: courseId,
      });
      hasAccess = !!enrollment;
    }

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Generate unique filename
    const fileExt = ALLOWED_MIME_TYPES[mimeType].ext;
    const uniqueFileName = `${Date.now()}_${crypto.randomBytes(16).toString("hex")}.${fileExt}`;
    const filePath = `materials/${courseId}/${sectionId}/${uniqueFileName}`;

    // Generate signed URL for Firebase Storage
    const file = bucket.file(filePath);
    const [signedUrl] = await file.getSignedUrl({
      action: "write",
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: mimeType,
    });

    // Create material record
    const material = await Material.create({
      title: fileName,
      type: ALLOWED_MIME_TYPES[mimeType].type,
      size: fileSize,
      fileUrl: filePath,
      courseRef: courseId,
      sectionId: sectionId,
      sectionLabel: sectionLabel,
      uploadedByRef: req.user.id,
      status: req.user.role === "mentor" ? "Active" : "Draft",
      uploaded: new Date().toISOString().split("T")[0],
    });

    // Log the action
    await logAction(req.user.id, "upload_material", {
      materialId: material._id,
      courseId,
      fileName,
    });

    // Create notification for students if mentor uploads
    if (req.user.role === "mentor") {
      const enrolledStudents = await Enrollment.find({
        courseRef: courseId,
      }).populate("studentRef");

      for (const enrollment of enrolledStudents) {
        await createNotification(enrollment.studentRef._id, {
          title: "New Material Available",
          message: `New material "${fileName}" has been uploaded to ${course.title}`,
          type: "material",
          relatedId: material._id,
        });
      }
    }

    res.json({
      success: true,
      data: {
        signedUrl,
        materialId: material._id,
        filePath,
      },
    });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.delete("/material/:materialId", async (req, res) => {
  try {
    const { materialId } = req.params;

    const material = await Material.findById(materialId);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: "Material not found",
      });
    }

    // Check permissions
    const course = await Course.findById(material.courseRef);
    let canDelete = false;

    if (req.user.role === "admin") {
      canDelete = true;
    } else if (req.user.role === "mentor" && course.instructorRef === req.user.id) {
      canDelete = true;
    } else if (req.user.role === "student" && material.uploadedByRef === req.user.id) {
      canDelete = true;
    }

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Delete from Firebase Storage
    if (material.fileUrl) {
      const file = bucket.file(material.fileUrl);
      await file.delete().catch(() => {
        // File might not exist, continue
      });
    }

    // Delete material record
    await Material.findByIdAndDelete(materialId);

    // Log the action
    await logAction(req.user.id, "delete_material", {
      materialId,
    });

    res.json({
      success: true,
      message: "Material deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting material:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

module.exports = router;
