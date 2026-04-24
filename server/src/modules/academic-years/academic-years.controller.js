const AcademicYear = require("./academic-years.model");
const Course = require("../courses/course.model");
const {
  success,
  created,
  notFound,
  conflict,
} = require("../../shared/response");
const { logAction } = require("../../shared/logger");

const getAll = async (req, res, next) => {
  try {
    const years = await AcademicYear.find().sort({ year: 1 }).lean();
    return success(res, years);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const year = await AcademicYear.findById(req.params.id).lean();
    if (!year) return notFound(res, "Academic year not found");
    return success(res, year);
  } catch (err) {
    next(err);
  }
};

const getByYear = async (req, res, next) => {
  try {
    const yearNum = parseInt(req.params.year, 10);
    const year = await AcademicYear.findOne({ year: yearNum }).lean();
    if (!year) return notFound(res, "Academic year not found");

    const courses = await Course.find({
      yearId: yearNum,
      status: "Published",
      isDeleted: { $ne: true },
    }).lean();

    return success(res, { ...year, courses });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const yr = await AcademicYear.create({
      ...req.body,
      createdBy: req.user.id,
    });
    await logAction({
      action: "CREATE",
      entity: "AcademicYear",
      entityId: yr._id,
      entityName: `Year ${yr.year}`,
      performedBy: req.user,
      req,
    });
    return created(res, yr);
  } catch (err) {
    if (err.code === 11000)
      return conflict(res, "Academic year already exists");
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const yr = await AcademicYear.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!yr) return notFound(res, "Academic year not found");
    await logAction({
      action: "UPDATE",
      entity: "AcademicYear",
      entityId: yr._id,
      entityName: `Year ${yr.year}`,
      performedBy: req.user,
      req,
    });
    return success(res, yr);
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, getByYear, create, update };
