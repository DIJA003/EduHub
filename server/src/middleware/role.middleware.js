const { forbidden } = require("../shared/response");

const roleOnly =
  (...roles) =>
  (req, res, next) => {
    if (!req.user) {
      return forbidden(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return forbidden(
        res,
        `Access denied. Required role: ${roles.join(" or ")}`,
      );
    }

    next();
  };

const adminOnly = roleOnly("admin");
const mentorOnly = roleOnly("mentor");
const mentorOrAdmin = roleOnly("mentor", "admin");
const studentOnly = roleOnly("student");

module.exports = {
  roleOnly,
  adminOnly,
  mentorOnly,
  mentorOrAdmin,
  studentOnly,
};
