const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "CREATE",
        "UPDATE",
        "DELETE",
        "RESTORE",
        "LOGIN",
        "REGISTER",
        "LOGOUT",
        "PASSWORD_CHANGE",
        "EMAIL_VERIFY",
        "ENROLL",
        "UNENROLL",
        "APPROVE",
        "REJECT",
        "UPLOAD",
        "ERROR",
      ],
      required: true,
    },

    entity: {
      type: String,
      enum: [
        "College",
        "Course",
        "Material",
        "User",
        "Enrollment",
        "Session",
        "Notification",
        "AcademicYear",
        "System",
      ],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, default: null },
    entityName: { type: String, default: "" },

    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: { type: String, default: "System" },
      email: { type: String, default: "" },
      role: { type: String, default: "" },
    },

    ip: { type: String, default: "" },
    userAgent: { type: String, default: "" },

    details: { type: mongoose.Schema.Types.Mixed, default: {} },

    success: { type: Boolean, default: true },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

LogSchema.index({ entity: 1, createdAt: -1 });
LogSchema.index({ action: 1, createdAt: -1 });
LogSchema.index({ "performedBy.userId": 1, createdAt: -1 });
LogSchema.index({ createdAt: -1 });
LogSchema.index({ success: 1 });

module.exports = mongoose.model("Log", LogSchema);
