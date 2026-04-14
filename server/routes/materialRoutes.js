const express = require("express");
const router = express.Router();

const materialController = require("../controllers/MaterialController");
const uploadMaterial = require("../middleware/upload");
const { verifyToken, roleOnly } = require("../middleware/authMiddleware");

// All material routes require authentication
router.use(verifyToken);

// GET — students, mentors, and admins can view materials
router.get("/", materialController.getAll);
router.get("/:id", materialController.getById);

// CREATE — mentor/admin only
router.post(
  "/",
  roleOnly("mentor", "admin"),
  uploadMaterial.single("file"),
  materialController.create,
);

// UPDATE — mentor/admin only
router.put(
  "/:id",
  roleOnly("mentor", "admin"),
  uploadMaterial.single("file"),
  materialController.update,
);

// DELETE — mentor/admin only
router.delete("/:id", roleOnly("mentor", "admin"), materialController.remove);

module.exports = router;
