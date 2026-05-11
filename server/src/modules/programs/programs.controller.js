const Program = require("./program.model");
const Course = require("../courses/course.model");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  conflict,
  badRequest,
} = require("../../shared/response");
const mongoose = require("mongoose");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      faculty = "",
      status = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (status && status !== "all") filter.status = status;
    if (faculty && mongoose.Types.ObjectId.isValid(faculty)) {
      filter.faculty = faculty;
    }
    if (search.trim()) {
      filter.$or = [
        { name: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
      ];
    }

    const result = await paginate(Program, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [{ path: "faculty", select: "code name" }],
    });
    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getByFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(facultyId)) {
      return badRequest(res, "Invalid faculty ID");
    }

    const programs = await Program.find({
      faculty: facultyId,
      status: "Active",
      isDeleted: { $ne: true },
    })
      .populate("faculty", "code name")
      .sort({ name: 1 })
      .lean();

    return success(res, programs);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const program = await Program.findById(req.params.id)
      .populate("faculty", "code name years")
      .lean();
    if (!program) return notFound(res, "Program not found");

    // Get courses for this program
    const courses = await Course.find({
      program: req.params.id,
      isDeleted: { $ne: true },
    })
      .populate("instructorRef", "name")
      .sort({ yearId: 1, semester: 1, code: 1 })
      .lean();

    return success(res, { ...program, courses });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    if (req.user?.id) payload.createdBy = req.user.id;

    const program = await Program.create(payload);

    await logAction({
      action: "CREATE",
      entity: "Program",
      entityId: program._id,
      entityName: program.name,
      performedBy: req.user,
      req,
      details: { code: program.code, faculty: program.faculty },
    });

    return created(res, program);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Program code already exists");
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!program) return notFound(res, "Program not found");

    await logAction({
      action: "UPDATE",
      entity: "Program",
      entityId: program._id,
      entityName: program.name,
      performedBy: req.user,
      req,
      details: { changes: req.body },
    });

    return success(res, program);
  } catch (err) {
    if (err.code === 11000) return conflict(res, "Program code already exists");
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true }
    );
    if (!program) return notFound(res, "Program not found");

    await logAction({
      action: "DELETE",
      entity: "Program",
      entityId: program._id,
      entityName: program.name,
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
    const program = await Program.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedAt: null, deletedBy: null },
      { new: true }
    );
    if (!program) return notFound(res, "Program not found");

    await logAction({
      action: "RESTORE",
      entity: "Program",
      entityId: program._id,
      entityName: program.name,
      performedBy: req.user,
      req,
    });

    return success(res, program);
  } catch (err) {
    next(err);
  }
};

// Get courses organized by year and semester for a program
const getProgramStructure = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return badRequest(res, "Invalid program ID");
    }

    const program = await Program.findById(id)
      .populate("faculty", "code name years")
      .lean();
    if (!program) return notFound(res, "Program not found");

    const courses = await Course.find({
      program: id,
      isDeleted: { $ne: true },
    })
      .populate("instructorRef", "name")
      .sort({ yearId: 1, semester: 1, code: 1 })
      .lean();

    // Organize courses by year and semester
    const structure = {};
    for (let year = 1; year <= program.durationYears; year++) {
      structure[year] = {
        1: [], // Fall
        2: [], // Spring
        3: [], // Summer
      };
    }

    courses.forEach((course) => {
      const year = course.yearId || 1;
      const sem = course.semester || 1;
      if (structure[year] && structure[year][sem]) {
        structure[year][sem].push(course);
      }
    });

    return success(res, { program, structure });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  getByFaculty,
  getById,
  create,
  update,
  remove,
  restore,
  getProgramStructure,
};
