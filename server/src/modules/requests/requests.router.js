const express = require("express");
const router = express.Router();
const c = require("./requests.controller");
const { verifyToken, verifyRegistration } = require("../../middleware/auth.middleware");
const { mentorOrAdmin, adminOnly } = require("../../middleware/role.middleware");

// Public route - for pre-registration requests (no auth required)
router.post("/public", c.createPublic);

// User routes (require auth)
router.get("/my", verifyToken, c.getMyRequests);
router.post("/", verifyToken, c.create);
router.put("/:id/cancel", verifyToken, c.cancel);

// Admin/Faculty routes
router.get("/faculty/:facultyId/pending", verifyToken, mentorOrAdmin, c.getPendingForFaculty);
router.put("/:id/review", verifyToken, mentorOrAdmin, c.review);

// Admin only routes
router.get("/", verifyToken, adminOnly, c.getAll);
router.get("/:id", verifyToken, adminOnly, c.getById);

module.exports = router;
