const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const { confirmUpload } = require("../materials/materials.service");
const uploadsController = require("./uploads.controller");
const uploadsService = require("./uploads.service");
const { logAction } = require("../../shared/logger");
const { success, badRequest, created } = require("../../shared/response");

router.use(verifyToken);

router.post("/signed-url", uploadsController.getSignedUrl);

router.post("/confirm", async (req, res, next) => {
  try {
    const { storagePath, fileName, mimeType } = req.body;

    if (!storagePath || !fileName || !mimeType) {
      return badRequest(
        res,
        "storagePath, fileName, and mimeType are required.",
      );
    }

    let fileUrl = req.body.fileUrl;
    if (!fileUrl && storagePath) {
      fileUrl = await uploadsService.getPublicUrl(storagePath);
    }

    if (!fileUrl) {
      return badRequest(
        res,
        "fileUrl is required. Ensure the file was uploaded successfully.",
      );
    }

    const material = await confirmUpload({
      uploadedBy: req.user.id,
      uploaderRole: req.user.role,
      body: { ...req.body, fileUrl },
    });

    await logAction({
      action: "UPLOAD",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: {
        fileSize: req.body.fileSize,
        mimeType,
        storagePath,
        courseId: req.body.courseId,
        status: material.status,
      },
    });

    return created(res, material);
  } catch (err) {
    next(err);
  }
});

router.delete("/file", uploadsController.deleteFile);

module.exports = router;
