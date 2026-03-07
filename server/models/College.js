const mongoose = require('mongoose');

const collegeSchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  years:     { type: Number, default: 4, min: 1 },
  semesters: { type: Number, default: 2, min: 1 },
  programs:  { type: Number, default: 0, min: 0 },
  status:    { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('College', collegeSchema);