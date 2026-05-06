const { body, param, validationResult } = require("express-validator");

exports.handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

exports.collegeRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("College name is required")
    .isLength({ max: 200 }),
  body("years")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Years must be 1-10"),
  body("semesters").optional().isInt({ min: 1, max: 6 }),
  body("status").optional().isIn(["Active", "Inactive"]),
];

exports.courseRules = [
  body("code")
    .trim()
    .notEmpty()
    .withMessage("Course code is required")
    .isLength({ max: 20 }),
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Course title is required")
    .isLength({ max: 200 }),
  body("status").optional().isIn(["Draft", "Published", "Archived"]),
  body("students").optional().isInt({ min: 0 }),
];

exports.materialRules = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("type").isIn(["PDF", "Slides", "Video", "ZIP", "Other"]),
  body("status").optional().isIn(["Draft", "Active", "Archived", "Rejected"]),
];

exports.registerRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 }),
];
