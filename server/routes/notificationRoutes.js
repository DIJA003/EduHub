const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", notificationController.getAll);
router.get("/:id", notificationController.getById);
router.delete("/delete-all", notificationController.deleteAll);
router.delete("/:id", notificationController.softDelete);
router.patch("/:id/read", notificationController.markRead);

module.exports = router;
