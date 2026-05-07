const Log = require("../modules/logs/log.model");

const logAction = async ({
  action,
  entity,
  entityId = null,
  entityName = "",
  performedBy = null,
  details = {},
  req = null,
  success = true,
  errorMessage = "",
}) => {
  try {
    const ip = req
      ? req.headers["x-forwarded-for"]?.split(",")[0]?.trim() ||
        req.socket?.remoteAddress ||
        ""
      : "";

    await Log.create({
      action,
      entity,
      entityId,
      entityName,
      performedBy: {
        userId: performedBy?.id || null,
        name: performedBy?.name || "System",
        email: performedBy?.email || "",
        role: performedBy?.role || "",
      },
      ip,
      userAgent: req?.headers?.["user-agent"] || "",
      details,
      success,
      errorMessage,
    });
  } catch (err) {
    console.error("[Logger] Failed to write log:", err.message);
  }
};

module.exports = { logAction };
