const express  = require("express");
const router   = express.Router();
const Course   = require("../models/Course");
const Material = require("../models/Material");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/courses/year/:yearId
// Returns all Published courses for a given year (1–4)
router.get("/year/:yearId", verifyToken, async (req, res) => {
  try {
    const courses = await Course.find({
      yearId: String(req.params.yearId),
      status: "Published",
    })
      .select("title code creditHours yearId instructor college status createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: courses });
  } catch (err) {
    console.error("Get courses by year error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/courses/:courseId
router.get("/:courseId", verifyToken, async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, data: course });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/courses/:courseId/materials
// Returns approved materials for a course — used as "sections" in CoursePlayer
router.get("/:courseId/materials", verifyToken, async (req, res) => {
  try {
    const materials = await Material.find({
      $or: [
        { courseRef: req.params.courseId },
        { courseId:  req.params.courseId },
      ],
      status: { $in: ["Active", "approved", "Approved"] },
    })
      .select("title type size uploader sectionId sectionLabel fileUrl mentorFeedback createdAt")
      .sort({ createdAt: 1 });

    res.status(200).json({ success: true, data: materials });
  } catch (err) {
    console.error("Get course materials error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;