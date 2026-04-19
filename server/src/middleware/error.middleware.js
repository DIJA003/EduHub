const { error } = require("../shared/response");

const errorHandler = (err, req, res, next) => {
  console.error(
    `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
    {
      message: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    },
  );
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return error(res, "Validation failed", 400, errors);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || "field";
    return error(res, `Duplicate value for ${field}`, 409);
  }

  if (err.name === "CastError") {
    return error(res, `Invalid ${err.path}: ${err.value}`, 400);
  }

  if (err.name === "ZodError") {
    return error(res, "Validation failed", 400, err.errors);
  }

  const statusCode = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === "production" && statusCode === 500
      ? "Internal server error"
      : err.message || "Internal server error";

  return error(res, message, statusCode);
};

const notFoundHandler = (req, res) => {
  error(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
};

module.exports = { errorHandler, notFoundHandler };
