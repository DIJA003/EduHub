const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: [true, "Year number is required"],
      min: [1, "Year must be between 1 and 4"],
      max: [4, "Year must be between 1 and 4"],
      enum: { values: [1, 2, 3, 4], message: "Year must be 1, 2, 3, or 4" },
    },
    name: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Creator is required"],
    },
  },
  { timestamps: true },
);

academicYearSchema.index({ year: 1 }, { unique: true });
academicYearSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
