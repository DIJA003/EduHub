const express = require("express");
const router = express.Router();
const Material = require("../models/Material");
const materialController = require("../controllers/MaterialController");
const { verifyToken, roleOnly } = require("../middleware/authMiddleware");

router.use(verifyToken, roleOnly("mentor", "admin"));

// Material management
router.post("/materials/upload",           materialController.uploadMaterial);
router.get("/materials/pending",           materialController.getPendingMaterials);
router.get("/materials/my-courses",        materialController.getMyCourseMaterials);

// Approve: set status to "approved"
router.patch("/materials/:id/approve", async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      {
        status: "approved",
        mentorFeedback: req.body.feedback || "",
      },
      { new: true },
    );
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Reject: set status to "rejected" (keep the record so student can see it)
router.patch("/materials/:id/reject", async (req, res) => {
  try {
    const material = await Material.findByIdAndUpdate(
      req.params.id,
      {
        status: "rejected",
        mentorFeedback: req.body.feedback || "",
      },
      { new: true },
    );
    if (!material) return res.status(404).json({ message: "Material not found" });
    res.json({ success: true, data: material });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get ALL materials for mentor to review (pending from students)
router.get("/materials/review", async (req, res) => {
  try {
    const materials = await Material.find({
      status: "pending",
      uploaderRole: "student",
    })
      .populate("uploadedByRef", "name email")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: materials });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/materials/:id",             materialController.update);
router.delete("/materials/:id",            materialController.deleteMaterial);
router.post("/courses/:courseId/students/:studentId", materialController.assignStudentToCourse);

module.exports = router;