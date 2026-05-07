const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      enum: [
        "material_submitted",
        "material_approved",
        "material_rejected",
        "system",
      ],
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    metadata: {
      materialRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Material",
        default: null,
      },
      courseRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
        default: null,
      },
    },
  },
  { timestamps: true },
);

notificationSchema.index({ recipient: 1, isRead: 1, isDeleted: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
