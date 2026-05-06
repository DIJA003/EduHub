const express = require("express");
const router = express.Router();
const User = require("../models/User");
<<<<<<< HEAD
const { verifyToken } = require("../middleware/authMiddleware");
const multer = require("multer");
const path = require("path");
const materialController = require("../controllers/MaterialController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
=======
const { logAction } = require("../utils/Logger");
const {
  saveCourse,
  unsaveCourse,
  getSavedCourses,
} = require("../controllers/userController");
const {
  verifyToken,
  verifyRegistration,
} = require("../middleware/authMiddleware");
const { registerRules, handleValidation } = require("../middleware/validate");

router.post(
  "/register",
  verifyRegistration,
  registerRules,
  handleValidation,
  async (req, res) => {
    try {
      const { uid, email } = req.user;
      const nameFromBody = req.body?.name?.trim();
      const collegeFromBody = req.body?.college?.trim() || "—";
      const roleFromBody = ["student", "mentor"].includes(req.body?.role)
        ? req.body.role
        : "student";
>>>>>>> MustafaBranchNo2

const upload = multer({ storage: storage });

router.post("/register", verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
<<<<<<< HEAD
        email: email || "",
        name: name || email?.split("@")[0] || "User",
=======
        email: email?.toLowerCase() || "",
        name: nameFromBody || email?.split("@")[0] || "User",
        role: roleFromBody,
        college: collegeFromBody,
>>>>>>> MustafaBranchNo2
      });
    }

    res.status(201).json(user);
  } catch (error) {
    console.error("Register error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/login", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUid: uid });
    if (!user) return res.status(404).json({ message: "User not found in DB" });

    res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

<<<<<<< HEAD
router.post(
  "/materials/upload",
  verifyToken,
  upload.single("file"),
  materialController.create,
);
=======
router.post("/password-changed", verifyToken, async (req, res) => {
  try {
    await logAction({
      action: "UPDATE",
      entity: "User",
      entityId: req.user.id,
      entityName: req.user.name,
      performedBy: req.user,
      details: { action: "password_changed" },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/profile", verifyToken, async (req, res) => {
  try {
    const { name, bio, college } = req.body;
    const allowed = {};
    if (name?.trim()) allowed.name = name.trim();
    if (bio?.trim()) allowed.bio = bio.trim();
    if (college?.trim()) allowed.college = college.trim();

    const user = await User.findByIdAndUpdate(req.user.id, allowed, {
      new: true,
    }).select("-__v");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/dashboard/courses", verifyToken, getSavedCourses);
router.post("/courses/:courseId/save", verifyToken, saveCourse);
router.delete("/courses/:courseId/unsave", verifyToken, unsaveCourse);
>>>>>>> MustafaBranchNo2

module.exports = router;
