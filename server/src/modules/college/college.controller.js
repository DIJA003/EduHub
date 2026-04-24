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
      limit = 20,
      search = "",
      showDeleted = "false",
    } = req.query;
    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (search.trim()) filter.name = { $regex: search.trim(), $options: "i" };

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
    const college = await College.create({
      ...req.body,
      createdBy: req.user.id,
    });
    await logAction({
      action: "CREATE",
      entity: "College",
      entityId: college._id,
      entityName: college.name,
      performedBy: req.user,
      req,
      details: { status: college.status },
    });
    return created(res, college);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "College name already exists");
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const college = await College.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
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
