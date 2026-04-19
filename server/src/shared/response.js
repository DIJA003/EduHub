const success = (res, data, statusCode = 200, meta = {}) => {
  const payload = { success: true, data };
  if (Object.keys(meta).length) payload.meta = meta;
  return res.status(statusCode).json(payload);
};

const created = (res, data) => success(res, data, 201);

const noContent = (res) => res.status(204).send();

const error = (res, message, statusCode = 500, errors = null) => {
  const payload = { success: false, message };
  if (errors) payload.errors = errors;
  return res.status(statusCode).json(payload);
};

const notFound = (res, message = "Resource not found") =>
  error(res, message, 404);

const forbidden = (res, message = "Access denied") => error(res, message, 403);

const badRequest = (res, message, errors = null) =>
  error(res, message, 400, errors);

const unauthorized = (res, message = "Unauthorized") =>
  error(res, message, 401);

module.exports = {
  success,
  created,
  noContent,
  error,
  notFound,
  forbidden,
  badRequest,
  unauthorized,
};
