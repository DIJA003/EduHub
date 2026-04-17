const User = require("../models/User");
const { logAction } = require("../utils/Logger");

exports.create = async (req, res) => {
  try {
    const { name, email, role, college } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email required" });
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      role: role?.toLowerCase() || "student",
      college,
      firebaseUid: `manual-${Date.now()}`,
      status: "Pending",
    });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000)
      return res.status(400).json({ message: "Email already exists" });
    res.status(400).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const showDeleted = req.query.showDeleted === "true";
    const filter = showDeleted ? {} : { isDeleted: { $ne: true } };

    const users = await User.find(filter)
      .select("-__v")
      .sort({ createdAt: -1 });
    const shaped = users.map((u) => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role.charAt(0).toUpperCase() + u.role.slice(1),
      college: u.college || "—",
      joined: u.createdAt.toISOString().split("T")[0],
      status: u.status || "Active",
      isDeleted: u.isDeleted || false,
      deletedAt: u.deletedAt || null,
    }));
    res.json({ success: true, data: shaped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, role, college, status } = req.body;
    const updatePayload = {
      ...(name && { name }),
      ...(email && { email: email.toLowerCase() }),
      ...(role && { role: role.toLowerCase() }),
      ...(college && { college }),
      ...(status && { status }),
    };
    const user = await User.findByIdAndUpdate(req.params.id, updatePayload, {
      new: true,
    });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await logAction({
      action: "UPDATE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
      details: updatePayload,
    });

    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?.id || null,
      },
      { new: true },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await logAction({
      action: "DELETE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
    });

    res.json({ success: true, message: "User removed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.restore = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await logAction({
      action: "RESTORE",
      entity: "User",
      entityId: user._id,
      entityName: user.name,
      performedBy: req.user,
    });

    res.json({
      success: true,
      message: "User restored successfully",
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
