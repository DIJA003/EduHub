// routes/semesterRoutes.js
const express = require('express');
const { 
  getAllSemesters,
  getSemesterById,
  getSemestersByYear,
  createSemester
} = require('../controllers/semesterController.js');

const router = express.Router();

// GET all semesters
router.get('/', getAllSemesters);

// GET semesters by year - MUST come before /:id route
router.get('/by-year/:yearId', getSemestersByYear);

// GET single semester
router.get('/:id', getSemesterById);

// POST create semester
router.post('/', createSemester);

module.exports = router;