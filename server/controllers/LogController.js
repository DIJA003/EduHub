const Log = require("../models/Log");

exports.getLogs = async (req, res) => {
  try {
    const {
      entity = "All",
      action = "All",
      limit = 100,
      page = 1,
      search = "",
    } = req.query;

    const filter = {};
    if (entity !== "All") filter.entity = entity;
    if (action !== "All") filter.action = action;
    if (search.trim()) {
      filter.entityName = { $regex: search.trim(), $options: "i" };
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const [logs, total] = await Promise.all([
      Log.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10)),
      Log.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: logs,
      total,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
