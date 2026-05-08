const User = require("./user.model");
const { paginate } = require("../../shared/pagination");
const { logAction } = require("../../shared/logger");
const { AppError } = require("../../middleware/error.middleware");
const { firebaseAdmin } = require("../../config/firebase");

const usersService = {
  async getAll({ search = "", page = 1, limit = 20, role = "" } = {}) {
    const filter = { isDeleted: { $ne: true } };
    if (role) filter.role = role;
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
        { college: { $regex: search.trim(), $options: "i" } },
      ];
    }
    return paginate(User, filter, {
      page,
      limit: Math.min(100, limit),
      sort: { createdAt: -1 },
      select: "-__v",
    });
  },

  async getById(id) {
    const user = await User.findOne({ _id: id, isDeleted: { $ne: true } })
      .select("-__v")
      .lean();
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async getByFirebaseUid(firebaseUid) {
    return User.findOne({ firebaseUid, isDeleted: { $ne: true } })
      .select("-__v")
      .lean();
  },
  async create(data, performer) {
    const existing = await User.findOne({
      email: data.email.toLowerCase().trim(),
    });
    if (existing) throw new AppError("Email already in use", 409);
    let fbUser;
    try {
      fbUser = await firebaseAdmin.auth().createUser({
        email: data.email.toLowerCase().trim(),
        password: data.password,
        displayName: data.name.trim(),
        emailVerified: true,
      });
    } catch (err) {
      throw new AppError(`Firebase error: ${err.message}`, 400);
    }

    const user = await User.create({
      firebaseUid: fbUser.uid,
      name: data.name.trim(),
      email: data.email.toLowerCase().trim(),
      role: ["student", "mentor", "admin"].includes(data.role)
        ? data.role
        : "student",
      college: (data.college || "").trim(),
      status: "Active",
    });

    await logAction({
      action: "CREATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: performer,
      details: { role: user.role },
    });
    return user;
  },

  async update(id, data, performer) {
    const user = await User.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!user) throw new AppError("User not found", 404);

    const allowed = ["name", "college", "bio", "photoURL", "role", "status"];
    allowed.forEach((key) => {
      if (data[key] !== undefined)
        user[key] =
          typeof data[key] === "string" ? data[key].trim() : data[key];
    });

    await user.save();
    await logAction({
      action: "UPDATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: performer,
      details: data,
    });
    return user;
  },

  async updateProfile(firebaseUid, data) {
    const allowed = { name: true, college: true, bio: true, photoURL: true };
    const user = await User.findOne({ firebaseUid, isDeleted: { $ne: true } });
    if (!user) throw new AppError("User not found", 404);

    Object.keys(data).forEach((key) => {
      if (allowed[key] && data[key] !== undefined) {
        user[key] =
          typeof data[key] === "string" ? data[key].trim() : data[key];
      }
    });

    await user.save();
    return user;
  },

  async remove(id, performer) {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    if (user.role === "admin")
      throw new AppError("Cannot delete an admin account this way", 403);

    await User.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    await logAction({
      action: "DELETE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: performer,
      details: {},
    });
    return { deleted: true };
  },

  async restore(id, performer) {
    const user = await User.findById(id);
    if (!user) throw new AppError("User not found", 404);
    await User.findByIdAndUpdate(id, {
      $unset: { isDeleted: "", deletedAt: "" },
    });
    await logAction({
      action: "RESTORE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: performer,
      details: {},
    });
    return { restored: true };
  },
};

module.exports = usersService;
