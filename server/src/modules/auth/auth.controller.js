const User = require("../users/user.model");
const { logAction } = require("../../shared/logger");
const { success, badRequest, conflict } = require("../../shared/response");

const register = async (req, res, next) => {
  try {
    const { uid, email } = req.user;
    const name = req.body?.name?.trim();
    const role = ["student", "mentor"].includes(req.body?.role)
      ? req.body.role
      : "student";
    
    // Faculty for all roles
    const faculty = req.body?.faculty || null;
    // Year/program for students
    const year = req.body?.year || null;
    const program = req.body?.program || null;
    // University for mentors
    const university = req.body?.university?.trim() || "";
    
    let user = await User.findOne({ firebaseUid: uid });
    if (user) {
      return success(res, user);
    }

    const userData = {
      firebaseUid: uid,
      email: email?.toLowerCase() || "",
      name: name || email?.split("@")[0] || "User",
      role,
    };
    
    // Add faculty for all roles if provided
    if (faculty) userData.faculty = faculty;
    
    // Add year/program for students
    if (role === "student") {
      if (year) userData.year = year;
      if (program) userData.program = program;
    }
    
    // Add university for mentors
    if (role === "mentor" && university) {
      userData.university = university;
    }
    
    user = await User.create(userData);

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
    //   details: { role, faculty, university },
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
    const user = await User.findById(req.user.id)
      .populate("faculty", "name code")
      .populate("program", "code name durationYears")
      .lean();
    if (!user) return res.status(404).json({ message: "User not found" });

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
