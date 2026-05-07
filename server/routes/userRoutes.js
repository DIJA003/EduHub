const express = require("express");
const router = express.Router();
const User = require("../models/User");
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

const upload = multer({ storage: storage });

router.post("/register", verifyToken, async (req, res) => {
  try {
    const { uid, email, name } = req.user;

    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email: email || "",
        name: name || email?.split("@")[0] || "User",
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

router.post(
  "/materials/upload",
  verifyToken,
  upload.single("file"),
  materialController.create,
);

module.exports = router;
