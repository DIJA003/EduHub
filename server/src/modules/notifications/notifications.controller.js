const notifService = require("./notifications.service");
const { success } = require("../../shared/response");

const getAll = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, unreadOnly = "false" } = req.query;
    const result = await notifService.getForUser(req.user.id, {
      page: parseInt(page),
      limit: parseInt(limit),
      unreadOnly: unreadOnly === "true",
    });
    return success(res, result.data, 200, result.meta);
  } catch (err) {
    next(err);
  }
};

const markRead = async (req, res, next) => {
  try {
    const n = await notifService.markRead(req.params.id, req.user.id);
    return success(res, n);
  } catch (err) {
    next(err);
  }
};

const markAllRead = async (req, res, next) => {
  try {
    await notifService.markAllRead(req.user.id);
    return success(res, { marked: true });
  } catch (err) {
    next(err);
  }
};

const deleteOne = async (req, res, next) => {
  try {
    await notifService.deleteOne(req.params.id, req.user.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

const deleteAll = async (req, res, next) => {
  try {
    await notifService.deleteAll(req.user.id);
    return success(res, { deleted: true });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAll,
  markRead,
  markAllRead,
  deleteOne,
  deleteAll,
};
