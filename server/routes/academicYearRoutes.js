// routes/academicYearRoutes.js

const express = require('express');

const {
  getAllAcademicYears,
  getAcademicYearById,
  createAcademicYear
} = require('../controllers/AcademicYearController');

const router = express.Router();

// GET all academic years
router.get('/', getAllAcademicYears);

// GET single academic year
router.get('/:id', getAcademicYearById);

// POST create academic year
router.post('/', createAcademicYear);

module.exports = router;