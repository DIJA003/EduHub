const express = require("express");
const router  = express.Router();
const Section = require("../models/Section");
const { verifyToken } = require("../middleware/authMiddleware");

// GET /api/sections/course/:courseId
// Returns all non-deleted sections for a course, ordered by `order`
router.get("/course/:courseId", verifyToken, async (req, res) => {
  try {
    const sections = await Section.find({
      courseRef: req.params.courseId,
      isDeleted: { $ne: true },
    })
      .select("title summary body order courseRef createdAt")
      .sort({ order: 1, createdAt: 1 });

    res.json({ success: true, data: sections });
  } catch (err) {
    console.error("Get sections error:", err.message);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// GET /api/sections/:sectionId
router.get("/:sectionId", verifyToken, async (req, res) => {
  try {
    const section = await Section.findOne({
      _id: req.params.sectionId,
      isDeleted: { $ne: true },
    });
    if (!section)
      return res.status(404).json({ success: false, message: "Section not found" });
    res.json({ success: true, data: section });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;