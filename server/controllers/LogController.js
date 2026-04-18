const Log = require("../models/Log");

exports.getLogs = async (req, res) => {
  try {
    const {
      entity = "All",
      action = "All",
      limit = 50,
      page = 1,
      search = "",
      success,
      actorId,
    } = req.query;

    const filter = {};

    if (entity !== "All") filter.entity = entity;
    if (action !== "All") filter.action = action;
    if (search.trim()) {
      filter.$or = [
        { entityName: { $regex: search.trim(), $options: "i" } },
        { "performedBy.name": { $regex: search.trim(), $options: "i" } },
        { "performedBy.email": { $regex: search.trim(), $options: "i" } },
      ];
    }
    if (success !== undefined) {
      filter.success = success === "true";
    }
    if (actorId) {
      filter["performedBy.userId"] = actorId;
    }

    const limitNum = Math.min(parseInt(limit, 10) || 50, 200);
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const skip = (pageNum - 1) * limitNum;

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Log.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: pageNum,
      limit: limitNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch (err) {
    console.error("[LogController] getLogs error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log)
      return res.status(404).json({ success: false, message: "Log not found" });
    res.json({ success: true, data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
