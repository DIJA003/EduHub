const User = require("../users/user.model");
const { logAction } = require("../../shared/logger");
const { success, badRequest, conflict } = require("../../shared/response");

const register = async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const name = req.body?.name?.trim();
    const college = req.body?.college?.trim() || "";
    const role = ["student", "mentor"].includes(req.body?.role)
      ? req.body.role
      : "student";
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      return success(res, user);
    }

    user = await User.create({
      firebaseUid: uid,
      email: email?.toLowerCase() || "",
      name: name || email?.split("@")[0] || "User",
      role,
      college,
    });

    // await logAction({
    //   action: "REGISTER",
    //   entity: "User",
    //   entityId: user._id,
    //   entityName: user.name,
    //   performedBy: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //   },
    //   req,
    //   details: { role, college },
    // });

    return success(res, user, 201);
  } catch (err) {
    if (err.code === 11000) {
      return conflict(res, "Email already registered");
    }
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    // await logAction({
    //   action: "LOGIN",
    //   entity: "Session",
    //   entityId: user._id,
    //   entityName: user.name,
    //   performedBy: {
    //     id: user._id,
    //     name: user.name,
    //     email: user.email,
    //     role: user.role,
    //   },
    //   req,
    //   details: { role: user.role },
    // });

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const verifyEmailExists = async (req, res, next) => {
  try {
    const email = req.body?.email?.toLowerCase()?.trim();
    if (!email) return badRequest(res, "Email is required");

    const user = await User.findOne({ email }).lean();
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "Email not found in our system" });

    return success(res, { exists: true });
  } catch (err) {
    next(err);
  }
};

const logPasswordChange = async (req, res, next) => {
  try {
    await logAction({
      action: "PASSWORD_CHANGE",
      entity: "User",
      entityId: req.user.id,
      entityName: req.user.name,
      performedBy: req.user,
      req,
    });
    return success(res, { logged: true });
  } catch (err) {
    next(err);
  }
};

module.exports = { register, getMe, verifyEmailExists, logPasswordChange };
