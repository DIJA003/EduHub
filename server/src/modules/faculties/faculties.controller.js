const Faculty = require("./faculty.model");
const { success, created, notFound, badRequest } = require("../../shared/response");
const { logAction } = require("../../shared/logger");

const getAll = async (req, res, next) => {
  try {
    const faculties = await Faculty.find({
      isDeleted: { $ne: true },
      status: "active",
    })
      .select("code name description years")
      .sort({ name: 1 })
      .lean();

    return success(res, faculties);
  } catch (err) {
    next(err);
  }
};

const getAllAdmin = async (req, res, next) => {
  try {
    const faculties = await Faculty.find({ isDeleted: { $ne: true } })
      .populate("dean", "name email")
      .populate("createdBy", "name")
      .sort({ name: 1 })
      .lean();

    return success(res, faculties);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const faculty = await Faculty.findById(req.params.id).lean();
    if (!faculty || faculty.isDeleted) {
      return notFound(res, "Faculty not found");
    }
    return success(res, faculty);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { code, name, description, years } = req.body;

    if (!code || !name) {
      return badRequest(res, "Code and name are required");
    }

    const faculty = await Faculty.create({
      code: code.toUpperCase(),
      name: name.trim(),
      description: description?.trim() || "",
      years: years || [{ year: 1, name: "Year 1", semesters: [{ number: 1, name: "Semester 1" }] }],
      createdBy: req.user.id,
    });

    await logAction({
      action: "CREATE",
      entity: "Faculty",
      entityId: faculty._id,
      entityName: faculty.name,
      performedBy: req.user,
      req,
    });

    return created(res, faculty);
  } catch (err) {
    if (err.code === 11000) {
      return badRequest(res, "Faculty code already exists");
    }
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, years, dean, status } = req.body;

    const update = {};
    if (name) update.name = name.trim();
    if (description !== undefined) update.description = description?.trim();
    if (years) update.years = years;
    if (dean) update.dean = dean;
    if (status) update.status = status;

    const faculty = await Faculty.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!faculty) return notFound(res, "Faculty not found");

    await logAction({
      action: "UPDATE",
      entity: "Faculty",
      entityId: faculty._id,
      entityName: faculty.name,
      performedBy: req.user,
      req,
    });

    return success(res, faculty);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const faculty = await Faculty.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: req.user.id,
      },
      { new: true }
    );

    if (!faculty) return notFound(res, "Faculty not found");

    await logAction({
      action: "DELETE",
      entity: "Faculty",
      entityId: faculty._id,
      entityName: faculty.name,
      performedBy: req.user,
      req,
    });

    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getAllAdmin,
  getById,
  create,
  update,
  remove,
};
