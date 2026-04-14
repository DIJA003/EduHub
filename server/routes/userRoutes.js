const express = require("express");
const router = express.Router();
const User = require("../models/User");
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

      let user = await User.findOne({ firebaseUid: uid });
      if (user) return res.status(200).json(user);

      user = await User.create({
        firebaseUid: uid,
        email: email?.toLowerCase() || "",
        name: nameFromBody || email?.split("@")[0] || "User",
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

router.get("/dashboard/courses", verifyToken, getSavedCourses);
router.post("/courses/:courseId/save", verifyToken, saveCourse);
router.delete("/courses/:courseId/unsave", verifyToken, unsaveCourse);

module.exports = router;
