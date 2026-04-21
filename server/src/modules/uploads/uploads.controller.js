const uploadsService = require("./uploads.service");
const { success, badRequest } = require("../../shared/response");

const uploadsController = {
  async getSignedUrl(req, res, next) {
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
        return badRequest(res, "fileName and mimeType are required.");
      }

      const result = await uploadsService.getSignedUploadUrl({
        fileName,
        mimeType,
        fileSize: fileSize ? Number(fileSize) : undefined,
        courseId: courseId || null,
        userId: req.user.id,
        userRole: req.user.role,
      });

      // result = { signedUrl, storagePath, fileType }
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const { storagePath } = req.body;
      if (!storagePath) {
        return badRequest(res, "storagePath is required.");
      }
      await uploadsService.deleteFile(storagePath);
      return success(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = uploadsController;
