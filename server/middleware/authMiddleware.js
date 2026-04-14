const admin = require('../config/firebase_admin');
const User  = require('../models/User');

exports.verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await admin.auth().verifyIdToken(token);
    const dbUser  = await User.findOne({ firebaseUid: decoded.uid }).select('role status _id');

    if (!dbUser) {
      req.user = { ...decoded, role: 'student', id: null };
    } else {
      if (dbUser.status === 'Suspended') {
        return res.status(403).json({ message: 'Account suspended. Contact support.' });
      }
      req.user = { ...decoded, role: dbUser.role, id: dbUser._id.toString() };
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.user?.role === 'admin') return next();
  res.status(403).json({ message: 'Access denied — admins only.' });
};


exports.roleOnly = (...roles) => (req, res, next) => {
  if (roles.includes(req.user?.role)) return next();
  res.status(403).json({
    message: `Access denied — required role: ${roles.join(' or ')}.`,
  });
};

exports.selfOrAdmin = (paramKey = 'id') => (req, res, next) => {
  const { user }     = req;
  const targetId     = req.params[paramKey];
  const isSelf       = user?.id === targetId;
  const isAdmin      = user?.role === 'admin';
  if (isSelf || isAdmin) return next();
  res.status(403).json({ message: 'Access denied.' });
};