const { admin } = require("../config/firebase_admin");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ message: "Invalid token format" });
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token, true); // force check revocation
    const dbUser = await User.findOne({ firebaseUid: decoded.uid }).select(
      "role status _id name email isDeleted",
    );

    if (!dbUser) {
      return res.status(403).json({
        message: "User not registered in system. Please complete registration.",
      });
    }

    if (dbUser.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }
    if (dbUser.isDeleted) {
      return res
        .status(403)
        .json({ message: "Account has been removed. Contact support." });
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
    console.error("[authMiddleware] verifyToken error:", err.code, err.message);
    if (
      err.code === "auth/id-token-expired" ||
      err.code === "auth/argument-error"
    ) {
      return res
        .status(401)
        .json({ message: "Token expired, please re-authenticate" });
    }
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

exports.verifyRegistration = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token || token === "null" || token === "undefined") {
    return res.status(401).json({ message: "Invalid token format" });
  }

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
    console.error(
      "[authMiddleware] verifyRegistration error:",
      err.code,
      err.message,
    );
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
