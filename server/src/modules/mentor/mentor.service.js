const Course = require("../courses/course.model");
const Enrollment = require("../enrollments/enrollment.model");
const Material = require("../materials/material.model");
const User = require("../users/user.model");

const mentorService = {
  async getMyCourses(mentorId) {
    return Course.find({
      instructorRef: mentorId,
      isDeleted: { $ne: true },
    })
      .select("title code creditHours status students")
      .sort({ title: 1 })
      .lean();
  },

  async getMyStudents(mentorId) {
    const courses = await Course.find({
      instructorRef: mentorId,
      isDeleted: { $ne: true },
    })
      .select("_id title")
      .lean();

    const courseIds = courses.map((c) => c._id);

    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: "active",
    })
      .populate("student", "name email college")
      .populate("course", "title code")
      .sort({ enrolledAt: -1 })
      .lean();

    return enrollments.map((e) => ({
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
  },

  async getDashboardStats(mentorId) {
    const courses = await Course.find({
      instructorRef: mentorId,
      isDeleted: { $ne: true },
    })
      .select("_id")
      .lean();

    const courseIds = courses.map((c) => c._id);
    const baseFilter = {
      courseRef: { $in: courseIds },
      isDeleted: { $ne: true },
    };

    const [pendingReviews, approved, rejected, students] = await Promise.all([
      Material.countDocuments({ ...baseFilter, status: "pending" }),
      Material.countDocuments({ ...baseFilter, status: "approved" }),
      Material.countDocuments({ ...baseFilter, status: "rejected" }),
      Enrollment.countDocuments({
        course: { $in: courseIds },
        status: "active",
      }),
    ]);

    return {
      pendingReviews,
      approved,
      rejected,
      students,
      courses: courses.length,
    };
  },

  async getEnrollableStudents() {
    return User.find({
      role: "student",
      isDeleted: { $ne: true },
      status: "Active",
    })
      .select("name email college")
      .sort({ name: 1 })
      .lean();
  },

  async verifyCourseOwnership(courseId, mentorId) {
    const course = await Course.findOne({
      _id: courseId,
      instructorRef: mentorId,
      isDeleted: { $ne: true },
    });
    return course;
  },
};

module.exports = mentorService;
