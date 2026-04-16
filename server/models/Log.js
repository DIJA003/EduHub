const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "RESTORE"],
      required: true,
    },
    entity: {
      type: String,
      enum: ["College", "Course", "Material", "User"],
      required: true,
    },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
    entityName: { type: String, default: "" },
    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null,
      },
      name: { type: String, default: "System" },
      email: { type: String, default: "" },
    },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true },
);

LogSchema.index({ entity: 1, createdAt: -1 });
LogSchema.index({ action: 1, createdAt: -1 });
LogSchema.index({ "performedBy.userId": 1 });

module.exports = mongoose.model("Log", LogSchema);
