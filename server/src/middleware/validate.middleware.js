const { badRequest } = require("../shared/response");

const isString = (val) => typeof val === "string";
const isNumber = (val) => typeof val === "number" && !isNaN(val);

const validators = {
  required: (val) =>
    val !== undefined && val !== null && val !== ""
      ? null
      : "Field is required",
  string: (val) =>
    val === undefined || isString(val) ? null : "Must be a string",
  minLength: (min) => (val) =>
    !val || val.length >= min ? null : `Minimum ${min} characters required`,
  maxLength: (max) => (val) =>
    !val || val.length <= max ? null : `Maximum ${max} characters allowed`,
  email: (val) =>
    !val || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      ? null
      : "Invalid email address",
  oneOf: (options) => (val) =>
    !val || options.includes(val)
      ? null
      : `Must be one of: ${options.join(", ")}`,
  isInt: (val) =>
    val === undefined || Number.isInteger(Number(val))
      ? null
      : "Must be an integer",
  min: (min) => (val) =>
    val === undefined || Number(val) >= min ? null : `Minimum value is ${min}`,
  max: (max) => (val) =>
    val === undefined || Number(val) <= max ? null : `Maximum value is ${max}`,
};

const validate = (schema) => (req, res, next) => {
  const errors = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = req.body[field];
    for (const rule of rules) {
      const err = typeof rule === "function" ? rule(value) : null;
      if (err) {
        errors.push({ field, message: err });
        break;
      }
    }
  }

  if (errors.length > 0) {
    return badRequest(res, "Validation failed", errors);
  }

  next();
};

module.exports = { validate, validators };
