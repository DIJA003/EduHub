const Course = require("./course.model");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  conflict,
  badRequest,
} = require("../../shared/response");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      yearId = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (status && status !== "all") filter.status = status;
    if (yearId) filter.yearId = parseInt(yearId, 10);
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const result = await paginate(Course, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getByYear = async (req, res, next) => {
  try {
    const yearId = parseInt(req.params.yearId, 10);
    const courses = await Course.find({
      yearId,
      status: "Published",
      isDeleted: { $ne: true },
    })
      .sort({ createdAt: -1 })
      .lean();
    return success(res, courses);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return notFound(res, "Course not found");
    return success(res, course);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user?.id) payload.createdBy = req.user.id;

    const course = await Course.create(payload);

    await logAction({
      action: "CREATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
      req,
      details: { code: course.code, status: course.status },
    });

    return created(res, course);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Course code already exists");
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!course) return notFound(res, "Course not found");

    await logAction({
      action: "UPDATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
      req,
      details: { changes: req.body },
    });

    return success(res, course);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Course code already exists");
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true },
    );
    if (!course) return notFound(res, "Course not found");

    await logAction({
      action: "DELETE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
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
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true },
    );
    if (!course) return notFound(res, "Course not found");

    await logAction({
      action: "RESTORE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: req.user,
      req,
    });

    return success(res, course);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getByYear,
  getById,
  create,
  update,
  remove,
  restore,
};
