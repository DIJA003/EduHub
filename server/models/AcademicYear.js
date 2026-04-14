const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
      enum: [1, 2, 3, 4],
    },
    name: { type: String, trim: true },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

academicYearSchema.index({ year: 1 }, { unique: true });
academicYearSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
