const Course = require("./course.model");
const Enrollment = require("../enrollments/enrollment.model");
const { paginate } = require("../../shared/pagination");
const { logAction } = require("../../shared/logger");
const { AppError } = require("../../middleware/error.middleware");

const coursesService = {
  async getAll({
    search = "",
    page = 1,
    limit = 20,
    yearId = "",
    status = "published",
  } = {}) {
    const filter = { isDeleted: { $ne: true } };
    if (status && status !== "all") filter.status = status;
    if (yearId) filter.academicYearId = yearId;
    if (search.trim()) {
      filter.$or = [
        { title: { $regex: search.trim(), $options: "i" } },
        { code: { $regex: search.trim(), $options: "i" } },
        { instructor: { $regex: search.trim(), $options: "i" } },
      ];
    }
    return paginate(Course, filter, {
      page,
      limit: Math.min(100, limit),
      sort: { createdAt: -1 },
      select: "-__v",
    });
  },

  async getByYear(yearId) {
    return Course.find({
      academicYearId: yearId,
      status: "published",
      isDeleted: { $ne: true },
    })
      .sort({ code: 1 })
      .lean();
  },

  async getById(id) {
    const course = await Course.findOne({
      _id: id,
      isDeleted: { $ne: true },
    }).lean();
    if (!course) throw new AppError("Course not found", 404);
    const studentCount = await Enrollment.countDocuments({
      course: id,
      status: "active",
    });
    return { ...course, studentCount };
  },

  async create(data, performer) {
    const exists = await Course.findOne({
      code: data.code.toUpperCase().trim(),
      isDeleted: { $ne: true },
    });
    if (exists)
      throw new AppError("A course with this code already exists", 409);

    const course = await Course.create({
      code: data.code.toUpperCase().trim(),
      title: data.title.trim(),
      college: (data.college || "").trim(),
      instructor: (data.instructor || "").trim(),
      instructorRef: data.instructorId || null,
      creditHours: Number(data.creditHours) || 3,
      academicYearId: data.academicYearId || null,
      status: data.status || "draft",
    });

    await logAction({
      action: "CREATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: performer,
      details: data,
    });
    return course;
  },

  async update(id, data, performer) {
    console.log("[DEBUG] Update course - received data:", {
      id,
      instructorId: data.instructorId,
      instructor: data.instructor,
      dataKeys: Object.keys(data),
    });

    const course = await Course.findOne({ _id: id, isDeleted: { $ne: true } });
    if (!course) throw new AppError("Course not found", 404);

    console.log("[DEBUG] Current course instructorRef:", course.instructorRef);

    if (data.code && data.code !== course.code) {
      const dup = await Course.findOne({
        code: data.code.toUpperCase().trim(),
        _id: { $ne: id },
      });
      if (dup) throw new AppError("Course code already in use", 409);
    }

    Object.assign(course, {
      ...(data.title && { title: data.title.trim() }),
      ...(data.code && { code: data.code.toUpperCase().trim() }),
      ...(data.college !== undefined && { college: data.college.trim() }),
      ...(data.instructor !== undefined && {
        instructor: data.instructor.trim(),
      }),
      ...(data.instructorId !== undefined && {
        instructorRef: data.instructorId || null,
      }),
      ...(data.creditHours && { creditHours: Number(data.creditHours) }),
      ...(data.status && { status: data.status }),
      ...(data.academicYearId !== undefined && {
        academicYearId: data.academicYearId,
      }),
    });

    await course.save();

    console.log("[DEBUG] Course saved - new instructorRef:", course.instructorRef);

    await logAction({
      action: "UPDATE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: performer,
      details: data,
    });
    return course;
  },

  async remove(id, performer) {
    const course = await Course.findById(id);
    if (!course) throw new AppError("Course not found", 404);
    await Course.findByIdAndUpdate(id, {
      isDeleted: true,
      deletedAt: new Date(),
    });
    await logAction({
      action: "DELETE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: performer,
      details: {},
    });
    return { deleted: true };
  },

  async restore(id, performer) {
    const course = await Course.findById(id);
    if (!course) throw new AppError("Course not found", 404);
    await Course.findByIdAndUpdate(id, {
      $unset: { isDeleted: "", deletedAt: "" },
    });
    await logAction({
      action: "RESTORE",
      entity: "Course",
      entityId: course._id,
      entityName: course.title,
      performedBy: performer,
      details: {},
    });
    return { restored: true };
  },
};

module.exports = coursesService;
