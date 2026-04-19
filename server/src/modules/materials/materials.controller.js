const Material = require("./material.model");
const {
  confirmUpload,
  approveMaterial,
  rejectMaterial,
} = require("./material.service");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  badRequest,
} = require("../../shared/response");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (status && status !== "all") filter.status = status;

    if (req.user.role === "student") {
      filter.uploadedBy = req.user.id;
    }

    if (req.user.role === "mentor") {
      const Course = require("../courses/course.model");
      const myCourses = await Course.find({ instructorRef: req.user.id })
        .select("_id")
        .lean();
      filter.courseRef = { $in: myCourses.map((c) => c._id) };
    }

    if (search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const result = await paginate(Material, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [
        { path: "uploadedBy", select: "name role" },
        { path: "courseRef", select: "title code" },
        { path: "reviewedBy", select: "name" },
      ],
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getMyMaterials = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = { uploadedBy: req.user.id, isDeleted: { $ne: true } };

    const result = await paginate(Material, filter, {
      page,
      limit,
      sort: { createdAt: -1 },
      populate: [{ path: "courseRef", select: "title code" }],
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getPending = async (req, res, next) => {
  try {
    const Course = require("../courses/course.model");
    const filter = {
      status: "pending",
      isDeleted: { $ne: true },
      uploadedBy: { $ne: req.user.id },
    };

    if (req.user.role === "mentor") {
      const myCourses = await Course.find({ instructorRef: req.user.id })
        .select("_id")
        .lean();
      filter.courseRef = { $in: myCourses.map((c) => c._id) };
    }

    const result = await paginate(Material, filter, {
      page: req.query.page || 1,
      limit: req.query.limit || 20,
      sort: { createdAt: -1 },
      populate: [
        { path: "uploadedBy", select: "name email" },
        { path: "courseRef", select: "title code" },
      ],
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const approve = async (req, res, next) => {
  try {
    const material = await approveMaterial({
      materialId: req.params.id,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
      feedback: req.body?.feedback || "",
    });

    await logAction({
      action: "APPROVE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
    });

    return success(res, material);
  } catch (err) {
    next(err);
  }
};

const reject = async (req, res, next) => {
  try {
    const material = await rejectMaterial({
      materialId: req.params.id,
      reviewerId: req.user.id,
      reviewerRole: req.user.role,
      feedback: req.body?.feedback || "",
    });

    await logAction({
      action: "REJECT",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
    });

    return success(res, material);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "student") filter.uploadedBy = req.user.id;

    const material = await Material.findOneAndUpdate(
      filter,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true },
    );
    if (!material) return notFound(res, "Material not found");

    await logAction({
      action: "DELETE",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
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
  getMyMaterials,
  getPending,
  approve,
  reject,
  remove,
};
