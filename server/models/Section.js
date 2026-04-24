const mongoose = require("mongoose");

const sectionSchema = new mongoose.Schema(
  {
    courseRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title:     { type: String, required: true, trim: true },
    summary:   { type: String, default: "" },
    body:      { type: String, default: "" },
    order:     { type: Number, default: 0 },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

sectionSchema.index({ courseRef: 1, order: 1 });

module.exports = mongoose.model("Section", sectionSchema);