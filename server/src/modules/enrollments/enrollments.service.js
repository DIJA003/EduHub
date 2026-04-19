const Enrollment = require("./enrollment.model");
const Course = require("../courses/course.model");

const syncStudentCount = async (courseId) => {
  const count = await Enrollment.countDocuments({
    course: courseId,
    status: "active",
  });
  await Course.findByIdAndUpdate(courseId, { students: count });
  return count;
};

const enrollStudent = async ({ studentId, courseId, enrolledBy }) => {
  const existing = await Enrollment.findOne({
    student: studentId,
    course: courseId,
  });

  if (existing) {
    if (existing.status === "active") {
      const err = new Error("Student is already enrolled in this course");
      err.status = 409;
      throw err;
    }
    existing.status = "active";
    existing.enrolledAt = new Date();
    existing.droppedAt = null;
    existing.droppedBy = null;
    await existing.save();
    await syncStudentCount(courseId);
    return { enrollment: existing, isNew: false };
  }

  const enrollment = await Enrollment.create({
    student: studentId,
    course: courseId,
    enrolledBy,
    status: "active",
  });

  await syncStudentCount(courseId);
  return { enrollment, isNew: true };
};

const dropStudent = async ({ studentId, courseId, droppedBy }) => {
  const enrollment = await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId, status: "active" },
    { status: "dropped", droppedAt: new Date(), droppedBy },
    { new: true },
  );

  if (!enrollment) {
    const err = new Error("Active enrollment not found");
    err.status = 404;
    throw err;
  }

  await syncStudentCount(courseId);
  return enrollment;
};

const getStudentEnrollments = async (studentId) => {
  return Enrollment.find({
    student: studentId,
    status: { $in: ["active", "completed"] },
  })
    .populate("course", "title code creditHours yearId instructor status")
    .sort({ enrolledAt: -1 })
    .lean();
};

const updateProgress = async ({
  studentId,
  courseId,
  progress,
  nextItem,
  sectionsCompleted,
}) => {
  const update = {};
  if (progress !== undefined) update.progress = progress;
  if (nextItem !== undefined) update.nextItem = nextItem;
  if (sectionsCompleted !== undefined)
    update.sectionsCompleted = sectionsCompleted;
  if (progress === 100) {
    update.status = "completed";
    update.completedAt = new Date();
  }

  const enrollment = await Enrollment.findOneAndUpdate(
    { student: studentId, course: courseId },
    update,
    { new: true },
  );

  if (!enrollment) {
    const err = new Error("Enrollment not found");
    err.status = 404;
    throw err;
  }

  return enrollment;
};

module.exports = {
  enrollStudent,
  dropStudent,
  getStudentEnrollments,
  updateProgress,
  syncStudentCount,
};
