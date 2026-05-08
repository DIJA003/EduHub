const mongoose = require("mongoose");

const MATERIAL_TYPES = ["PDF", "Video", "Slides", "ZIP", "Image", "Other"];
const MATERIAL_STATUSES = ["pending", "approved", "rejected", "draft"];

const materialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: MATERIAL_TYPES,
      default: "Other",
    },
    status: {
      type: String,
      enum: MATERIAL_STATUSES,
      default: "pending",
      index: true,
    },
    fileUrl: {
      type: String,
      default: "",
    },
    storagePath: {
      type: String,
      default: "",
    },
    originalName: {
      type: String,
      default: "",
    },
    size: {
      type: String,
      default: "",
    },
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    uploaderRole: {
      type: String,
      enum: ["student", "mentor", "admin"],
      required: true,
    },
    mentorFeedback: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },

    sectionId: { type: String, default: "" },
    sectionLabel: { type: String, default: "" },
    yearId: { type: String, default: "" },

    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

materialSchema.index({ courseRef: 1, status: 1, isDeleted: 1 });
materialSchema.index({ uploadedBy: 1, isDeleted: 1 });

module.exports = mongoose.model("Material", materialSchema);

module.exports.MATERIAL_TYPES = MATERIAL_TYPES;
module.exports.MATERIAL_STATUSES = MATERIAL_STATUSES;
