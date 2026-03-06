const mongoose = require("mongoose");

const SemesterSchema = new mongoose.Schema({
  name: {
    type: String,
    enum: ["Fall", "Spring", "Summer"],
    required: true,
  },
  academicYear: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "AcademicYear", // Relates to the AcademicYear model
    required: true,
  },
  isCurrent: {
    type: Boolean,
    default: false,
  }
}, { timestamps: true });

module.exports = mongoose.model("Semester", SemesterSchema);