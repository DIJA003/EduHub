// server/src/modules/admin/dashboard.controller.js
// This needs to be added to app.js as well

const express = require("express");
const router = express.Router();
const User = require("../users/user.model");
const Course = require("../courses/course.model");
const Material = require("../materials/material.model");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const { success } = require("../../shared/response");

router.get(
  "/dashboard/stats",
  verifyToken,
  adminOnly,
  async (req, res, next) => {
    try {
      const ACTIVE = { isDeleted: { $ne: true } };
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
  },
);

module.exports = router;
