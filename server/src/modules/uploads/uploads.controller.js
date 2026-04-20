const uploadsService = require("./uploads.service");
const { success } = require("../../shared/response");

const uploadsController = {
  async getSignedUrl(req, res, next) {
    try {
      const { fileName, mimeType, courseId } = req.body;
      if (!fileName || !mimeType) {
        return res
          .status(400)
          .json({
            success: false,
            message: "fileName and mimeType are required.",
          });
      }
      const result = await uploadsService.getSignedUploadUrl({
        fileName,
        mimeType,
        courseId: courseId || null,
        userId: req.user.id,
      });
      return success(res, result);
    } catch (err) {
      next(err);
    }
  },

  async deleteFile(req, res, next) {
    try {
      const { storagePath } = req.body;
      if (!storagePath) {
        return res
          .status(400)
          .json({ success: false, message: "storagePath is required." });
      }
      await uploadsService.deleteFile(storagePath);
      return success(res, { deleted: true });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = uploadsController;
