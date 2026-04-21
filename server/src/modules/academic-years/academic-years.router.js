const express = require("express");
const router = express.Router();
const AcademicYear = require("./academic-years.model");
const { verifyToken } = require("../../middleware/auth.middleware");
const { adminOnly } = require("../../middleware/role.middleware");
const { paginate } = require("../../shared/pagination");
const {
  success,
  created,
  notFound,
  conflict,
} = require("../../shared/response");
const { logAction } = require("../../shared/logger");

router.get("/", verifyToken, async (req, res, next) => {
  try {
    const result = await paginate(
      AcademicYear,
      {},
      { sort: { year: 1 }, limit: 10 },
    );
    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
});

router.get("/:id", verifyToken, async (req, res, next) => {
  try {
    const ay = await AcademicYear.findById(req.params.id).lean();
    if (!ay) return notFound(res, "Academic year not found");
    return success(res, ay);
  } catch (err) {
    next(err);
  }
});

router.post("/", verifyToken, adminOnly, async (req, res, next) => {
  try {
    const { year, name, description } = req.body;
    if (!year)
      return res
        .status(400)
        .json({ success: false, message: "year is required" });

    const exists = await AcademicYear.findOne({ year });
    if (exists) return conflict(res, `Academic year ${year} already exists`);

    const ay = await AcademicYear.create({
      year,
      name: name || `Year ${year}`,
      description: description || "",
      createdBy: req.user.id,
    });

    await logAction({
      action: "CREATE",
      entity: "AcademicYear",
      entityId: ay._id,
      entityName: `Year ${ay.year}`,
      performedBy: req.user,
      req,
    });

    return created(res, ay);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", verifyToken, adminOnly, async (req, res, next) => {
  try {
    const ay = await AcademicYear.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          name: req.body.name,
          description: req.body.description,
          isActive: req.body.isActive,
        },
      },
      { new: true, runValidators: true },
    );
    if (!ay) return notFound(res, "Academic year not found");

    await logAction({
      action: "UPDATE",
      entity: "AcademicYear",
      entityId: ay._id,
      entityName: `Year ${ay.year}`,
      performedBy: req.user,
      req,
    });

    return success(res, ay);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
