const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true 
  },

  course: { 
    type: String, 
    trim: true 
  },

  type: { 
    type: String, 
    enum: ['PDF', 'Slides', 'Video', 'ZIP', 'Other'], 
    default: 'PDF' 
  },

  size: { 
    type: String, 
    default: '' 
  },

  uploader: { 
    type: String, 
    trim: true 
  },


  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },

  fileUrl: { 
    type: String, 
    default: '' 
  },


  courseRef: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course' 
  },


  uploaderId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  }

}, { timestamps: true });

module.exports = mongoose.model('Material', materialSchema);