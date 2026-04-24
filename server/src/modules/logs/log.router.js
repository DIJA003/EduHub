const express = require("express");
const router = express.Router();
const Log = require("./log.model");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const { paginate } = require("../../shared/pagination");
const { success } = require("../../shared/response");

router.use(verifyToken, adminOnly);

router.get("/", async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      entity = "",
      action = "",
      search = "",
    } = req.query;

    const filter = {};
    if (entity && entity !== "All") filter.entity = entity;
    if (action && action !== "All") filter.action = action;
    if (search.trim()) {
      filter.$or = [
        { entityName: { $regex: search.trim(), $options: "i" } },
        { "performedBy.name": { $regex: search.trim(), $options: "i" } },
        { "performedBy.email": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const result = await paginate(Log, filter, {
      page,
      limit: Math.min(parseInt(limit, 10) || 50, 200),
      sort: { createdAt: -1 },
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log)
      return res.status(404).json({ success: false, message: "Log not found" });
    return success(res, log);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
