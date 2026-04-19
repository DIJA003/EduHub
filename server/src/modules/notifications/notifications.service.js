const Notification = require("./notification.model");

const notify = async ({
  recipient,
  sender,
  type,
  title,
  message,
  metadata = {},
}) => {
  if (!recipient || !message) return;
  try {
    await Notification.create({
      recipient,
      sender,
      type,
      title,
      message,
      metadata,
    });
  } catch (err) {
    console.error(
      "[NotificationService] Failed to create notification:",
      err.message,
    );
  }
};

const notifyMany = async (recipients, payload) => {
  const notifications = recipients.map((recipient) => ({
    ...payload,
    recipient,
  }));
  try {
    await Notification.insertMany(notifications, { ordered: false });
  } catch (err) {
    console.error("[NotificationService] Failed to bulk notify:", err.message);
  }
};

const getForUser = async (userId, options = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;

  const filter = { recipient: userId, isDeleted: false };
  if (unreadOnly) filter.isRead = false;

  const skip = (page - 1) * limit;

  const [data, total, unreadCount] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notification.countDocuments(filter),
    Notification.countDocuments({
      recipient: userId,
      isDeleted: false,
      isRead: false,
    }),
  ]);

  return {
    data,
    meta: { total, page, limit, pages: Math.ceil(total / limit), unreadCount },
  };
};

const markRead = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isRead: true },
    { new: true },
  );
};

const markAllRead = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isRead: false, isDeleted: false },
    { isRead: true },
  );
};

const deleteOne = async (notificationId, userId) => {
  return Notification.findOneAndUpdate(
    { _id: notificationId, recipient: userId },
    { isDeleted: true },
    { new: true },
  );
};

const deleteAll = async (userId) => {
  return Notification.updateMany(
    { recipient: userId, isDeleted: false },
    { isDeleted: true },
  );
};

module.exports = {
  notify,
  notifyMany,
  getForUser,
  markRead,
  markAllRead,
  deleteOne,
  deleteAll,
};
