const Course = require("../models/Course");
const { logAction } = require("../utils/Logger");

// GET ALL COURSES
exports.getAll = async (req, res) => {
  try {
    const showDeleted = req.query.showDeleted === "true";
    // $ne:true catches both false and undefined (pre-migration records)
    const filter = showDeleted ? {} : { isDeleted: { $ne: true } };
    const courses = await Course.find(filter).sort({ createdAt: -1 });
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
      isDeleted: { $ne: true },
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

    await logAction({
      action: "CREATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
      details: {
        code: course.code,
        title: course.title,
        status: course.status,
      },
    });

    res.status(201).json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Course code already exists" });
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
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await logAction({
      action: "UPDATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
      details: req.body,
    });

    res.json({ success: true, data: course });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(400)
        .json({ success: false, message: "Course code already exists" });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

// SOFT DELETE — data is preserved, never removed from DB
exports.remove = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?.id || null,
      },
      { new: true },
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await logAction({
      action: "DELETE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
    });

    res.json({ success: true, message: "Course deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// RESTORE A SOFT-DELETED COURSE
exports.restore = async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!course) {
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });
    }

    await logAction({
      action: "RESTORE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
    });

    res.json({
      success: true,
      message: "Course restored successfully",
      data: course,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
