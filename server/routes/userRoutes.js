const express = require("express");
const router = express.Router();
const User = require("../models/User");
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

      let user = await User.findOne({ firebaseUid: uid });
      if (user) return res.status(200).json(user);

      user = await User.create({
        firebaseUid: uid,
        email: email?.toLowerCase() || "",
        name: nameFromBody || email?.split("@")[0] || "User",
        role: roleFromBody,
        college: collegeFromBody,
      });

      res.status(201).json(user);
    } catch (error) {
      if (error.code === 11000) {
        return res.status(409).json({ message: "Email already registered." });
      }
      console.error("Register error:", error.message);
      res.status(500).json({ message: "Server error during registration." });
    }
  },
);

router.get("/login", verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select(
      "-__v",
    );
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (error) {
    console.error("Login error:", error.message);
    res.status(500).json({ message: "Server error" });
  }
});

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

module.exports = router;
