const mongoose = require("mongoose");
const AcademicYearSchema = new mongoose.Schema({
  year: {
    type: String, // Must be in "YYYY-YYYY" format, e.g., "2024-2025"
    required: true,
    unique: true,
    trim: true,
  },
  isCurrent: {
    type: Boolean,
    default: false, 
  }
}, { timestamps: true });

module.exports = mongoose.model("AcademicYear", AcademicYearSchema);