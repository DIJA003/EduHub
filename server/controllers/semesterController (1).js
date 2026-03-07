
const Semester = require('../models/Semester');
const AcademicYear = require('../models/AcademicYear');

async function getAllSemesters(req, res) {
  try {
    const semesters = await Semester.find()
      .populate('academicYearId', 'year name')
      .populate('createdBy', 'name email');
    
    res.status(200).json({
      success: true,
      data: semesters,
      count: semesters.length
    });
  } catch (error) {
    console.error("Error in getAllSemesters:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

async function getSemesterById(req, res) {
  try {
    const semester = await Semester.findById(req.params.id)
      .populate('academicYearId', 'year name')
      .populate('createdBy', 'name email');
      
    if (!semester) {
      return res.status(404).json({ 
        success: false,
        message: "Semester not found!" 
      });
    }
    
    res.status(200).json({
      success: true,
      data: semester
    });
  } catch (error) {
    console.error("Error in getSemesterById:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

async function getSemestersByYear(req, res) {
  try {
    const { yearId } = req.params;
    
    const academicYear = await AcademicYear.findById(yearId);
    const semesters = await Semester.find({ academicYearId: yearId })
      .populate('academicYearId', 'year name')
      .populate('createdBy', 'name email');
    
    // Sort in Fall, Spring, Summer order
    const semesterOrder = { 'Fall': 1, 'Spring': 2, 'Summer': 3 };
    const sortedSemesters = semesters.sort((a, b) => 
      semesterOrder[a.name] - semesterOrder[b.name]
    );
    
    const response = {
      success: true,
      data: sortedSemesters,
      count: sortedSemesters.length
    };
    
    if (academicYear) {
      response.academicYear = {
        id: academicYear._id,
        year: academicYear.year,
        name: academicYear.name
      };
    }
    
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getSemestersByYear:", error);
    res.status(500).json({ 
      success: false,
      message: "Internal server error" 
    });
  }
}

async function createSemester(req, res) {
  try {
    const { name, academicYearId } = req.body;

    const semester = new Semester({
      name,
      academicYearId,
      createdBy: req.user.id
    });

    const savedSemester = await semester.save();
    
    await savedSemester.populate([
      { path: 'academicYearId', select: 'year name' },
      { path: 'createdBy', select: 'name email' }
    ]);
    
    res.status(201).json({
      success: true,
      data: savedSemester,
      message: `Semester ${savedSemester.name} created successfully`
    });
  } catch (error) {
    console.error("Error in createSemester:", error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false,
        message: "Semester with this name already exists in this academic year" 
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
  getAllSemesters,
  getSemesterById,
  getSemestersByYear,
  createSemester
};