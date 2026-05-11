const Settings = require("./settings.model");
const { logAction } = require("../../shared/logger");
const { success, notFound, badRequest } = require("../../shared/response");

// Default settings
const DEFAULT_SETTINGS = [
  {
    key: "platform_name",
    value: "EduHub",
    type: "string",
    description: "Platform display name",
    category: "general",
    isPublic: true,
  },
  {
    key: "allow_self_registration",
    value: true,
    type: "boolean",
    description: "Allow users to register themselves",
    category: "general",
    isPublic: true,
  },
  {
    key: "require_email_verification",
    value: true,
    type: "boolean",
    description: "Require email verification before accessing platform",
    category: "security",
    isPublic: false,
  },
  {
    key: "max_upload_size_mb",
    value: 50,
    type: "number",
    description: "Maximum file upload size in MB",
    category: "general",
    isPublic: true,
  },
  {
    key: "allowed_file_types",
    value: ["pdf", "doc", "docx", "ppt", "pptx", "mp4", "mov", "avi"],
    type: "array",
    description: "Allowed file types for uploads",
    category: "general",
    isPublic: true,
  },
  {
    key: "academic_year_start_month",
    value: 9,
    type: "number",
    description: "Month when academic year starts (1-12)",
    category: "academic",
    isPublic: true,
  },
  {
    key: "default_semester_count",
    value: 3,
    type: "number",
    description: "Default number of semesters per year",
    category: "academic",
    isPublic: true,
  },
  {
    key: "enable_notifications",
    value: true,
    type: "boolean",
    description: "Enable system notifications",
    category: "notifications",
    isPublic: false,
  },
  {
    key: "maintenance_mode",
    value: false,
    type: "boolean",
    description: "Enable maintenance mode",
    category: "general",
    isPublic: true,
  },
  {
    key: "theme_primary_color",
    value: "#10b981",
    type: "string",
    description: "Primary theme color",
    category: "appearance",
    isPublic: true,
  },
  {
    key: "contact_email",
    value: "support@eduhub.edu",
    type: "string",
    description: "Platform contact email",
    category: "general",
    isPublic: true,
  },
  {
    key: "session_timeout_minutes",
    value: 60,
    type: "number",
    description: "User session timeout in minutes",
    category: "security",
    isPublic: false,
  },
];

// Initialize default settings
const initializeSettings = async () => {
  try {
    for (const setting of DEFAULT_SETTINGS) {
      await Settings.findOneAndUpdate(
        { key: setting.key },
        { $setOnInsert: setting },
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error("Failed to initialize settings:", err);
  }
};

// Get all settings (admin)
const getAllSettings = async (req, res, next) => {
  try {
    const { category = "" } = req.query;
    const filter = {};
    if (category) filter.category = category;

    const settings = await Settings.find(filter).sort({ category: 1, key: 1 }).lean();
    return success(res, settings);
  } catch (err) {
    next(err);
  }
};

// Get public settings (no auth required)
const getPublicSettings = async (req, res, next) => {
  try {
    const settings = await Settings.find({ isPublic: true }).select("key value type").lean();
    const result = {};
    settings.forEach((s) => {
      result[s.key] = s.value;
    });
    return success(res, result);
  } catch (err) {
    next(err);
  }
};

// Get single setting by key
const getSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const setting = await Settings.findOne({ key }).lean();
    if (!setting) return notFound(res, "Setting not found");
    return success(res, setting);
  } catch (err) {
    next(err);
  }
};

// Update setting
const updateSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const { value, description, isPublic } = req.body;

    const updateData = { updatedBy: req.user.id };
    if (value !== undefined) updateData.value = value;
    if (description !== undefined) updateData.description = description;
    if (isPublic !== undefined) updateData.isPublic = isPublic;

    const setting = await Settings.findOneAndUpdate(
      { key },
      updateData,
      { new: true, runValidators: true }
    );
    if (!setting) return notFound(res, "Setting not found");

    await logAction({
      action: "UPDATE_SETTING",
      entity: "Settings",
      entityId: setting._id,
      entityName: setting.key,
      performedBy: req.user,
      req,
      details: { value: setting.value },
    });

    return success(res, setting);
  } catch (err) {
    next(err);
  }
};

// Bulk update settings
const bulkUpdateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;
    if (!Array.isArray(settings)) {
      return badRequest(res, "Settings array is required");
    }

    const results = [];
    for (const { key, value } of settings) {
      const setting = await Settings.findOneAndUpdate(
        { key },
        { value, updatedBy: req.user.id },
        { new: true, runValidators: true }
      );
      if (setting) results.push(setting);
    }

    await logAction({
      action: "BULK_UPDATE_SETTINGS",
      entity: "Settings",
      entityName: "Multiple Settings",
      performedBy: req.user,
      req,
      details: { count: results.length },
    });

    return success(res, results);
  } catch (err) {
    next(err);
  }
};

// Reset setting to default
const resetSetting = async (req, res, next) => {
  try {
    const { key } = req.params;
    const defaultSetting = DEFAULT_SETTINGS.find((s) => s.key === key);
    if (!defaultSetting) return notFound(res, "Default setting not found");

    const setting = await Settings.findOneAndUpdate(
      { key },
      {
        value: defaultSetting.value,
        updatedBy: req.user.id,
      },
      { new: true }
    );
    if (!setting) return notFound(res, "Setting not found");

    await logAction({
      action: "RESET_SETTING",
      entity: "Settings",
      entityId: setting._id,
      entityName: setting.key,
      performedBy: req.user,
      req,
    });

    return success(res, setting);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  initializeSettings,
  getAllSettings,
  getPublicSettings,
  getSetting,
  updateSetting,
  bulkUpdateSettings,
  resetSetting,
};
