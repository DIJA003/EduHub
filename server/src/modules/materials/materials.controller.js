const Material = require("./material.model");
const {
  confirmUpload,
  approveMaterial,
  rejectMaterial,
} = require("./materials.service");
const { logAction } = require("../../shared/logger");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  badRequest,
} = require("../../shared/response");
const Course = require("../courses/course.model");

const getAll = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      search = "",
      status = "",
      courseId = "",
      showDeleted = "false",
    } = req.query;

    const filter = {};
    if (showDeleted !== "true") filter.isDeleted = { $ne: true };
    if (status && status !== "all") filter.status = status;
    if (courseId) filter.courseRef = courseId;

    if (req.user.role === "student") {
      filter.uploadedBy = req.user.id;
    } else if (req.user.role === "mentor") {
      const myCourses = await Course.find({
        instructorRef: req.user.id,
        isDeleted: { $ne: true },
      })
        .select("_id")
        .lean();
      filter.courseRef = { $in: myCourses.map((c) => c._id) };
    }

    if (search.trim()) {
      filter.title = { $regex: search.trim(), $options: "i" };
    }

    const result = await paginate(Material, filter, {
      page,
      limit: Math.min(100, limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "uploadedBy", select: "name role" },
        { path: "courseRef", select: "title code" },
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
      limit: Math.min(50, limit),
      sort: { createdAt: -1 },
      populate: [{ path: "courseRef", select: "title code" }],
    });

    const data = result.data.map((m) => ({
      ...m,
      courseName: m.courseRef?.title || "",
    }));

    return success(res, data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const getPending = async (req, res, next) => {
  try {
    const filter = {
      status: "pending",
      isDeleted: { $ne: true },
      uploadedBy: { $ne: req.user.id },
    };

    if (req.user.role === "mentor") {
      const myCourses = await Course.find({
        instructorRef: req.user.id,
        isDeleted: { $ne: true },
      })
        .select("_id title")
        .lean();

      console.log("[DEBUG] Mentor ID:", req.user.id);
      console.log("[DEBUG] My courses:", myCourses.map(c => ({ id: c._id, title: c.title })));
      console.log("[DEBUG] Course IDs for filter:", myCourses.map((c) => c._id.toString()));

      filter.courseRef = { $in: myCourses.map((c) => c._id) };
    }

    console.log("[DEBUG] Material filter:", JSON.stringify(filter));

    const result = await paginate(Material, filter, {
      page: req.query.page || 1,
      limit: Math.min(50, req.query.limit || 20),
      sort: { createdAt: 1 },
      populate: [
        { path: "uploadedBy", select: "name email" },
        { path: "courseRef", select: "title code" },
      ],
    });

    console.log("[DEBUG] Result count:", result.data.length);
    console.log("[DEBUG] Result meta:", result.meta);

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const createMaterial = async (req, res, next) => {
  try {
    const {
      title,
      courseId,
      yearId,
      sectionLabel,
      type,
      fileUrl,
      storagePath,
      size,
      mimeType,
    } = req.body;

    if (!title?.trim()) return badRequest(res, "title is required");
    if (!fileUrl) return badRequest(res, "fileUrl is required");

    const status = req.user.role === "student" ? "pending" : "approved";

    const material = await Material.create({
      title: title.trim(),
      type: type || "Other",
      size: size || "",
      fileUrl,
      storagePath: storagePath || "",
      courseRef: courseId || null,
      uploadedBy: req.user.id,
      uploaderRole: req.user.role,
      status,
      sectionLabel: sectionLabel || "",
      yearId: yearId || "",
    });

    await logAction({
      action: "UPLOAD",
      entity: "Material",
      entityId: material._id,
      entityName: material.title,
      performedBy: req.user,
      req,
      details: { courseId, status, type },
    });

    return created(res, material);
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
      details: { feedback: req.body?.feedback },
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
      details: { feedback: req.body?.feedback },
    });

    return success(res, material);
  } catch (err) {
    next(err);
  }
};

const remove = async (req, res, next) => {
  try {
    const filter = { _id: req.params.id };
    if (req.user.role === "student") {
      filter.uploadedBy = req.user.id;
    }

    const material = await Material.findOneAndUpdate(
      filter,
      { isDeleted: true, deletedAt: new Date(), deletedBy: req.user.id },
      { new: true },
    );

    if (!material) return notFound(res, "Material not found or access denied");

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
  createMaterial,
  approve,
  reject,
  remove,
};
