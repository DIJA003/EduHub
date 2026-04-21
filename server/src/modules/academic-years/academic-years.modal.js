const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema(
  {
    year: {
      type: Number,
      required: true,
      enum: [1, 2, 3, 4],
      unique: true,
    },
    name: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

academicYearSchema.index({ year: 1 });

module.exports = mongoose.model("AcademicYear", academicYearSchema);
