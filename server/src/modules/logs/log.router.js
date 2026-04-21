const express = require("express");
const router = express.Router();
const Log = require("./log.model");
const { verifyToken } = require("../../middleware/auth.middleware");
const {
  adminOnly,
  mentorOrAdmin,
} = require("../../middleware/role.middleware");
const { paginate } = require("../../shared/pagination");
const { success, notFound } = require("../../shared/response");

router.get("/", verifyToken, mentorOrAdmin, async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      entity = "",
      action = "",
      search = "",
      successOnly = "",
    } = req.query;

    const filter = {};

    if (req.user.role === "mentor") {
      filter["performedBy.userId"] = req.user.id;
    }

    if (entity && entity !== "All") filter.entity = entity;
    if (action && action !== "All") filter.action = action;
    if (successOnly === "true") filter.success = true;
    if (successOnly === "false") filter.success = false;

    if (search.trim()) {
      filter.$or = [
        { entityName: { $regex: search.trim(), $options: "i" } },
        { "performedBy.name": { $regex: search.trim(), $options: "i" } },
        { "performedBy.email": { $regex: search.trim(), $options: "i" } },
      ];
    }

    const result = await paginate(Log, filter, {
      page,
      limit: Math.min(200, limit),
      sort: { createdAt: -1 },
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", verifyToken, adminOnly, async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log) return notFound(res, "Log entry not found");
    return success(res, log);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
