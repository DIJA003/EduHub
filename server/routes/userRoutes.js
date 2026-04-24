const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Material = require("../models/Material");
const Enrollment = require("../models/Enrollment");
const Section    = require("../models/Section");
const Course = require("../models/Course");
const {
  saveCourse,
  unsaveCourse,
  getSavedCourses,
} = require("../controllers/userController");
const {
  verifyToken,
  verifyRegistration,
} = require("../middleware/authMiddleware");
const { registerRules, handleValidation } = require("../middleware/validate");

// ── Auth ─────────────────────────────────────────────────────────────────────
router.post(
  "/register",
  verifyRegistration,
  registerRules,
  handleValidation,
  async (req, res) => {
    try {
      const { uid, email } = req.user;
      const nameFromBody = req.body?.name?.trim();
      let user = await User.findOne({ firebaseUid: uid });
      if (user) return res.status(200).json(user);
      user = await User.create({
        firebaseUid: uid,
        email: email?.toLowerCase() || "",
        name: nameFromBody || email?.split("@")[0] || "User",
      });
      res.status(201).json(user);
    } catch (error) {
      if (error.code === 11000)
        return res.status(409).json({ message: "Email already registered." });
      console.error("Register error:", error.message);
      res.status(500).json({ message: "Server error during registration." });
    }
  },
);

router.get("/login", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Profile update ────────────────────────────────────────────────────────────
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, phone, graduation, college } = req.body;
    const update = {};
    if (name)       update.name       = name.trim();
    if (phone)      update.phone      = phone.trim();
    if (graduation) update.graduation = graduation.trim();
    if (college)    update.college    = college.trim();

    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Profile update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Saved courses ─────────────────────────────────────────────────────────────
router.get("/dashboard/courses", verifyToken, getSavedCourses);
router.post("/courses/:courseId/save", verifyToken, saveCourse);
router.delete("/courses/:courseId/unsave", verifyToken, unsaveCourse);

// ── Student enrollments ───────────────────────────────────────────────────────
// GET my enrollments → returns list shaped for CourseContext
router.get("/enrollments", verifyToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: { $in: ["active", "completed"] },
    })
      .populate("course", "title code creditHours yearId instructor college status")
      .sort({ createdAt: -1 });

    const data = enrollments.map((e) => ({
      enrollmentId: e._id,
      courseId: e.course?._id,
      id: e.course?.code?.toLowerCase().replace(/\s/g, "-") || e.course?._id,
      name: e.course?.title || "Unknown",
      code: e.course?.code || "",
      credits: e.course?.creditHours || 3,
      yearId: e.course?.yearId || "2",
      status: e.status,
      progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || "Getting Started",
    }));

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get enrollments error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST enroll in a course
router.post("/enrollments/:courseId", verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });
    if (existing) {
      if (existing.status === "dropped") {
        existing.status = "active";
        await existing.save();
        return res.status(200).json({ success: true, data: existing });
      }
      return res.status(409).json({ message: "Already enrolled" });
    }

    const enrollment = await Enrollment.create({
      student: req.user.id,
      course: req.params.courseId,
      enrolledBy: req.user.id,
      status: "active",
    });

    // Increment course student count
    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { students: 1 } });

    res.status(201).json({ success: true, data: enrollment });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Already enrolled" });
    console.error("Enroll error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE unenroll
router.delete("/enrollments/:courseId", verifyToken, async (req, res) => {
  try {
    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: req.params.courseId },
      { status: "dropped" },
      { new: true },
    );
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    await Course.findByIdAndUpdate(req.params.courseId, { $inc: { students: -1 } });
    res.status(200).json({ success: true, message: "Unenrolled" });
  } catch (error) {
    console.error("Unenroll error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH update course progress
router.patch("/enrollments/:courseId/progress", verifyToken, async (req, res) => {
  try {
    const { progress, nextItem, sectionsCompleted } = req.body;
    const update = {};
    if (progress !== undefined)          update.progress          = progress;
    if (nextItem !== undefined)          update.nextItem          = nextItem;
    if (sectionsCompleted !== undefined) update.sectionsCompleted = sectionsCompleted;
    if (progress === 100)                update.status            = "completed";

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: req.params.courseId },
      update,
      { new: true },
    );
    if (!enrollment) return res.status(404).json({ message: "Enrollment not found" });
    res.status(200).json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Progress update error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Sections for a course ─────────────────────────────────────────────────────
router.get("/courses/:courseId/sections", verifyToken, async (req, res) => {
  try {
    const sections = await Section.find({
      courseRef: req.params.courseId,
      isDeleted: { $ne: true },
    }).sort({ order: 1, createdAt: 1 }).select("title summary body order");
    res.json({ success: true, data: sections });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Student materials ─────────────────────────────────────────────────────────
// GET my uploaded materials
router.get("/materials", verifyToken, async (req, res) => {
  try {
    const materials = await Material.find({ uploadedByRef: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error("Get student materials error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// POST student uploads material (goes to pending review)
router.post("/materials", verifyToken, async (req, res) => {
  try {
    const { title, course, type, courseId, yearId, sectionId, sectionLabel } = req.body;

    const material = await Material.create({
      title:          title || "Untitled",
      course:         course || "",
      type:           type  || "Other",
      status:         "pending",            // always pending for students
      uploaderRole:   "student",
      uploader:       req.user.name || req.user.email || "Student",
      uploadedByRef:  req.user.id,
      courseId:       courseId  || "",
      yearId:         yearId    || "",
      sectionId:      sectionId || "",
      sectionLabel:   sectionLabel || "",
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error("Student material upload error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE student removes own material
router.delete("/materials/:id", verifyToken, async (req, res) => {
  try {
    const material = await Material.findOne({
      _id:           req.params.id,
      uploadedByRef: req.user.id,
    });
    if (!material) return res.status(404).json({ message: "Material not found or not yours" });
    await Material.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Delete student material error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;