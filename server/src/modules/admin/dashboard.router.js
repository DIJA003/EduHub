const express = require("express");
const router = express.Router();
const { getAdminStats } = require("./dashboard.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

router.get("/stats", verifyToken, adminOnly, getAdminStats);

module.exports = router;
