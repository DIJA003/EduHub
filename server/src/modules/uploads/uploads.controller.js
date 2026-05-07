const uploadsService = require("./uploads.service");
const { confirmUpload } = require("../materials/materials.service");
const { logAction } = require("../../shared/logger");
const { success, badRequest, created } = require("../../shared/response");

const uploadsController = {
  async getSignedUrl(req, res, next) {
    try {
      const { fileName, mimeType, fileSize, courseId } = req.body;

      if (!fileName || !mimeType)
        return badRequest(res, "fileName and mimeType are required.");

      const result = await uploadsService.getSignedUploadUrl({
        fileName,
        mimeType,
        fileSize: fileSize ? Number(fileSize) : undefined,
        courseId: courseId || null,
        userId: req.user.id,
        userRole: req.user.role,
      });

      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async confirmUploadHandler(req, res, next) {
    try {
      const { storagePath, fileName, mimeType } = req.body;

      if (!storagePath || !fileName || !mimeType)
        return badRequest(
          res,
          "storagePath, fileName, and mimeType are required.",
        );

      let fileUrl = req.body.fileUrl;
      if (!fileUrl && storagePath)
        fileUrl = await uploadsService.getPublicUrl(storagePath);

      if (!fileUrl)
        return badRequest(
          res,
          "fileUrl is required. Ensure the file was uploaded successfully.",
        );

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
  },

  async deleteFile(req, res, next) {
    try {
      const { storagePath } = req.body;
      if (!storagePath) return badRequest(res, "storagePath is required.");
      await uploadsService.deleteFile(storagePath);
      return success(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = uploadsController;
