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
router.get("/logs/:id", ...authAdmin, Log.getById);

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
      .sort({ createdAt: -1 });
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

    const [student, course] = await Promise.all([
      User.findById(studentId).select("name email"),
      Course.findById(courseId).select("title code"),
    ]);
    if (!student) return res.status(404).json({ message: "Student not found" });
    if (!course) return res.status(404).json({ message: "Course not found" });

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
        courseId,
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
        .json({ message: "Student already actively enrolled in this course" });
    console.error("[AdminRoute] enroll error:", err.message);
    res.status(400).json({ message: err.message });
  }
});

router.delete(
  "/enrollments/:studentId/:courseId",
  ...authAdmin,
  async (req, res) => {
    try {
      const { studentId, courseId } = req.params;

      const [student, course] = await Promise.all([
        User.findById(studentId).select("name email"),
        Course.findById(courseId).select("title code"),
      ]);

      const enrollment = await Enrollment.findOneAndUpdate(
        { student: studentId, course: courseId, status: "active" },
        {
          status: "dropped",
          droppedAt: new Date(),
          droppedBy: req.user.id,
        },
        { new: true },
      );

      if (!enrollment) {
        return res.status(404).json({ message: "Active enrollment not found" });
      }

      const count = await Enrollment.countDocuments({
        course: courseId,
        status: "active",
      });
      await Course.findByIdAndUpdate(courseId, { students: count });

      await logAction({
        action: "UNENROLL",
        entity: "Enrollment",
        entityId: enrollment._id,
        entityName: `${student?.name || studentId} → ${course?.title || courseId}`,
        performedBy: req.user,
        req,
        details: {
          studentId,
          studentName: student?.name || "Unknown",
          studentEmail: student?.email || "",
          courseId,
          courseTitle: course?.title || "Unknown",
          courseCode: course?.code || "",
          removedBy: req.user.name,
        },
      });

      res.json({
        success: true,
        message: "Enrollment removed — student can be re-added at any time",
      });
    } catch (err) {
      console.error("[AdminRoute] unenroll error:", err.message);
      res.status(500).json({ message: err.message });
    }
  },
);

module.exports = router;
