// models/Course.js
const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  courseCode: {
    type: String,
    required: true,
    unique: true
  },
  courseName: {
    type: String,
    required: true
  },
  semesterId: {  //reference to Semester
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',  
    required: true
  },
  instructor: String,
  creditHours: Number
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);