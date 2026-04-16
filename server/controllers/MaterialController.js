const mongoose = require("mongoose");
const Material = require("../models/Material");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");
const { logAction } = require("../utils/Logger");

exports.getAll = async (req, res) => {
  try {
    const showDeleted = req.query.showDeleted === "true";
    const filter = showDeleted ? {} : { isDeleted: { $ne: true } };
    const materials = await Material.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material)
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const materialData = {
      ...req.body,
      uploaded: new Date().toISOString().split("T")[0],
      status: "Active",
      uploadedByRef: req.user.id,
    };
    const material = await Material.create(materialData);

    await logAction({
      action: "CREATE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      details: { course: material.course, type: material.type },
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!material)
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });

    await logAction({
      action: "UPDATE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      details: req.body,
    });

    res.json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?.id || null,
      },
      { new: true },
    );
    if (!material)
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });

    await logAction({
      action: "DELETE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
    });

    res.json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restore = async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!material)
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });

    await logAction({
      action: "RESTORE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
    });

    res.json({
      success: true,
      message: "Material restored successfully",
      data: material,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    let course;
    if (req.user.role === "admin") {
      course = await Course.findById(material.courseRef);
    } else {
      course = await Course.findOne({
        _id: material.courseRef,
        instructorRef: req.user.id,
      });
    }

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === "admin"
            ? "Course not found"
            : "You can only manage materials in your courses",
      });
    }

    const updated = await Material.findByIdAndUpdate(
      req.params.id,
      { status: "Active" },
      { new: true, runValidators: true },
    );

    await logAction({
      action: "UPDATE",
      entity: "Material",
      entityId: updated._id,
      entityName: updated.title,
      performedBy: req.user,
      details: { status: "Active", action: "approved" },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { courseRef, title, type, size, fileUrl } = req.body;

    if (!courseRef || !mongoose.Types.ObjectId.isValid(courseRef)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or missing courseRef" });
    }

    let course;
    if (req.user.role === "admin") {
      course = await Course.findById(courseRef);
    } else {
      course = await Course.findOne({
        _id: courseRef,
        instructorRef: req.user.id,
      });
    }

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === "admin"
            ? "Course not found"
            : "You can only upload to courses you teach",
      });
    }

    const material = await Material.create({
      title: title || "Untitled",
      course: course?.title || "",
      type: type || "Other",
      size: size || "",
      uploader: req.user.name || req.user.email || "Mentor",
      status: "Active",
      fileUrl: fileUrl || "",
      courseRef,
      uploadedByRef: req.user.id,
      uploaded: new Date().toISOString().split("T")[0],
    });

    await logAction({
      action: "CREATE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      details: { course: material.course, type: material.type },
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.rejectMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    let course;
    if (req.user.role === "admin") {
      course = await Course.findById(material.courseRef);
    } else {
      course = await Course.findOne({
        _id: material.courseRef,
        instructorRef: req.user.id,
      });
    }

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === "admin"
            ? "Course not found"
            : "You can only manage materials in your courses",
      });
    }

    await Material.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Material rejected and deleted permanently",
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    let course;
    if (req.user.role === "admin") {
      course = await Course.findById(material.courseRef);
    } else {
      course = await Course.findOne({
        _id: material.courseRef,
        instructorRef: req.user.id,
      });
    }

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === "admin"
            ? "Course not found"
            : "You can only manage materials in your courses",
      });
    }

    await Material.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: req.user?.id || null,
    });

    await logAction({
      action: "DELETE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
    });

    res.json({ success: true, message: "Material deleted permanently" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.assignStudentToCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    let course;
    if (req.user.role === "admin") {
      course = await Course.findById(courseId);
    } else {
      course = await Course.findOne({
        _id: courseId,
        instructorRef: req.user.id,
      });
    }

    if (!course) {
      return res.status(403).json({
        success: false,
        message:
          req.user.role === "admin"
            ? "Course not found"
            : "You can only assign students to your courses",
      });
    }

    const student = await User.findOne({ _id: studentId, role: "student" });
    if (!student) {
      return res
        .status(404)
        .json({ success: false, message: "Student not found" });
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId,
      enrolledBy: req.user.id,
      status: "active",
    });

    const activeCount = await Enrollment.countDocuments({
      course: courseId,
      status: "active",
    });
    await Course.findByIdAndUpdate(courseId, { students: activeCount });

    res.status(201).json({ success: true, data: enrollment });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Student is already enrolled in this course",
      });
    }
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.getPendingMaterials = async (req, res) => {
  try {
    const myCourses = await Course.find({ instructorRef: req.user.id }).select(
      "_id",
    );
    const courseIds = myCourses.map((c) => c._id);

    const pendingMaterials = await Material.find({
      courseRef: { $in: courseIds },
      status: "Draft",
      isDeleted: { $ne: true },
      uploadedByRef: { $ne: req.user.id },
    })
      .populate("uploadedByRef", "name email")
      .populate("courseRef", "title code")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: pendingMaterials });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getMyCourseMaterials = async (req, res) => {
  try {
    const myCourses = await Course.find({ instructorRef: req.user.id }).select(
      "_id",
    );
    const courseIds = myCourses.map((c) => c._id);

    const materials = await Material.find({
      courseRef: { $in: courseIds },
      isDeleted: { $ne: true },
    })
      .populate("uploadedByRef", "name role")
      .populate("courseRef", "title code")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
