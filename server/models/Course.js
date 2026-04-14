const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  code:       { type: String, required: true, unique: true, trim: true },
  title:      { type: String, required: true, trim: true },
  college:    { type: String, trim: true },
  instructor: { type: String, trim: true },
  instructorRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  students:   { type: Number, default: 0 },
  status:     { type: String, enum: ['Draft', 'Published', 'Archived'], default: 'Draft' },
  semesterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester' },
  creditHours:{ type: Number },
  createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Course', courseSchema);