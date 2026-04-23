const Material = require("../models/Material");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { createNotification } = require("./notificationController");
const User = require("../models/User");

exports.getMyCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user.id,
      status: "active",
    }).populate({
      path: "course",
      select: "title code instructor creditHours status",
    });

    const courses = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;
        const materialCount = await Material.countDocuments({
          courseRef: course._id,
          status: "Active",
        });
        return {
          ...course.toObject(),
          activeMaterialCount: materialCount,
          enrolledAt: enrollment.enrolledAt,
        };
      }),
    );

    res.json({ success: true, data: courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getCourseDetails = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: req.params.courseId,
      status: "active",
    });

    if (!enrollment)
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });

    const course = await Course.findById(req.params.courseId).populate(
      "instructorRef",
      "name email"
    );

    if (!course)
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });

    const materials = await Material.find({
      courseRef: course._id,
      status: "Active",
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        ...course.toObject(),
        materials,
        enrolledAt: enrollment.enrolledAt,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { title, type, fileUrl, courseId, sectionId, sectionLabel } = req.body;

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseId,
      status: "active",
    });

    if (!enrollment)
      return res.status(403).json({
        success: false,
        message: "You are not enrolled in this course",
      });

    const material = await Material.create({
      title,
      type,
      fileUrl,
      courseRef: courseId,
      sectionId,
      sectionLabel,
      uploadedByRef: req.user.id,
      status: "Draft", // Student uploads need approval
      uploaded: new Date().toISOString().split("T")[0],
    });

    // Notify course instructor about pending material
    const course = await Course.findById(courseId).populate("instructorRef");
    if (course && course.instructorRef) {
      await createNotification(course.instructorRef._id, {
        title: "New Material Pending Approval",
        message: `Student ${req.user.name} uploaded "${title}" for ${course.title}`,
        type: "material_approval",
        relatedId: material._id,
      });
    }

    res.status(201).json({
      success: true,
      data: material,
      message: "Material uploaded successfully and pending approval",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
