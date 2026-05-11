const express = require("express");
const router = express.Router();
const {
  getAllSettings,
  getPublicSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  resetSetting,
} = require("./settings.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

// Public route - no auth required
router.get("/public", getPublicSettings);

// Protected routes - admin only
router.get("/", verifyToken, adminOnly, getAllSettings);
router.get("/:key", verifyToken, adminOnly, getSetting);
router.put("/:key", verifyToken, adminOnly, updateSetting);
router.put("/", verifyToken, adminOnly, bulkUpdateSettings);
router.post("/:key/reset", verifyToken, adminOnly, resetSetting);

module.exports = router;
