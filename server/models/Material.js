const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },
  course:    { type: String, trim: true },      
  type:      { type: String, default: 'File' },
  size:      { type: String, default: '' },
  uploader:  { type: String, trim: true },
  status:    { 
    type: String, 
    enum: ['Pending', 'Approved', 'Draft', 'Active', 'Archived'], 
    default: 'Pending' 
  },
  fileUrl:   { type: String, default: '' },
  courseRef:     { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  uploadedByRef: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);