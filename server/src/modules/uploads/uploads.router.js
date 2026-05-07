const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const uploadsController = require("./uploads.controller");

router.use(verifyToken);

router.post("/signed-url", uploadsController.getSignedUrl);
router.post("/confirm", uploadsController.confirmUploadHandler);
router.delete("/file", uploadsController.deleteFile);

module.exports = router;
