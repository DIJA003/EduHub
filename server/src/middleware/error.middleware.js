const { error } = require("../shared/response");

class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.status = statusCode;
  }
}

const errorHandler = (err, req, res, next) => {
  if (!err.statusCode || err.statusCode >= 500) {
    console.error(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`,
      {
        message: err.message,
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      },
    );
  }

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
    return error(res, `Invalid ${err.path}: "${err.value}"`, 400);
  }

  if (err instanceof AppError || err.name === "AppError") {
    return error(res, err.message, err.statusCode || 500);
  }

  if (err.code && err.code.startsWith("auth/")) {
    return error(res, err.message, 400);
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

module.exports = { errorHandler, notFoundHandler, AppError };
