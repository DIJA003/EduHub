const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", verifyToken, async (req, res) => {
  try {
    const { uid, email } = req.user;

    let user = await User.findOne({ firebaseUID: uid });

    if (!user) {
      user = await User.create({
        firebaseUID: uid,
        email,
      });
    }

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/login", verifyToken, async (req, res) => {
  try {
    const { uid } = req.user;

    const user = await User.findOne({ firebaseUID: uid });

    if (!user)
      return res.status(404).json({ message: "User not found in DB" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;