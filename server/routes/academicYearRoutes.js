const express = require("express");
const {
  getAllAcademicYears,
  getAcademicYearById,
  createAcademicYear,
} = require("../controllers/AcademicYearController");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/colleges", verifyToken, async (req, res) => {
  try {
    const College = require("../models/College");
    const colleges = await College.find({
      isDeleted: { $ne: true },
      status: "Active",
    }).select("name years semesters programs");
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/by-college/:collegeId", verifyToken, async (req, res) => {
  try {
    const AcademicYear = require("../models/AcademicYear");
    const Course = require("../models/Course");

    const years = await AcademicYear.find({
      collegeRef: req.params.collegeId,
    }).sort({ year: 1 });

    const result = await Promise.all(
      years.map(async (yr) => {
        const courses = await Course.find({
          academicYearRef: yr._id,
          isDeleted: { $ne: true },
        }).select("code title instructor status students creditHours");
        return { ...yr.toObject(), courses };
      }),
    );

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get("/", verifyToken, getAllAcademicYears);
router.get("/:id", verifyToken, getAcademicYearById);

router.post("/", verifyToken, adminOnly, createAcademicYear);

module.exports = router;
