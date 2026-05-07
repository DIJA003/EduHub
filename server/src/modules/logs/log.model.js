const mongoose = require("mongoose");

const ACTIONS = [
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
];

const ENTITIES = [
  "College",
  "Course",
  "Material",
  "User",
  "Enrollment",
  "Session",
  "Notification",
  "AcademicYear",
  "System",
];

const logSchema = new mongoose.Schema(
  {
    action: { type: String, enum: ACTIONS, required: true, index: true },
    entity: { type: String, enum: ENTITIES, required: true, index: true },
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
    success: { type: Boolean, default: true, index: true },
    errorMessage: { type: String, default: "" },
  },
  { timestamps: true },
);

logSchema.index({ createdAt: -1 });
logSchema.index({ action: 1, entity: 1, createdAt: -1 });
logSchema.index({ "performedBy.userId": 1, createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
