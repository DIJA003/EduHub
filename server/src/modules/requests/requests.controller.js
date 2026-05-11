const Request = require("./request.model");
const Faculty = require("../faculties/faculty.model");
const Program = require("../programs/program.model");
const { success, created, notFound, badRequest, forbidden } = require("../../shared/response");
const { logAction } = require("../../shared/logger");
const { notify } = require("../notifications/notifications.service");
const { paginate } = require("../../shared/pagination");

const getMyRequests = async (req, res, next) => {
  try {
    const requests = await Request.find({
      requester: req.user.id,
      isDeleted: { $ne: true },
    })
      .populate("faculty", "code name")
      .populate("course", "code title")
      .sort({ createdAt: -1 })
      .lean();

    return success(res, requests);
  } catch (err) {
    next(err);
  }
};

const getPendingForFaculty = async (req, res, next) => {
  try {
    const { facultyId } = req.params;

    const requests = await Request.find({
      faculty: facultyId,
      status: "pending",
      isDeleted: { $ne: true },
    })
      .populate("requester", "name email")
      .populate("faculty", "code name")
      .populate("course", "code title")
      .sort({ createdAt: 1 })
      .lean();

    return success(res, requests);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { type, faculty, year, semester, course, title, message, requestedData } = req.body;

    // Handle general request types (add_faculty, add_program, support, general)
    const generalTypes = ["add_faculty", "add_program", "support", "general"];
    if (generalTypes.includes(type)) {
      if (!title?.trim() && !message?.trim()) {
        return badRequest(res, "Title or message is required for general requests");
      }

      // For add_faculty/add_program, validate requestedData
      if ((type === "add_faculty" || type === "add_program") && !requestedData) {
        return badRequest(res, "Requested data is required for faculty/program requests");
      }

      const request = await Request.create({
        requester: req.user.id,
        type,
        title: title?.trim() || "",
        message: message?.trim() || "",
        requestedData: requestedData || null,
        faculty: faculty || null,
      });

      await logAction({
        action: "CREATE",
        entity: "Request",
        entityId: request._id,
        entityName: `${type} request`,
        performedBy: req.user,
        req,
        details: { type, title, requestedData },
      });

      // Notify all admins
      await notify({
        recipient: null, // Will be broadcast to admins
        sender: req.user.id,
        type: "system",
        title: `New ${type} request`,
        message: `${req.user.name} submitted a ${type} request: ${title || message?.substring(0, 50)}`,
        metadata: { requestId: request._id, type },
      });

      return created(res, request);
    }

    // Handle enrollment/course requests (original logic)
    if (!type || !faculty || !year || !semester) {
      return badRequest(res, "Type, faculty, year, and semester are required");
    }

    // Validate faculty exists
    const facultyDoc = await Faculty.findById(faculty);
    if (!facultyDoc || facultyDoc.isDeleted) {
      return badRequest(res, "Invalid faculty");
    }

    // Check if faculty has this year and semester
    const yearData = facultyDoc.years.find((y) => y.year === year && y.active);
    if (!yearData) {
      return badRequest(res, "Invalid year for this faculty");
    }

    const semesterData = yearData.semesters.find((s) => s.number === semester && s.active);
    if (!semesterData) {
      return badRequest(res, "Invalid semester for this year");
    }

    // Check for existing pending request
    const existing = await Request.findOne({
      requester: req.user.id,
      faculty,
      year,
      semester,
      status: "pending",
    });

    if (existing) {
      return badRequest(res, "You already have a pending request for this faculty/year/semester");
    }

    const request = await Request.create({
      requester: req.user.id,
      type,
      faculty,
      year,
      semester,
      course: course || null,
      message: message?.trim() || "",
    });

    await logAction({
      action: "CREATE",
      entity: "Request",
      entityId: request._id,
      entityName: `${type} request`,
      performedBy: req.user,
      req,
      details: { faculty, year, semester },
    });

    // Notify faculty dean or admins
    if (facultyDoc.dean) {
      await notify({
        recipient: facultyDoc.dean,
        sender: req.user.id,
        type: "system",
        title: "New enrollment request",
        message: `New ${type} request from ${req.user.name} for ${facultyDoc.name} Year ${year}, Semester ${semester}`,
        metadata: { requestId: request._id },
      });
    }

    return created(res, request);
  } catch (err) {
    next(err);
  }
};

// Public request creation (for pre-registration)
const createPublic = async (req, res, next) => {
  try {
    const { type, faculty, title, message, requestedData, guestInfo } = req.body;

    // Only allow certain request types for public submissions
    const allowedTypes = ["add_faculty", "add_program", "support", "general"];
    if (!allowedTypes.includes(type)) {
      return badRequest(res, "Invalid request type for public submission");
    }

    if (!title?.trim() && !message?.trim()) {
      return badRequest(res, "Title or message is required");
    }

    // For add_faculty/add_program, validate requestedData
    if ((type === "add_faculty" || type === "add_program") && !requestedData) {
      return badRequest(res, "Requested data is required for faculty/program requests");
    }

    const request = await Request.create({
      requester: null, // No user yet
      type,
      title: title?.trim() || "",
      message: message?.trim() || "",
      requestedData: requestedData || null,
      faculty: faculty || null,
      guestInfo: {
        name: guestInfo?.name || "",
        email: guestInfo?.email || "",
      },
    });

    await logAction({
      action: "CREATE",
      entity: "Request",
      entityId: request._id,
      entityName: `${type} request`,
      performedBy: { name: guestInfo?.name || "Guest", email: guestInfo?.email || "", role: "guest" },
      req,
      details: { type, title, requestedData, guestInfo },
    });

    // Notify all admins
    await notify({
      recipient: null, // Will be broadcast to admins
      sender: null,
      type: "system",
      title: `New public ${type} request`,
      message: `Guest (${guestInfo?.email || "unknown"}) submitted a ${type} request: ${title || message?.substring(0, 50)}`,
      metadata: { requestId: request._id, type, isPublic: true },
    });

    return created(res, request);
  } catch (err) {
    next(err);
  }
};

const review = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, responseMessage, action } = req.body;

    if (!["approved", "rejected"].includes(status)) {
      return badRequest(res, "Status must be approved or rejected");
    }

    const request = await Request.findById(id);
    if (!request || request.isDeleted) {
      return notFound(res, "Request not found");
    }

    if (request.status !== "pending") {
      return badRequest(res, "Request has already been reviewed");
    }

    // Check if reviewer has permission (admin or faculty dean)
    const isAdmin = req.user.role === "admin";
    let hasPermission = isAdmin;

    // For enrollment requests, also allow faculty dean
    if (["enrollment", "mentor_assignment", "course_access"].includes(request.type)) {
      const faculty = await Faculty.findById(request.faculty);
      const isDean = faculty?.dean?.toString() === req.user.id;
      hasPermission = isAdmin || isDean;
    }

    if (!hasPermission) {
      return forbidden(res, "You don't have permission to review this request");
    }

    // If approving add_faculty/add_program and action is "create", create the entity
    let createdEntity = null;
    if (status === "approved" && (request.type === "add_faculty" || request.type === "add_program") && action === "create") {
      try {
        if (request.type === "add_faculty" && request.requestedData) {
          const { code, name, description } = request.requestedData;
          if (code && name) {
            const existingFaculty = await Faculty.findOne({ code: code.toUpperCase() });
            if (!existingFaculty) {
              createdEntity = await Faculty.create({
                code: code.toUpperCase(),
                name,
                description: description || "",
                createdBy: req.user.id,
              });
            }
          }
        } else if (request.type === "add_program" && request.requestedData) {
          const { code, name, facultyId, description } = request.requestedData;
          if (code && name && facultyId) {
            const existingProgram = await Program.findOne({ code: code.toUpperCase() });
            if (!existingProgram) {
              createdEntity = await Program.create({
                code: code.toUpperCase(),
                name,
                faculty: facultyId,
                description: description || "",
                createdBy: req.user.id,
              });
            }
          }
        }
      } catch (createErr) {
        console.error("Error creating entity from request:", createErr);
      }
    }

    request.status = status;
    request.reviewedBy = req.user.id;
    request.reviewedAt = new Date();
    request.responseMessage = responseMessage?.trim() || "";
    await request.save();

    await logAction({
      action: status.toUpperCase(),
      entity: "Request",
      entityId: request._id,
      entityName: `${request.type} request`,
      performedBy: req.user,
      req,
      details: { responseMessage, createdEntity: createdEntity?._id },
    });

    // Notify requester
    await notify({
      recipient: request.requester,
      sender: req.user.id,
      type: "system",
      title: `Request ${status}`,
      message: `Your ${request.type} request has been ${status}.${responseMessage ? ` Message: ${responseMessage}` : ""}`,
      metadata: { requestId: request._id, status, createdEntity: createdEntity?._id },
    });

    return success(res, { request, createdEntity });
  } catch (err) {
    next(err);
  }
};

const cancel = async (req, res, next) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      requester: req.user.id,
      status: "pending",
    });

    if (!request) {
      return notFound(res, "Request not found or already processed");
    }

    request.status = "cancelled";
    await request.save();

    return success(res, { cancelled: true });
  } catch (err) {
    next(err);
  }
};

// Admin: Get all requests with pagination and filters
const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status = "", type = "" } = req.query;

    const filter = { isDeleted: { $ne: true } };
    if (status) filter.status = status;
    if (type) filter.type = type;

    const result = await paginate(Request, filter, {
      page,
      limit: Math.min(100, limit),
      sort: { createdAt: -1 },
      populate: [
        { path: "requester", select: "name email role" },
        { path: "faculty", select: "code name" },
        { path: "reviewedBy", select: "name" },
      ],
    });

    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

// Get request by ID
const getById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id)
      .populate("requester", "name email role")
      .populate("faculty", "code name")
      .populate("course", "code title")
      .populate("reviewedBy", "name")
      .lean();

    if (!request || request.isDeleted) {
      return notFound(res, "Request not found");
    }

    return success(res, request);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getMyRequests,
  getPendingForFaculty,
  create,
  createPublic,
  review,
  cancel,
  getAll,
  getById,
};
