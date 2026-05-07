const mentorService = require("./mentor.service");
const {
  enrollStudent,
  dropStudent,
} = require("../enrollments/enrollments.service");
const User = require("../users/user.model");
const { logAction } = require("../../shared/logger");
const {
  success,
  created,
  notFound,
  badRequest,
  forbidden,
} = require("../../shared/response");

const getMyCourses = async (req, res, next) => {
  try {
    const courses = await mentorService.getMyCourses(req.user.id);
    return success(res, courses);
  } catch (err) {
    next(err);
  }
};

const getStudents = async (req, res, next) => {
  try {
    const students = await mentorService.getMyStudents(req.user.id);
    return success(res, students);
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await mentorService.getDashboardStats(req.user.id);
    return success(res, stats);
  } catch (err) {
    next(err);
  }
};

const getEnrollableStudents = async (req, res, next) => {
  try {
    const students = await mentorService.getEnrollableStudents();
    return success(res, students);
  } catch (err) {
    next(err);
  }
};

const enrollStudentInCourse = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId)
      return badRequest(res, "studentId and courseId are required");

    const course = await mentorService.verifyCourseOwnership(
      courseId,
      req.user.id,
    );
    if (!course)
      return forbidden(res, "You can only enroll students in your own courses");

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
      },
    });

    return isNew ? created(res, enrollment) : success(res, enrollment);
  } catch (err) {
    next(err);
  }
};

const unenrollStudentFromCourse = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;

    const course = await mentorService.verifyCourseOwnership(
      courseId,
      req.user.id,
    );
    if (!course)
      return forbidden(
        res,
        "You can only manage enrollments in your own courses",
      );

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
    });

    return success(res, { dropped: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyCourses,
  getStudents,
  getDashboardStats,
  getEnrollableStudents,
  enrollStudentInCourse,
  unenrollStudentFromCourse,
};
