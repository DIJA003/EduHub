const Material = require("../models/Material");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const { createNotification } = require("./notificationController");

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
      })
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
      return res
        .status(403)
        .json({ success: false, message: "You are not enrolled in this course" });

    const course = await Course.findById(req.params.courseId).populate(
      "instructorRef",
      "name email"
    );

    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const materials = await Material.find({
      courseRef: req.params.courseId,
      status: "Active",
    })
      .populate("uploadedByRef", "name role")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: { course, materials } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.uploadMaterial = async (req, res) => {
  try {
    const { courseRef, title, type, size, fileUrl } = req.body;

    const enrollment = await Enrollment.findOne({
      student: req.user.id,
      course: courseRef,
      status: "active",
    });

    if (!enrollment)
      return res
        .status(403)
        .json({ success: false, message: "You are not enrolled in this course" });

    const course = await Course.findById(courseRef);
    if (!course)
      return res
        .status(404)
        .json({ success: false, message: "Course not found" });

    const material = await Material.create({
      title: title || "Untitled",
      course: course.title,
      type: type || "Other",
      size: size || "",
      uploader: req.user.name || req.user.email || "Student",
      status: "Draft",
      fileUrl: fileUrl || "",
      courseRef: courseRef,
      uploadedByRef: req.user.id,
      uploaded: new Date().toISOString().split("T")[0],
    });

    if (course.instructorRef) {
      await createNotification({
        recipient: course.instructorRef,
        sender: req.user.id,
        type: "material_submitted",
        message: `${req.user.name || "A student"} submitted "${material.title}" for review in ${course.title}.`,
        materialRef: material._id,
        courseRef: course._id,
      });
    }

    res.status(201).json({ success: true, data: material });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};