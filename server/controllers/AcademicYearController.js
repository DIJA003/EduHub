const AcademicYear = require('../models/AcademicYear');

async function getAllAcademicYears(req, res) {
  try {
    const academicYears = await AcademicYear.find()
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: academicYears,
      count: academicYears.length
    });

  } catch (error) {
    console.error("Error in getAllAcademicYears:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

async function getAcademicYearById(req, res) {
  try {
    const academicYear = await AcademicYear.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!academicYear) {
      return res.status(404).json({
        success: false,
        message: "Academic year not found!"
      });
    }

    res.status(200).json({
      success: true,
      data: academicYear
    });

  } catch (error) {
    console.error("Error in getAcademicYearById:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

async function createAcademicYear(req, res) {
  try {
    const { year, name } = req.body;

    const academicYear = new AcademicYear({
      year,
      name,
      createdBy: req.user.id
    });

    const savedAcademicYear = await academicYear.save();

    await savedAcademicYear.populate([
      { path: 'createdBy', select: 'name email' }
    ]);

    res.status(201).json({
      success: true,
      data: savedAcademicYear,
      message: `Academic year ${savedAcademicYear.year} created successfully`
    });

  } catch (error) {
    console.error("Error in createAcademicYear:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Academic year already exists"
      });
    }

    if (error.name === 'ValidationError') {

      const errors = Object.values(error.errors).map(err => ({
        field: err.path,
        message: err.message
      }));

      return res.status(400).json({
        success: false,
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
}

module.exports = {
  getAllAcademicYears,
  getAcademicYearById,
  createAcademicYear
};