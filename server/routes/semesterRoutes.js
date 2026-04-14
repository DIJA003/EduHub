const express = require("express");
const {
  getAllSemesters,
  getSemesterById,
  getSemestersByYear,
  createSemester,
} = require("../controllers/semesterController.js");
const { verifyToken, adminOnly } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", verifyToken, getAllSemesters);
router.get("/by-year/:yearId", verifyToken, getSemestersByYear);
router.get("/:id", verifyToken, getSemesterById);

router.post("/", verifyToken, adminOnly, createSemester);

module.exports = router;
