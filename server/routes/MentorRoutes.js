const express = require("express");
const router = express.Router();
const materialController = require("../controllers/MaterialController");
const { verifyToken, roleOnly } = require("../middleware/authMiddleware");

const {
  getMentorStats,
  getMentorStudents,
} = require("../controllers/MentorDashboardController");
// All mentor routes require authentication and mentor role
router.use(verifyToken, roleOnly("mentor", "admin"));

////////// Material Management//////////////

router.get("/dashboard/stats", getMentorStats);
router.get("/students", getMentorStudents);
router.get("/dashboard/stats", getMentorStats);
router.post("/materials/upload", materialController.uploadMaterial);
router.get("/materials/pending", materialController.getPendingMaterials);
router.get("/materials/my-courses", materialController.getMyCourseMaterials);
router.patch("/materials/:id/approve", materialController.approveMaterial);
router.delete("/materials/:id/reject", materialController.rejectMaterial);
router.patch("/materials/:id", materialController.update);
router.delete("/materials/:id", materialController.deleteMaterial);
router.post(
  "/courses/:courseId/students/:studentId",
  materialController.assignStudentToCourse,
);

module.exports = router;
