const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["material_submitted", "material_approved", "material_rejected"],
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    materialRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Material",
    },
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true
    },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
