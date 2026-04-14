const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["Spring", "Summer", "Fall"],
    },
    academicYearId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

semesterSchema.index({ academicYearId: 1, name: 1 }, { unique: true });
semesterSchema.index({ academicYearId: 1, createdBy: 1 });

module.exports = mongoose.model("Semester", semesterSchema);
