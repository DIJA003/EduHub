const Log = require("./log.model");
const { paginate } = require("../../shared/pagination");
const { success, notFound } = require("../../shared/response");

const getLogs = async (req, res, next) => {
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
};

const getLogById = async (req, res, next) => {
  try {
    const log = await Log.findById(req.params.id).lean();
    if (!log) return notFound(res, "Log not found");
    return success(res, log);
  } catch (err) {
    next(err);
  }
};

// Get logs for mentor's own actions or related to their courses/students
const getMentorLogs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      entity = "",
      action = "",
      search = "",
    } = req.query;

    const filter = {
      $or: [
        { "performedBy.id": req.user.id }, // Logs created by mentor
        { "performedBy.email": req.user.email },
      ],
    };

    if (entity && entity !== "All") filter.entity = entity;
    if (action && action !== "All") filter.action = action;
    if (search.trim()) {
      filter.$and = [
        filter.$or ? { $or: filter.$or } : {},
        {
          $or: [
            { entityName: { $regex: search.trim(), $options: "i" } },
            { "details.studentName": { $regex: search.trim(), $options: "i" } },
            { "details.courseTitle": { $regex: search.trim(), $options: "i" } },
          ],
        },
      ];
      delete filter.$or;
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
};

module.exports = { getLogs, getLogById, getMentorLogs };
