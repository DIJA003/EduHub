const express = require("express");
const router = express.Router();
const c = require("./faculties.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

// Public routes (for registration)
router.get("/public", c.getAll);

// Protected routes
router.get("/", verifyToken, c.getAllAdmin);
router.get("/:id/academic-years", verifyToken, c.getStudentAcademicYears);
router.get("/:id", verifyToken, c.getById);
router.post("/", verifyToken, adminOnly, c.create);
router.put("/:id", verifyToken, adminOnly, c.update);
router.delete("/:id", verifyToken, adminOnly, c.remove);

module.exports = router;
