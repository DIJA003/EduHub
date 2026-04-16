const College = require("../models/College");
const { logAction } = require("../utils/Logger");

exports.getAll = async (req, res) => {
  try {
    const showDeleted = req.query.showDeleted === "true";
    const filter = showDeleted ? {} : { isDeleted: { $ne: true } };
    const colleges = await College.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: colleges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const college = await College.findById(req.params.id);
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: "College not found" });
    res.json({ success: true, data: college });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const payload = { ...req.body };
    if (req.user?.id) payload.createdBy = req.user.id;
    const college = await College.create(payload);

    await logAction({
      action: "CREATE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      details: { name: college.name, status: college.status },
    });

    res.status(201).json({ success: true, data: college });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: "College not found" });

    await logAction({
      action: "UPDATE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      details: req.body,
    });

    res.json({ success: true, data: college });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── Soft delete — marks as deleted, never removes from DB ────────────────────
exports.remove = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user?.id || null,
      },
      { new: true },
    );
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: "College not found" });

    await logAction({
      action: "DELETE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
    });

    res.json({
      success: true,
      message: "College deleted successfully",
      data: college,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Restore a soft-deleted college ───────────────────────────────────────────
exports.restore = async (req, res) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!college)
      return res
        .status(404)
        .json({ success: false, message: "College not found" });

    await logAction({
      action: "RESTORE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
    });

    res.json({
      success: true,
      message: "College restored successfully",
      data: college,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
