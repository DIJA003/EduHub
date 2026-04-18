const express = require("express");
const router = express.Router();

const User = require("../models/User");
const Material = require("../models/Material");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const { logAction } = require("../utils/Logger");
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

// ── Register ──────────────────────────────────────────────────────────────────
router.post(
  "/register",
  verifyRegistration,
  registerRules,
  handleValidation,
  async (req, res) => {
    try {
      const { uid, email } = req.user;
      const nameFromBody = req.body?.name?.trim();
      const collegeFromBody = req.body?.college?.trim() || "—";
      const roleFromBody = ["student", "mentor"].includes(req.body?.role)
        ? req.body.role
        : "student";

      let user = await User.findOne({ firebaseUid: uid });
      if (user) return res.status(200).json(user);

      user = await User.create({
        firebaseUid: uid,
        email: email?.toLowerCase() || "",
        name: nameFromBody || email?.split("@")[0] || "User",
        role: roleFromBody,
        college: collegeFromBody,
      });

      await logAction({
        action: "REGISTER",
        entity: "User",
        entityId: user._id,
        entityName: user.name,
        performedBy: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        req,
        details: { role: user.role, college: user.college },
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

// ── Login ─────────────────────────────────────────────────────────────────────
router.get("/login", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select(
      "-__v",
    );
    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction({
      action: "LOGIN",
      entity: "Session",
      entityId: user._id,
      entityName: user.name,
      performedBy: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      req,
      details: { role: user.role },
    });

    res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

// ── Password changed notification ─────────────────────────────────────────────
router.post("/password-changed", verifyToken, async (req, res) => {
  try {
    await logAction({
      action: "PASSWORD_CHANGE",
      entity: "User",
      entityId: req.user.id,
      entityName: req.user.name,
      performedBy: req.user,
      req,
      details: { changedBy: req.user.name },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ── Profile update ────────────────────────────────────────────────────────────
router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, bio, phone, graduation, college } = req.body;
    const allowed = {};
    if (name?.trim()) allowed.name = name.trim();
    if (bio?.trim()) allowed.bio = bio.trim();
    if (phone?.trim()) allowed.phone = phone.trim();
    if (graduation?.trim()) allowed.graduation = graduation.trim();
    if (college?.trim()) allowed.college = college.trim();

    const user = await User.findByIdAndUpdate(req.user.id, allowed, {
      new: true,
    }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });

    await logAction({
      action: "UPDATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      req,
      details: { updated: Object.keys(allowed) },
    });

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

router.get("/enrollments", verifyToken, async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: { $in: ["active", "completed"] },
    })
      .populate(
        "course",
        "title code creditHours yearId instructor college status",
      )
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

router.post("/enrollments/:courseId", verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const existing = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
    });

    let enrollment;
    let isReEnroll = false;

    if (existing) {
      if (existing.status === "active") {
        return res.status(409).json({ message: "Already enrolled" });
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
        student: req.user.id,
        course: req.params.courseId,
        enrolledBy: req.user.id,
        status: "active",
      });
      await Course.findByIdAndUpdate(req.params.courseId, {
        $inc: { students: 1 },
      });
    }

    await logAction({
      action: "ENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${req.user.name} → ${course.title}`,
      performedBy: req.user,
      req,
      details: {
        courseId: course._id,
        courseTitle: course.title,
        courseCode: course.code,
        isReEnroll,
      },
    });

    res
      .status(isReEnroll ? 200 : 201)
      .json({ success: true, data: enrollment });
  } catch (error) {
    if (error.code === 11000)
      return res.status(409).json({ message: "Already enrolled" });
    console.error("Enroll error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/enrollments/:courseId", verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select(
      "title code",
    );

    const enrollment = await Enrollment.findOneAndUpdate(
      { student: req.user.id, course: req.params.courseId, status: "active" },
      {
        status: "dropped",
        droppedAt: new Date(),
        droppedBy: req.user.id,
      },
      { new: true },
    );
    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    await Course.findByIdAndUpdate(req.params.courseId, {
      $inc: { students: -1 },
    });

    await logAction({
      action: "UNENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${req.user.name} → ${course?.title || req.params.courseId}`,
      performedBy: req.user,
      req,
      details: {
        courseId: req.params.courseId,
        courseTitle: course?.title || "",
        courseCode: course?.code || "",
      },
    });

    res.status(200).json({ success: true, message: "Unenrolled" });
  } catch (error) {
    console.error("Unenroll error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch(
  "/enrollments/:courseId/progress",
  verifyToken,
  async (req, res) => {
    try {
      const { progress, nextItem, sectionsCompleted } = req.body;
      const update = {};
      if (progress !== undefined) update.progress = progress;
      if (nextItem !== undefined) update.nextItem = nextItem;
      if (sectionsCompleted !== undefined)
        update.sectionsCompleted = sectionsCompleted;
      if (progress === 100) update.status = "completed";

      const enrollment = await Enrollment.findOneAndUpdate(
        { student: req.user.id, course: req.params.courseId },
        update,
        { new: true },
      );
      if (!enrollment)
        return res.status(404).json({ message: "Enrollment not found" });

      if (progress === 100) {
        const course = await Course.findById(req.params.courseId).select(
          "title",
        );
        await logAction({
          action: "UPDATE",
          entity: "Enrollment",
          entityId: enrollment._id,
          entityName: `${req.user.name} completed ${course?.title || req.params.courseId}`,
          performedBy: req.user,
          req,
          details: {
            progress: 100,
            status: "completed",
            courseId: req.params.courseId,
          },
        });
      }

      res.status(200).json({ success: true, data: enrollment });
    } catch (error) {
      console.error("Progress update error:", error.message);
      res.status(500).json({ message: "Server error" });
    }
  },
);

// ── Student materials ─────────────────────────────────────────────────────────

router.get("/materials", verifyToken, async (req, res) => {
  try {
    const materials = await Material.find({ uploadedByRef: req.user.id }).sort({
      createdAt: -1,
    });
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    console.error("Get student materials error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/materials", verifyToken, async (req, res) => {
  try {
    const { title, course, type, courseId, yearId, sectionId, sectionLabel } =
      req.body;

    const material = await Material.create({
      title: title || "Untitled",
      course: course || "",
      type: type || "Other",
      status: "pending",
      uploaderRole: "student",
      uploader: req.user.name || req.user.email || "Student",
      uploadedByRef: req.user.id,
      courseId: courseId || "",
      yearId: yearId || "",
      sectionId: sectionId || "",
      sectionLabel: sectionLabel || "",
    });

    await logAction({
      action: "UPLOAD",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: {
        course,
        courseId,
        yearId,
        sectionId,
        sectionLabel,
        type: material.type,
        status: "pending",
      },
    });

    res.status(201).json({ success: true, data: material });
  } catch (error) {
    console.error("Student material upload error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/materials/:id", verifyToken, async (req, res) => {
  try {
    const material = await Material.findOne({
      _id: req.params.id,
      uploadedByRef: req.user.id,
    });
    if (!material)
      return res
        .status(404)
        .json({ message: "Material not found or not yours" });

    await Material.findByIdAndDelete(req.params.id);

    await logAction({
      action: "DELETE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: { deletedBy: req.user.name, course: material.course },
    });

    res.status(200).json({ success: true, message: "Deleted" });
  } catch (error) {
    console.error("Delete student material error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
