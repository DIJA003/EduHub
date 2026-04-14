const Course = require("../models/Course");

// GET ALL COURSES
exports.getAll = async (req, res) => {
  try {
    const courses = await Course.find().sort({ createdAt: -1 });

    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET COURSE BY ID (WITH APPROVED MATERIALS ONLY)
exports.getById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }
    const Material = require("../models/Material");
    const materials = await Material.find({
      courseRef: course._id,
      status: "Active",
    }).select("title type size uploader uploadedByRef createdAt");

    res.json({ success: true, data: { ...course.toObject(), materials } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// CREATE COURSE
exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };

    if (req.user?.id) payload.createdBy = req.user.id;

    const course = await Course.create(payload);

    res.status(201).json({
      success: true,
      data: course,
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    res.status(400).json({ success: false, message: err.message });
  }
};

// UPDATE COURSE
exports.update = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    res.json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    res.status(400).json({ success: false, message: err.message });
  }
};

// DELETE COURSE
exports.remove = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);

    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    res.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
