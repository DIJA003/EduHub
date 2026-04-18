const express = require("express");
const router = express.Router();
const materialController = require("../controllers/MaterialController");
const Enrollment = require("../models/Enrollment");
const User = require("../models/User");
const Course = require("../models/Course");
const { logAction } = require("../utils/Logger");
const { verifyToken, roleOnly } = require("../middleware/authMiddleware");

const {
  getMentorStats,
  getMentorStudents,
} = require("../controllers/MentorDashboardController");
// All mentor routes require authentication and mentor role
router.use(verifyToken, roleOnly("mentor", "admin"));

router.get("/enrollable-students", async (req, res) => {
  try {
    const students = await User.find({
      role: "student",
      isDeleted: { $ne: true },
    }).select("name email college");
    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET mentor's courses (for dropdown)
router.get("/my-courses", async (req, res) => {
  try {
    const courses = await Course.find({
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    }).select("title code");
    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST enroll
router.post("/enrollments", async (req, res) => {
  try {
    const { studentId, courseId } = req.body;

    // verify this course belongs to this mentor
    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
    });
    if (!course)
      return res
        .status(403)
        .json({ message: "You can only enroll students in your own courses" });

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      enrolledBy: req.user.id,
      status: "active",
    });

    const count = await Enrollment.countDocuments({
      course: courseId,
      status: "active",
    });
    await Course.findByIdAndUpdate(courseId, { students: count });

    await logAction({
      action: "CREATE",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `Student enrolled in ${course.title}`,
      performedBy: req.user,
      details: { studentId, courseId },
    });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Student already enrolled" });
    res.status(400).json({ message: err.message });
  }
});

// DELETE unenroll
router.delete("/enrollments/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;
    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
    });
    if (!course) return res.status(403).json({ message: "Not your course" });

    await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId },
      { status: "dropped" },
    );
    const count = await Enrollment.countDocuments({
      course: courseId,
      status: "active",
    });
    await Course.findByIdAndUpdate(courseId, { students: count });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
////////// Material Management//////////////

router.get("/dashboard/stats", getMentorStats);
router.get("/students", getMentorStudents);
router.get("/dashboard/stats", getMentorStats);
router.post("/materials/upload", materialController.uploadMaterial);
router.get("/materials/pending", materialController.getPendingMaterials);
router.get("/materials/my-courses", materialController.getMyCourseMaterials);
router.patch("/materials/:id/approve", materialController.approveMaterial);
router.delete("/materials/:id/reject", materialController.rejectMaterial);
router.patch("/materials/:id", materialController.update);
router.delete("/materials/:id", materialController.deleteMaterial);
router.post(
  "/courses/:courseId/students/:studentId",
  materialController.assignStudentToCourse,
);

module.exports = router;
