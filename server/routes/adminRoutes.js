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
const Log = require("../controllers/LogController");

const authAdmin = [verifyToken, adminOnly];

// ── Dashboard ─────────────────────────────────────────────────────────────────
router.get("/dashboard/stats", ...authAdmin, dashboard.getStats);
router.get("/dashboard/activity", ...authAdmin, dashboard.getActivity);

// ── logs ────────────────────────────────────────────────────────────────
router.get("/logs", ...authAdmin, Log.getLogs);

// ── Colleges ──────────────────────────────────────────────────────────────────
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
router.patch("/colleges/:id/restore", ...authAdmin, college.restore);

// ── Courses ───────────────────────────────────────────────────────────────────
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
router.patch("/courses/:id/restore", ...authAdmin, course.restore);

// ── Materials ─────────────────────────────────────────────────────────────────
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
router.patch("/materials/:id/restore", ...authAdmin, material.restore);

// ── Users ─────────────────────────────────────────────────────────────────────
router.post("/users", ...authAdmin, adminUser.create);
router.get("/users", ...authAdmin, adminUser.getAll);
router.put("/users/:id", ...authAdmin, adminUser.update);
router.delete("/users/:id", ...authAdmin, adminUser.remove);
router.patch("/users/:id/restore", ...authAdmin, adminUser.restore);

module.exports = router;
