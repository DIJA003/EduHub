const express = require("express");
const router = express.Router();
const studentController = require("../controllers/StudentController");
const { verifyToken, roleOnly } = require("../middleware/authMiddleware");

router.use(verifyToken, roleOnly("student"));

router.get("/courses", studentController.getMyCourses);
router.get("/courses/:courseId", studentController.getCourseDetails);
router.post("/materials/upload", studentController.uploadMaterial);

module.exports = router;
