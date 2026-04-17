const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notificationController");
const { verifyToken } = require("../middleware/authMiddleware");

router.use(verifyToken);

router.get("/", notificationController.getAll);
router.get("/:id", notificationController.getById);
router.delete("/:id", notificationController.softDelete);           
router.delete("/delete-all", notificationController.deleteAll); 


module.exports = router;