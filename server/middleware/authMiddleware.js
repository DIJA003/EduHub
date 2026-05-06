const admin = require("../config/firebase_admin");

const User = require("../models/User");

/**

 * Standard token verification — requires user to exist in DB.

 * Use for all protected routes EXCEPT /register.

 */

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided" });
  }

  const token = authHeader.split("Bearer ")[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);

    let dbUser = await User.findOne({ firebaseUid: decoded.uid }).select(
      "role status _id name email",
    );

    // Auto-create user if they exist in Firebase but not in MongoDB.
    // This handles seed users logging in from mobile and new registrations.
    if (!dbUser) {
      dbUser = await User.create({
        firebaseUid: decoded.uid,
        email:       decoded.email?.toLowerCase() || "",
        name:        decoded.name || decoded.email?.split("@")[0] || "User",
        role:        "student",
        status:      "Active",
      });
    }

    if (dbUser.status === "Suspended") {
      return res
        .status(403)
        .json({ message: "Account suspended. Contact support." });
    }

    req.user = {
      uid:   decoded.uid,
      email: decoded.email,
      role:  dbUser.role,
      id:    dbUser._id.toString(),
      name:  dbUser.name,
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