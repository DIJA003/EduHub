const User = require("../users/user.model");
const { logAction } = require("../../shared/logger");

const authService = {
  async getMe(firebaseUid) {
    return User.findOne({ firebaseUid, isDeleted: { $ne: true } })
      .select("-__v")
      .lean();
  },

  async register(
    { firebaseUid, name, email, role, college },
    { ip = "", userAgent = "" } = {},
  ) {
    const allowedRoles = ["student", "mentor"];
    const safeRole = allowedRoles.includes(role) ? role : "student";
    const existing = await User.findOne({ firebaseUid });
    if (existing) return existing;

    const user = await User.create({
      firebaseUid,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: safeRole,
      college: (college || "").trim(),
      status: "Active",
    });

    await logAction({
      action: "REGISTER",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ip,
      userAgent,
      details: { role: safeRole, college },
    });

    return user;
  },
  async recordLogin(firebaseUid, { ip = "", userAgent = "" } = {}) {
    const user = await User.findOne({ firebaseUid, isDeleted: { $ne: true } });
    if (!user) return null;

    await logAction({
      action: "LOGIN",
      entity: "Session",
      entityId: user._id,
      entityName: user.name,
      performedBy: {
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ip,
      userAgent,
      details: {},
    });

    return user;
  },
};

module.exports = authService;
