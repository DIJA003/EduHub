const express = require("express");
const router = express.Router();
const c = require("./programs.controller");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");

// Public routes (for registration/filters)
router.get("/by-faculty/:facultyId", c.getByFaculty);
router.get("/public", c.getAll);

// Protected routes
router.get("/", verifyToken, c.getAll);
router.get("/structure/:id", verifyToken, c.getProgramStructure);
router.get("/:id", verifyToken, c.getById);

// Admin only routes
router.post("/", verifyToken, adminOnly, c.create);
router.put("/:id", verifyToken, adminOnly, c.update);
router.delete("/:id", verifyToken, adminOnly, c.remove);
router.patch("/:id/restore", verifyToken, adminOnly, c.restore);

module.exports = router;
