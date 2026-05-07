const User = require("../users/user.model");
const Course = require("../courses/course.model");
const Material = require("../materials/material.model");
const { success } = require("../../shared/response");

const ACTIVE = { isDeleted: { $ne: true } };

const getAdminStats = async (req, res, next) => {
  try {
    const [totalStudents, totalMentors, activeCourses, pendingApprovals] =
      await Promise.all([
        User.countDocuments({ ...ACTIVE, role: "student" }),
        User.countDocuments({ ...ACTIVE, role: "mentor" }),
        Course.countDocuments({ ...ACTIVE, status: "Published" }),
        Material.countDocuments({ ...ACTIVE, status: "pending" }),
      ]);

    return success(res, {
      totalStudents,
      totalMentors,
      activeCourses,
      pendingApprovals,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAdminStats };
