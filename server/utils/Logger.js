const Log = require("../models/Log");

const logAction = async ({
  action,
  entity,
  entityId,
  entityName,
  performedBy,
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

    const userAgent = req ? req.headers["user-agent"] || "" : "";

    await Log.create({
      action,
      entity,
      entityId: entityId || null,
      entityName: entityName || "",
      performedBy: {
        userId: performedBy?.id || performedBy?.userId || null,
        name: performedBy?.name || "System",
        email: performedBy?.email || "",
        role: performedBy?.role || "",
      },
      ip,
      userAgent,
      details,
      success,
      errorMessage,
    });
  } catch (err) {
    console.error("[Logger] Failed to write log entry:", err.message);
  }
};

module.exports = { logAction };
