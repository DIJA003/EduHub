const admin = require("../config/firebase_admin");
const User = require("../models/User");

// Middleware to verify Firebase token
exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token provided" });
  }
  const token = authHeader.split("Bearer ")[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
  
    // Fetch the user from MongoDB using the Firebase UID to get their role
    const dbUser = await User.findOne({ firebaseUid: decodedToken.uid });
    
    // Attach both Firebase token data and the MongoDB role to req.user
    req.user = {
        ...decodedToken,
        role: dbUser ? dbUser.role : "student" 
    };

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// Middleware to check if the user is an Admin
exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        next(); 
    } else {
        res.status(403).json({ message: "Access Denied. Admin resources only." });
    }
};