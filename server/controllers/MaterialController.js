const mongoose = require("mongoose");
const Material = require("../models/Material");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

exports.getAll = async (req, res) => {
  try {
    const materials = await Material.find().sort({ createdAt: -1 });
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
    let fileUrl = "";
    let fileSize = "";
    let fileType = req.body.type || "File";

    if (req.file) {
      fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
      fileSize = `${(req.file.size / (1024 * 1024)).toFixed(2)} MB`;
      fileType = req.file.mimetype;
    }

    const isAdminRoute = req.baseUrl.includes("admin");

    const materialData = {
      ...req.body,
      fileUrl: fileUrl || req.body.fileUrl,
      size: fileSize,
      type: fileType,
      status: isAdminRoute ? "Active" : "Pending",
    };

    const material = await Material.create(materialData);
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
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//for both student and mentor material deletion (mentor can delete any material in their courses, student can delete only their own materials)
exports.remove = async (req, res) => {
  try {
    const material = await Material.findByIdAndDelete(req.params.id);
    if (!material)
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    res.json({ success: true, message: "Material deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.approveMaterial = async (req, res) => {
  try {
    // First, check if the material exists and is from a student
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

    // Update the material
    const updated = await Material.findByIdAndUpdate(
      req.params.id,
      {
        status: "Active", // Change from 'Draft' to 'Active'
      },
      { new: true, runValidators: true },
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//Mentor uploads material (auto-approved)

exports.uploadMaterial = async (req, res) => {
  try {
    const { courseRef, title, type, size, fileUrl } = req.body;

    if (!courseRef || !mongoose.Types.ObjectId.isValid(courseRef)) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing courseRef",
      });
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
      status: "Active", // Auto-approved for mentors
      fileUrl: fileUrl || "",
      courseRef: courseRef,
      uploadedByRef: req.user.id,
      uploaded: new Date().toISOString().split("T")[0],
    });

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//Reject student material (permanent delete)

exports.rejectMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    if (!material) {
      return res
        .status(404)
        .json({ success: false, message: "Material not found" });
    }

    // Check if mentor teaches this course
    // const course = await Course.findOne({
    //   _id: material.courseRef,
    //   instructorRef: req.user.id
    // });

    // if (!course && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You can only reject materials in your courses'
    //   });
    // }

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

    // Permanent delete
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
    await Material.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Material deleted permanently" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

//Assign student to course (using Enrollment model)
exports.assignStudentToCourse = async (req, res) => {
  try {
    const { courseId, studentId } = req.params;

    // Check if course exists and mentor teaches it
    // const course = await Course.findOne({
    //   _id: courseId,
    //   instructorRef: req.user.id
    // });

    // if (!course && req.user.role !== 'admin') {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'You can only assign students to your courses'
    //   });
    // }

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

    const student = await User.findOne({
      _id: studentId,
      role: "student",
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
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

//Get pending materials (student uploads needing review)
exports.getPendingMaterials = async (req, res) => {
  try {
    const myCourses = await Course.find({ instructorRef: req.user.id }).select(
      "_id",
    );
    const courseIds = myCourses.map((c) => c._id);

    const pendingMaterials = await Material.find({
      courseRef: { $in: courseIds },
      status: "Draft",
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
    // Get all courses this mentor teaches
    const myCourses = await Course.find({
      instructorRef: req.user.id,
    }).select("_id");

    const courseIds = myCourses.map((c) => c._id);

    // Find all materials in these courses
    const materials = await Material.find({
      courseRef: { $in: courseIds },
    })
      .populate("uploadedByRef", "name role")
      .populate("courseRef", "title code")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
//     const material = await Material.findByIdAndUpdate(
//       req.params.id,
//       { status: 'Active' },
//       { new: true }
//     );
//     if (!material) return res.status(404).json({ success: false, message: 'Material not found' });
//     res.json({ success: true, message: 'Material approved successfully', data: material });
//   } catch (err) {
//     res.status(400).json({ success: false, message: err.message });
//   }
// };
