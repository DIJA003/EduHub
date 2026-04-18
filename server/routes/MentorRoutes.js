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

router.use(verifyToken, roleOnly("mentor", "admin"));

// ── Enrollable students (for dropdowns) ───────────────────────────────────────
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

// ── Mentor's own courses ───────────────────────────────────────────────────────
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

router.post("/enrollments", async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return res
        .status(400)
        .json({ message: "studentId and courseId required" });

    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
    });
    if (!course)
      return res
        .status(403)
        .json({ message: "You can only enroll students in your own courses" });

    const student = await User.findById(studentId).select("name email");
    if (!student) return res.status(404).json({ message: "Student not found" });

    const existing = await Enrollment.findOne({
      student: studentId,
      course: courseId,
    });
    let enrollment;
    let isReEnroll = false;

    if (existing) {
      if (existing.status === "active") {
        return res
          .status(409)
          .json({
            message: "Student is already actively enrolled in this course",
          });
      }
      existing.status = "active";
      existing.reEnrolledAt = new Date();
      existing.reEnrolledBy = req.user.id;
      existing.droppedAt = null;
      existing.droppedBy = null;
      await existing.save();
      enrollment = existing;
      isReEnroll = true;
    } else {
      enrollment = await Enrollment.create({
        student: studentId,
        course: courseId,
        enrolledBy: req.user.id,
        status: "active",
      });
    }

    const count = await Enrollment.countDocuments({
      course: courseId,
      status: "active",
    });
    await Course.findByIdAndUpdate(courseId, { students: count });

    await logAction({
      action: "ENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${student.name} → ${course.title}`,
      performedBy: req.user,
      req,
      details: {
        studentId,
        studentName: student.name,
        studentEmail: student.email,
        courseId: course._id,
        courseTitle: course.title,
        courseCode: course.code,
        isReEnroll,
        enrolledBy: req.user.name,
      },
    });

    res
      .status(isReEnroll ? 200 : 201)
      .json({ success: true, data: enrollment });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(409)
        .json({ message: "Student already actively enrolled" });
    console.error("[MentorRoute] enroll error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

router.delete("/enrollments/:studentId/:courseId", async (req, res) => {
  try {
    const { studentId, courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
    });
    if (!course)
      return res
        .status(403)
        .json({
          message: "You can only manage enrollments in your own courses",
        });

    const student = await User.findById(studentId).select("name email");

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: studentId, course: courseId, status: "active" },
      {
        status: "dropped",
        droppedAt: new Date(),
        droppedBy: req.user.id,
      },
      { new: true },
    );

    if (!enrollment)
      return res.status(404).json({ message: "Active enrollment not found" });

    const count = await Enrollment.countDocuments({
      course: courseId,
      status: "active",
    });
    await Course.findByIdAndUpdate(courseId, { students: count });

    await logAction({
      action: "UNENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${student?.name || studentId} → ${course.title}`,
      performedBy: req.user,
      req,
      details: {
        studentId,
        studentName: student?.name || "Unknown",
        studentEmail: student?.email || "",
        courseId: course._id,
        courseTitle: course.title,
        removedBy: req.user.name,
      },
    });

    res.json({ success: true, message: "Enrollment removed" });
  } catch (err) {
    console.error("[MentorRoute] unenroll error:", err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Dashboard & Students ───────────────────────────────────────────────────────
router.get("/dashboard/stats", getMentorStats);
router.get("/students", getMentorStudents);

// ── Materials ─────────────────────────────────────────────────────────────────
router.post("/materials/upload", materialController.uploadMaterial);
router.get("/materials/pending", materialController.getPendingMaterials);
router.get("/materials/review", materialController.getPendingMaterials);
router.get("/materials/my-courses", materialController.getMyCourseMaterials);
router.patch("/materials/:id/approve", materialController.approveMaterial);
router.patch("/materials/:id/reject", materialController.rejectMaterial);
router.patch("/materials/:id", materialController.update);
router.delete("/materials/:id", materialController.deleteMaterial);

// ── Course-student assignment ─────────────────────────────────────────────────
router.post(
  "/courses/:courseId/students/:studentId",
  materialController.assignStudentToCourse,
);

module.exports = router;
