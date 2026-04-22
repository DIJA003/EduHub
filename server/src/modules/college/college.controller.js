const College = require("./college.model");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  conflict,
} = require("../../shared/response");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (search.trim()) {
      filter.name = { $regex: search.trim(), $options: "i" };
    }

    const result = await paginate(College, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id).lean();
    if (!college) return notFound(res, "College not found");
    return success(res, college);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, years, semesters, programs, status } = req.body;
    if (!name?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "College name is required" });
    }

    const exists = await College.findOne({
      name: { $regex: `^${name.trim()}$`, $options: "i" },
      isDeleted: { $ne: true },
    });
    if (exists) return conflict(res, "A college with this name already exists");

    const college = await College.create({
      name: name.trim(),
      years: years || 4,
      semesters: semesters || 2,
      programs: programs || 0,
      status: status || "Active",
      createdBy: req.user.id,
    });

    await logAction({
      action: "CREATE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      req,
      details: { status: college.status, years: college.years },
    });

    return created(res, college);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          ...(req.body.name && { name: req.body.name.trim() }),
          ...(req.body.years !== undefined && { years: req.body.years }),
          ...(req.body.semesters !== undefined && {
            semesters: req.body.semesters,
          }),
          ...(req.body.programs !== undefined && {
            programs: req.body.programs,
          }),
          ...(req.body.status && { status: req.body.status }),
        },
      },
      { new: true, runValidators: true },
    );
    if (!college) return notFound(res, "College not found");

    await logAction({
      action: "UPDATE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      req,
      details: { changes: req.body },
    });

    return success(res, college);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true },
    );
    if (!college) return notFound(res, "College not found");

    await logAction({
      action: "DELETE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
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
    const college = await College.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!college) return notFound(res, "College not found");

    await logAction({
      action: "RESTORE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      req,
    });

    return success(res, college);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, remove, restore };
