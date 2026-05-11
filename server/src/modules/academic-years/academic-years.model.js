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
    facultyRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Academic-year", academicYearSchema);
