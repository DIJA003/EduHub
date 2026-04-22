const express = require("express");
const router = express.Router();
const { verifyToken } = require("../../middleware/auth.middleware");
const { mentorOrAdmin } = require("../../middleware/role.middleware");
const Course = require("../courses/course.model");
const Enrollment = require("../enrollments/enrollment.model");
const User = require("../users/user.model");
const Material = require("../materials/material.model");
const {
  enrollStudent,
  dropStudent,
} = require("../enrollments/enrollments.service");
const { logAction } = require("../../shared/logger");
const { success, notFound, badRequest } = require("../../shared/response");

router.use(verifyToken, mentorOrAdmin);

router.get("/my-courses", async (req, res, next) => {
  try {
    const courses = await Course.find({
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    })
      .select("title code creditHours status students")
      .sort({ title: 1 })
      .lean();

    return success(res, courses);
  } catch (err) {
    next(err);
  }
});
router.get("/enrollable-students", async (req, res, next) => {
  try {
    const students = await User.find({
      role: "student",
      isDeleted: { $ne: true },
      status: "Active",
    })
      .select("name email college")
      .sort({ name: 1 })
      .lean();

    return success(res, students);
  } catch (err) {
    next(err);
  }
});

router.get("/students", async (req, res, next) => {
  try {
    const myCourses = await Course.find({
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    })
      .select("_id title")
      .lean();

    const courseIds = myCourses.map((c) => c._id);

    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: "active",
    })
      .populate("student", "name email college")
      .populate("course", "title code")
      .sort({ enrolledAt: -1 })
      .lean();

    const data = enrollments.map((e) => ({
      _id: e.student?._id,
      name: e.student?.name || "Unknown",
      email: e.student?.email || "",
      college: e.student?.college || "",
      course: e.course?.title || "",
      courseCode: e.course?.code || "",
      enrolledAt: e.enrolledAt
        ? new Date(e.enrolledAt).toISOString().split("T")[0]
        : "",
      progress: e.progress || 0,
    }));

    return success(res, data);
  } catch (err) {
    next(err);
  }
});

router.get("/dashboard/stats", async (req, res, next) => {
  try {
    const myCourses = await Course.find({
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();

    const courseIds = myCourses.map((c) => c._id);

    const [pendingReviews, approvedCount, rejectedCount, studentCount] =
      await Promise.all([
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "pending",
          isDeleted: { $ne: true },
        }),
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "approved",
          isDeleted: { $ne: true },
        }),
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "rejected",
          isDeleted: { $ne: true },
        }),
        Enrollment.countDocuments({
          course: { $in: courseIds },
          status: "active",
        }),
      ]);

    return success(res, {
      pendingReviews,
      approved: approvedCount,
      rejected: rejectedCount,
      students: studentCount,
      courses: myCourses.length,
    });
  } catch (err) {
    next(err);
  }
});

router.post("/enrollments", async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return badRequest(res, "studentId and courseId are required");

    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    });
    if (!course)
      return res.status(403).json({
        success: false,
        message: "You can only enroll students in your own courses",
      });

    const student = await User.findById(studentId).select("name email").lean();
    if (!student) return notFound(res, "Student not found");

    const { enrollment, isNew } = await enrollStudent({
      studentId,
      courseId,
      enrolledBy: req.user.id,
    });

    await logAction({
      action: "ENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${student.name} → ${course.title}`,
      performedBy: req.user,
      req,
      details: {
        studentName: student.name,
        courseTitle: course.title,
        isReEnroll: !isNew,
        enrolledBy: req.user.name,
      },
    });

    return res
      .status(isNew ? 201 : 200)
      .json({ success: true, data: enrollment });
  } catch (err) {
    next(err);
  }
});

router.delete("/enrollments/:studentId/:courseId", async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;

    const course = await Course.findOne({
      _id: courseId,
      instructorRef: req.user.id,
      isDeleted: { $ne: true },
    });
    if (!course)
      return res.status(403).json({
        success: false,
        message: "You can only manage enrollments in your own courses",
      });

    const enrollment = await dropStudent({
      studentId,
      courseId,
      droppedBy: req.user.id,
    });

    const student = await User.findById(studentId).select("name").lean();

    await logAction({
      action: "UNENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${student?.name || studentId} → ${course.title}`,
      performedBy: req.user,
      req,
      details: {
        studentName: student?.name || "Unknown",
        courseTitle: course.title,
        removedBy: req.user.name,
      },
    });

    return success(res, { dropped: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
