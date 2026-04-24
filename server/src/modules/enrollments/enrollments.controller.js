const {
  enrollStudent,
  dropStudent,
  getStudentEnrollments,
  updateProgress,
} = require("./enrollments.service"); // was: ./enrollment.service

const Enrollment = require("./enrollment.model");
const User = require("../users/user.model");
const Course = require("../courses/course.model");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const { success, created, notFound } = require("../../shared/response");

const getMyEnrollments = async (req, res, next) => {
  try {
    const enrollments = await getStudentEnrollments(req.user.id);
    const data = enrollments.map((e) => ({
      enrollmentId: e._id,
      courseId: e.course?._id,
      id: e.course?._id,
      name: e.course?.title || "Unknown",
      code: e.course?.code || "",
      credits: e.course?.creditHours || 3,
      yearId: e.course?.yearId || 2,
      status: e.status,
      progress: e.progress || 0,
      sectionsCompleted: e.sectionsCompleted || 0,
      nextItem: e.nextItem || "Getting Started",
      enrolledAt: e.enrolledAt,
    }));
    return success(res, data);
  } catch (err) {
    next(err);
  }
};

const enroll = async (req, res, next) => {
  try {
    const { enrollment, isNew } = await enrollStudent({
      studentId: req.user.id,
      courseId: req.params.courseId,
      enrolledBy: req.user.id,
    });
    const course = await Course.findById(req.params.courseId)
      .select("title code")
      .lean();
    await logAction({
      action: "ENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${req.user.name} → ${course?.title || req.params.courseId}`,
      performedBy: req.user,
      req,
      details: {
        courseTitle: course?.title,
        courseCode: course?.code,
        isReEnroll: !isNew,
      },
    });
    return isNew ? created(res, enrollment) : success(res, enrollment);
  } catch (err) {
    next(err);
  }
};

const unenroll = async (req, res, next) => {
  try {
    const enrollment = await dropStudent({
      studentId: req.user.id,
      courseId: req.params.courseId,
      droppedBy: req.user.id,
    });
    await logAction({
      action: "UNENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: req.user.name,
      performedBy: req.user,
      req,
    });
    return success(res, { dropped: true });
  } catch (err) {
    next(err);
  }
};

const updateCourseProgress = async (req, res, next) => {
  try {
    const enrollment = await updateProgress({
      studentId: req.user.id,
      courseId: req.params.courseId,
      ...req.body,
    });
    return success(res, enrollment);
  } catch (err) {
    next(err);
  }
};

const getAllEnrollments = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = "" } = req.query;
    const filter = { status: "active" };
    const result = await paginate(Enrollment, filter, {
      page,
      limit,
      sort: { enrolledAt: -1 },
      populate: [
        { path: "student", select: "name email" },
        { path: "course", select: "title code instructor" },
      ],
    });
    let data = result.data;
    if (search.trim()) {
      const s = search.trim().toLowerCase();
      data = data.filter(
        (e) =>
          e.student?.name?.toLowerCase().includes(s) ||
          e.course?.title?.toLowerCase().includes(s) ||
          e.student?.email?.toLowerCase().includes(s),
      );
    }
    return success(res, data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const adminEnroll = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.body;
    const [student, course] = await Promise.all([
      User.findById(studentId).select("name email").lean(),
      Course.findById(courseId).select("title code").lean(),
    ]);
    if (!student) return notFound(res, "Student not found");
    if (!course) return notFound(res, "Course not found");

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

const adminUnenroll = async (req, res, next) => {
  try {
    const { studentId, courseId } = req.params;
    const enrollment = await dropStudent({
      studentId,
      courseId,
      droppedBy: req.user.id,
    });
    await logAction({
      action: "UNENROLL",
      entity: "Enrollment",
      entityId: enrollment._id,
      entityName: `${studentId} → ${courseId}`,
      performedBy: req.user,
      req,
    });
    return success(res, { dropped: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyEnrollments,
  enroll,
  unenroll,
  updateCourseProgress,
  getAllEnrollments,
  adminEnroll,
  adminUnenroll,
};
