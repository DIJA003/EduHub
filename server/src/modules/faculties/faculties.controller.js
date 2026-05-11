const Faculty = require("./faculty.model");
const Program = require("../programs/program.model");
const Course = require("../courses/course.model");
const {
  success,
  created,
  notFound,
  badRequest,
  forbidden,
} = require("../../shared/response");
const { logAction } = require("../../shared/logger");

const DEFAULT_SEMESTERS = () => [
  { number: 1, name: "Semester 1", active: true },
  { number: 2, name: "Semester 2", active: true },
];

function programMatchesYearEntry(yp, userProgramStr) {
  if (!userProgramStr) return true;
  if (yp == null || yp === "") return true;
  const ypStr =
    typeof yp === "object" && yp?._id != null ? String(yp._id) : String(yp);
  return ypStr === userProgramStr;
}

function pickYearEntryForProgram(candidates, userProgramStr) {
  if (candidates.length === 1) return candidates[0];
  if (userProgramStr) {
    const forProgram = candidates.find((y) => {
      const yp = y.program;
      if (yp == null || yp === "") return false;
      const ypStr =
        typeof yp === "object" && yp?._id != null ? String(yp._id) : String(yp);
      return ypStr === userProgramStr;
    });
    if (forProgram) return forProgram;
    const generic = candidates.find((y) => y.program == null || y.program === "");
    if (generic) return generic;
  } else {
    const generic = candidates.find((y) => y.program == null || y.program === "");
    if (generic) return generic;
  }
  return candidates[0];
}

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

/**
 * Academic path years for the signed-in user: faculty config scoped by program,
 * extended by program duration and published course yearIds. Not limited by
 * the student's registration `year` field.
 */
const getStudentAcademicYears = async (req, res, next) => {
  try {
    const facultyId = req.params.id;
    if (req.user.role === "student" || req.user.role === "mentor") {
      if (!req.user.faculty || String(req.user.faculty) !== String(facultyId)) {
        return forbidden(res, "You can only view academic years for your faculty.");
      }
    }

    const faculty = await Faculty.findById(facultyId).lean();
    if (!faculty || faculty.isDeleted) {
      return notFound(res, "Faculty not found");
    }

    const userProgramId = req.user.program || null;
    const userProgramStr =
      userProgramId != null ? String(userProgramId) : "";

    let durationYears = 4;
    if (userProgramId) {
      const prog = await Program.findById(userProgramId)
        .select("durationYears")
        .lean();
      if (prog?.durationYears) {
        durationYears = Math.min(7, Math.max(1, prog.durationYears));
      }
    }

    const rawYears = (faculty.years || []).filter((y) => y.active !== false);
    const matching = rawYears.filter((y) =>
      programMatchesYearEntry(y.program, userProgramStr),
    );

    const byYear = new Map();
    const grouped = {};
    for (const y of matching) {
      if (!grouped[y.year]) grouped[y.year] = [];
      grouped[y.year].push(y);
    }
    for (const yearNum of Object.keys(grouped)) {
      const chosen = pickYearEntryForProgram(
        grouped[yearNum],
        userProgramStr,
      );
      byYear.set(Number(yearNum), chosen);
    }

    const courseFilter = {
      status: "Published",
      isDeleted: { $ne: true },
      faculty: facultyId,
      yearId: { $gte: 1, $lte: 7 },
    };
    if (userProgramStr) {
      courseFilter.$or = [{ program: null }, { program: userProgramId }];
    } else {
      courseFilter.program = null;
    }

    let maxFromCourses = 0;
    try {
      const distinctYears = await Course.distinct("yearId", courseFilter);
      const nums = distinctYears
        .map((n) => Number(n))
        .filter((n) => !Number.isNaN(n) && n >= 1 && n <= 7);
      if (nums.length) maxFromCourses = Math.max(...nums);
    } catch {
      maxFromCourses = 0;
    }

    const maxFromConfig = byYear.size
      ? Math.max(...[...byYear.keys()])
      : 0;
    const topYear = Math.min(
      7,
      Math.max(durationYears, maxFromCourses, maxFromConfig, 1),
    );

    const years = [];
    for (let num = 1; num <= topYear; num += 1) {
      if (byYear.has(num)) {
        years.push(byYear.get(num));
      } else {
        years.push({
          year: num,
          name: `Year ${num}`,
          semesters: DEFAULT_SEMESTERS(),
          active: true,
        });
      }
    }

    return success(res, {
      years,
      faculty: { code: faculty.code, name: faculty.name },
    });
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
  getStudentAcademicYears,
  create,
  update,
  remove,
};
