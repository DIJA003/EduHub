const express = require("express");
const router = express.Router();
const c = require("./mentor.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { mentorOrAdmin } = require("../../middleware/role.middleware");
const {
  validate,
  validators,
} = require("../../middleware/validate.middleware");

router.use(verifyToken, mentorOrAdmin);

router.get("/my-courses", c.getMyCourses);
router.get("/enrollable-students", c.getEnrollableStudents);
router.get("/students", c.getStudents);
router.get("/dashboard/stats", c.getDashboardStats);

router.post(
  "/enrollments",
  validate({
    studentId: [validators.required],
    courseId: [validators.required],
  }),
  c.enrollStudentInCourse,
);
router.delete("/enrollments/:studentId/:courseId", c.unenrollStudentFromCourse);

module.exports = router;
