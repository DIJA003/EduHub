const express = require("express");
const router = express.Router();
const c = require("./enrollments.controller"); // was: ./enrollment.controller
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const {
  validate,
  validators,
} = require("../../middleware/validate.middleware");

// Admin routes

router.get("/", verifyToken, adminOnly, c.getAllEnrollments);
router.post(
  "/admin",
  verifyToken,
  adminOnly,
  validate({
    studentId: [validators.required],
    courseId: [validators.required],
  }),
  c.adminEnroll,
);
router.delete(
  "/admin/:studentId/:courseId",
  verifyToken,
  adminOnly,
  c.adminUnenroll,
);

// Student routes
router.get("/my", verifyToken, c.getMyEnrollments);
router.post("/:courseId", verifyToken, c.enroll);
router.delete("/:courseId", verifyToken, c.unenroll);
router.patch("/:courseId/progress", verifyToken, c.updateCourseProgress);
module.exports = router;
