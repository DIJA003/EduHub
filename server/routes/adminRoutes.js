const express = require("express");
const router = express.Router();

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const {
  collegeRules,
  courseRules,
  materialRules,
  handleValidation,
} = require("../middleware/validate");

const college = require("../controllers/CollegeController");
const course = require("../controllers/CourseController");
const material = require("../controllers/MaterialController");
const adminUser = require("../controllers/adminController");
const dashboard = require("../controllers/DashboardController");
const Log = require("../controllers/LogController");

const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { logAction } = require("../utils/Logger");

const authAdmin = [verifyToken, adminOnly];

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", ...authAdmin, dashboard.getStats);
router.get("/dashboard/activity", ...authAdmin, dashboard.getActivity);

// ── Logs ──────────────────────────────────────────────────────────────────────
router.get("/logs", ...authAdmin, Log.getLogs);

// ── Colleges ──────────────────────────────────────────────────────────────────
router.get("/colleges", ...authAdmin, college.getAll);
router.get("/colleges/:id", ...authAdmin, college.getById);
router.post(
  "/colleges",
  ...authAdmin,
  collegeRules,
  handleValidation,
  college.create,
);
router.put(
  "/colleges/:id",
  ...authAdmin,
  collegeRules,
  handleValidation,
  college.update,
);
router.delete("/colleges/:id", ...authAdmin, college.remove);
router.patch("/colleges/:id/restore", ...authAdmin, college.restore);

// ── Courses ───────────────────────────────────────────────────────────────────
router.get("/courses", ...authAdmin, course.getAll);
router.get("/courses/:id", ...authAdmin, course.getById);
router.post(
  "/courses",
  ...authAdmin,
  courseRules,
  handleValidation,
  course.create,
);
router.put(
  "/courses/:id",
  ...authAdmin,
  courseRules,
  handleValidation,
  course.update,
);
router.delete("/courses/:id", ...authAdmin, course.remove);
router.patch("/courses/:id/restore", ...authAdmin, course.restore);

// ── Materials ─────────────────────────────────────────────────────────────────
router.get("/materials", ...authAdmin, material.getAll);
router.get("/materials/:id", ...authAdmin, material.getById);
router.post(
  "/materials",
  ...authAdmin,
  materialRules,
  handleValidation,
  material.create,
);
router.put(
  "/materials/:id",
  ...authAdmin,
  materialRules,
  handleValidation,
  material.update,
);
router.delete("/materials/:id", ...authAdmin, material.remove);
router.patch("/materials/:id/restore", ...authAdmin, material.restore);
router.patch("/materials/:id/approve", ...authAdmin, material.approveMaterial);
router.patch("/materials/:id/reject", ...authAdmin, material.rejectMaterial);

// ── Users ─────────────────────────────────────────────────────────────────────
router.post("/users", ...authAdmin, adminUser.create);
router.get("/users", ...authAdmin, adminUser.getAll);
router.put("/users/:id", ...authAdmin, adminUser.update);
router.delete("/users/:id", ...authAdmin, adminUser.remove);
router.patch("/users/:id/restore", ...authAdmin, adminUser.restore);

// ── Enrollments ───────────────────────────────────────────────────────────────
// IMPORTANT: specific routes must come before param routes

router.get("/enrollments/students", ...authAdmin, async (req, res) => {
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

router.get("/enrollments/all", ...authAdmin, async (req, res) => {
  try {
    const data = await Enrollment.find({ status: "active" })
      .populate("student", "name email")
      .populate("course", "title code instructor")
      .sort({ enrolledAt: -1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/enrollments", ...authAdmin, async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return res
        .status(400)
        .json({ message: "studentId and courseId required" });

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
      entityName: "Student enrolled in course",
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

router.delete(
  "/enrollments/:studentId/:courseId",
  ...authAdmin,
  async (req, res) => {
    try {
      const { studentId, courseId } = req.params;
      await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId },
        { status: "dropped" },
      );
      const count = await Enrollment.countDocuments({
        course: courseId,
        status: "active",
      });
      await Course.findByIdAndUpdate(courseId, { students: count });
      res.json({ success: true, message: "Enrollment removed" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
