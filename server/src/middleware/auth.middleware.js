const { admin } = require("../config/firebase");
const User = require("../modules/users/user.model");
const { unauthorized, forbidden, error } = require("../shared/response");

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(res, "No authentication token provided");
    }

    const token = authHeader.split("Bearer ")[1];

    if (!token || token === "null" || token === "undefined") {
      return unauthorized(res, "Invalid token format");
    }

    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (firebaseErr) {
      if (
        firebaseErr.code === "auth/id-token-expired" ||
        firebaseErr.code === "auth/argument-error"
      ) {
        return unauthorized(res, "Token expired — please sign in again");
      }
      return unauthorized(res, "Invalid authentication token");
    }

    const dbUser = await User.findOne({ firebaseUid: decoded.uid })
      .select("role status _id name email isDeleted faculty program")
      .lean();

    if (!dbUser) {
      return forbidden(res, "Account not found. Please complete registration.");
    }

    if (dbUser.isDeleted) {
      return forbidden(res, "Account has been removed. Contact support.");
    }

    if (dbUser.status === "Suspended") {
      return forbidden(res, "Account suspended. Contact support.");
    }

    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: dbUser.role,
      id: dbUser._id.toString(),
      name: dbUser.name,
      faculty: dbUser.faculty,
      program: dbUser.program || null,
    };

    next();
  } catch (err) {
    next(err);
  }
};

const verifyRegistration = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(res, "No authentication token provided");
    }

    const token = authHeader.split("Bearer ")[1];
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
    return unauthorized(res, "Invalid or expired token");
  }
};

module.exports = { verifyToken, verifyRegistration };
