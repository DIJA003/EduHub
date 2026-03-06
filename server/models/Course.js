const mongoose = require("mongoose");

const CourseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  code: {
    type: String, // e.g., "CS-101"
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Semester", // Relates to the Semester model
    required: true,
  },
  mentors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Array of User IDs who are mentors for this course
  }],
  isActive: {
    type: Boolean,
    default: true,
  }
}, { timestamps: true });

module.exports = mongoose.model("Course", CourseSchema);