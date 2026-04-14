const express = require("express");
const router = express.Router();

const { verifyToken, adminOnly } = require("../middleware/authMiddleware");
const {
  collegeRules,
  courseRules,
  materialRules,
  handleValidation,
} = require("../middleware/validate");

const college = require("../controllers/CollegeController");
const course = require("../controllers/CourseController");
const material = require("../controllers/MaterialController");
const adminUser = require("../controllers/adminController");
const dashboard = require("../controllers/DashboardController");

const authAdmin = [verifyToken, adminOnly];

// Dashboard
router.get("/dashboard/stats", ...authAdmin, dashboard.getStats);
router.get("/dashboard/activity", ...authAdmin, dashboard.getActivity);

// Colleges
router.get("/colleges", ...authAdmin, college.getAll);
router.get("/colleges/:id", ...authAdmin, college.getById);
router.post(
  "/colleges",
  ...authAdmin,
  collegeRules,
  handleValidation,
  college.create,
);
router.put(
  "/colleges/:id",
  ...authAdmin,
  collegeRules,
  handleValidation,
  college.update,
);
router.delete("/colleges/:id", ...authAdmin, college.remove);

// Courses
router.get("/courses", ...authAdmin, course.getAll);
router.get("/courses/:id", ...authAdmin, course.getById);
router.post(
  "/courses",
  ...authAdmin,
  courseRules,
  handleValidation,
  course.create,
);
router.put(
  "/courses/:id",
  ...authAdmin,
  courseRules,
  handleValidation,
  course.update,
);
router.delete("/courses/:id", ...authAdmin, course.remove);

// Materials
router.get("/materials", ...authAdmin, material.getAll);
router.get("/materials/:id", ...authAdmin, material.getById);
router.post(
  "/materials",
  ...authAdmin,
  materialRules,
  handleValidation,
  material.create,
);
router.put(
  "/materials/:id",
  ...authAdmin,
  materialRules,
  handleValidation,
  material.update,
);
router.delete("/materials/:id", ...authAdmin, material.remove);

// Users
router.get("/users", ...authAdmin, adminUser.getAll);
router.put("/users/:id", ...authAdmin, adminUser.update);
router.delete("/users/:id", ...authAdmin, adminUser.remove);

module.exports = router;
