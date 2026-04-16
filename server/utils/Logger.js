const Log = require("../models/Log");

const logAction = async ({
  action,
  entity,
  entityId,
  entityName,
  performedBy,
  details,
}) => {
  try {
    await Log.create({
      action,
      entity,
      entityId,
      entityName: entityName || "",
      performedBy: {
        userId: performedBy?.id || null,
        name: performedBy?.name || "System",
        email: performedBy?.email || "",
      },
      details: details || {},
    });
  } catch (err) {
    console.error("[Log] Failed to write log entry:", err.message);
  }
};

module.exports = { logAction };
