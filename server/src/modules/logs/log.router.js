const express = require("express");
const router = express.Router();
const { getLogs, getLogById, getMentorLogs } = require("./log.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly, mentorOrAdmin } = require("../../middleware/role.middleware");

// Mentor logs - accessible by mentors and admins
router.get("/mentor", verifyToken, mentorOrAdmin, getMentorLogs);

// Admin logs - accessible by admins only
router.get("/", verifyToken, adminOnly, getLogs);
router.get("/:id", verifyToken, adminOnly, getLogById);

module.exports = router;
