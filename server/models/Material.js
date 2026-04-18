const mongoose = require("mongoose");

const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, trim: true },
    type: {
      type: String,
      enum: ["PDF", "Slides", "Video", "ZIP", "Other"],
      default: "PDF",
    },
    size: { type: String, default: "" },
    uploader: { type: String, trim: true },
    status: {
      type: String,
      enum: [
        "Draft",
        "pending",
        "Active",
        "approved",
        "Archived",
        "Rejected",
        "rejected",
      ],
      default: "Draft",
    },
    fileUrl: { type: String, default: "" },
    storagePath: { type: String, default: "" },
    courseRef: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    uploadedByRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    uploaderRole: {
      type: String,
      enum: ["student", "mentor", "admin"],
      default: "mentor",
    },
    mentorFeedback: { type: String, default: "" },
    yearId: { type: String, default: "" },
    courseId: { type: String, default: "" },
    sectionId: { type: String, default: "" },
    sectionLabel: { type: String, default: "" },
    uploaded: { type: String, default: "" },
  },
  { timestamps: true },
);

materialSchema.index({ courseRef: 1, status: 1 });
materialSchema.index({ uploadedByRef: 1 });
materialSchema.index({ uploaderRole: 1, status: 1 });
materialSchema.index({ isDeleted: 1, status: 1 });

module.exports = mongoose.model("Material", materialSchema);
