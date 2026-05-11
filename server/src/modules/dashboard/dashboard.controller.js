const User = require("../users/user.model");
const Course = require("../courses/course.model");
const Material = require("../materials/material.model");
const Enrollment = require("../enrollments/enrollment.model");
const Request = require("../requests/request.model");
const Faculty = require("../faculties/faculty.model");
const Program = require("../programs/program.model");
const Log = require("../logs/log.model");
const { success } = require("../../shared/response");

const ACTIVE_FILTER = { isDeleted: { $ne: true } };

const getStats = async (req, res, next) => {
  try {
    const [
      totalStudents,
      totalMentors,
      totalAdmins,
      activeCourses,
      pendingMaterials,
      totalEnrollments,
      pendingRequests,
      totalFaculties,
      totalPrograms,
    ] = await Promise.all([
      User.countDocuments({ ...ACTIVE_FILTER, role: "student" }),
      User.countDocuments({ ...ACTIVE_FILTER, role: "mentor" }),
      User.countDocuments({ ...ACTIVE_FILTER, role: "admin" }),
      Course.countDocuments({ ...ACTIVE_FILTER, status: "Published" }),
      Material.countDocuments({ ...ACTIVE_FILTER, status: "pending" }),
      Enrollment.countDocuments({ status: "active" }),
      Request.countDocuments({ status: "pending", isDeleted: { $ne: true } }),
      Faculty.countDocuments({ isDeleted: { $ne: true } }),
      Program.countDocuments({ isDeleted: { $ne: true } }),
    ]);

    return success(res, {
      totalStudents,
      totalMentors,
      totalAdmins,
      activeCourses,
      pendingMaterials,
      pendingRequests,
      totalFaculties,
      totalPrograms,
      totalEnrollments,
    });
  } catch (err) {
    next(err);
  }
};

const getActivity = async (req, res, next) => {
  try {
    const logs = await Log.find({}).sort({ createdAt: -1 }).limit(10).lean();

    const activity = logs.map((l) => ({
      id: l._id,
      user: l.performedBy?.name || "System",
      role: l.performedBy?.role || "",
      action: `${l.action.toLowerCase()} ${l.entity.toLowerCase()}${
        l.entityName ? ` "${l.entityName}"` : ""
      }`,
      time: l.createdAt,
      success: l.success,
    }));

    return success(res, activity);
  } catch (err) {
    next(err);
  }
};

module.exports = { getStats, getActivity };
