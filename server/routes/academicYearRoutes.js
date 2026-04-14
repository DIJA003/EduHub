const express = require("express");
const {
  getAllAcademicYears,
  getAcademicYearById,
  createAcademicYear,
} = require("../controllers/AcademicYearController");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getAllAcademicYears);
router.get("/:id", verifyToken, getAcademicYearById);

router.post("/", verifyToken, adminOnly, createAcademicYear);

module.exports = router;
