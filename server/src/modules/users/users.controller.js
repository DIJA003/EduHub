const User = require("./user.model");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  conflict,
  badRequest,
} = require("../../shared/response");
const { admin } = require("../../config/firebase");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      role = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (role && role !== "all") filter.role = role.toLowerCase();
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const result = await paginate(User, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      select: "-firebaseUid",
      populate: [
        { path: "faculty", select: "name code" },
        { path: "program", select: "code name" },
      ],
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-firebaseUid")
      .populate("faculty", "name code")
      .populate("program", "code name")
      .lean();
    if (!user) return notFound(res, "User not found");
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, email, role, faculty, password } = req.body;

    if (!password || password.length < 8) {
      return badRequest(res, "Password must be at least 8 characters");
    }
    let firebaseUser;
    try {
      firebaseUser = await admin.auth().createUser({
        email: email.toLowerCase(),
        password,
        displayName: name,
      });
    } catch (firebaseErr) {
      return badRequest(res, firebaseErr.message);
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role?.toLowerCase() || "student",
      faculty: faculty || null,
      firebaseUid: firebaseUser.uid,
      status: "Active",
    });

    await logAction({
      action: "CREATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      req,
      details: { role: user.role, email: user.email, createdBy: req.user.name },
    });

    return created(res, user);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Email already exists");
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const allowed = {};
    const fields = ["name", "faculty", "status", "role", "bio", "year", "semester"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) allowed[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.params.id, allowed, {
      new: true,
      runValidators: true,
    });
    if (!user) return notFound(res, "User not found");

    await logAction({
      action: "UPDATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      req,
      details: { changes: allowed },
    });

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true },
    );
    if (!user) return notFound(res, "User not found");

    await logAction({
      action: "DELETE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      req,
      details: { softDeleted: true },
    });

    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

const restore = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!user) return notFound(res, "User not found");

    await logAction({
      action: "RESTORE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      req,
    });

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select("-firebaseUid")
      .populate("faculty", "name code")
      .populate("program", "code name")
      .lean();
    if (!user) return notFound(res, "User not found");
    return success(res, user);
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const allowed = {};
    ["name", "bio", "photoURL"].forEach((f) => {
      if (req.body[f] !== undefined) allowed[f] = req.body[f];
    });

    const user = await User.findByIdAndUpdate(req.user.id, allowed, {
      new: true,
    }).populate("faculty", "name code").populate("program", "code name");
    if (!user) return notFound(res, "User not found");

    return success(res, user);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  restore,
  getProfile,
  updateProfile,
};
// router.get("/profile", verifyToken, c.getProfile);
// router.put("/profile", verifyToken, c.updateProfile);
                                                                                                      