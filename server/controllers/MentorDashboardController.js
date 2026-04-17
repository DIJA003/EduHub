const Course = require("../models/Course");
const Material = require("../models/Material");
const Enrollment = require("../models/Enrollment");

exports.getMentorStats = async (req, res) => {
  try {
    const myCourses = await Course.find({ instructorRef: req.user.id }).select(
      "_id",
    );
    const courseIds = myCourses.map((c) => c._id);

    const [pending, approved, rejected, studentEnrollments] = await Promise.all(
      [
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "Draft",
          isDeleted: { $ne: true },
        }),
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "Active",
          isDeleted: { $ne: true },
        }),
        Material.countDocuments({
          courseRef: { $in: courseIds },
          status: "Rejected",
          isDeleted: { $ne: true },
        }),
        Enrollment.countDocuments({
          course: { $in: courseIds },
          status: "active",
        }),
      ],
    );

    res.json({
      success: true,
      data: {
        pendingReviews: pending,
        approved,
        rejected,
        students: studentEnrollments,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
exports.getMentorStudents = async (req, res) => {
  try {
    const myCourses = await Course.find({ instructorRef: req.user.id }).select(
      "_id title",
    );
    const courseIds = myCourses.map((c) => c._id);

    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
      status: "active",
    })
      .populate("student", "name email")
      .populate("course", "title");

    const students = enrollments.map((e) => ({
      _id: e.student._id,
      name: e.student.name,
      email: e.student.email,
      course: e.course.title,
      enrolledAt: e.enrolledAt?.toISOString().split("T")[0],
    }));

    res.json({ success: true, data: students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
