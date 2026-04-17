const admin = require("../config/firebase_admin");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const dbUser = await User.findOne({ firebaseUid: decoded.uid }).select(
      "role status _id name email isDeleted",
    );

    if (!dbUser) {
      return res.status(403).json({
        message: "User not registered in system. Please complete registration.",
      });
    }

    if (dbUser.isDeleted) {
      return res.status(403).json({
        message: "Account has been removed. Contact support.",
      });
    }

    if (dbUser.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: dbUser.role,
      id: dbUser._id.toString(),
      name: dbUser.name,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.verifyRegistration = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: "student",
      id: null,
      name: null,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role === "admin") return next();
  return res.status(403).json({ message: "Access denied — admins only." });
};

exports.roleOnly =
  (...roles) =>
  (req, res, next) => {
    if (roles.includes(req.user?.role)) return next();
    return res.status(403).json({
      message: `Access denied — required role: ${roles.join(" or ")}.`,
    });
  };

exports.selfOrAdmin =
  (paramKey = "id") =>
  (req, res, next) => {
    const targetId = req.params[paramKey];
    if (req.user?.id === targetId || req.user?.role === "admin") return next();
    return res.status(403).json({ message: "Access denied." });
  };

exports.verifyEmailExistence = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "This email is not registered in our system.",
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during email verification.",
    });
  }
};
