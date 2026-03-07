const mongoose = require("mongoose");

const MaterialSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  fileUrl: {
    type: String, // The download link from Firebase Storage, Cloudinary, etc.
    required: true,
  },
  fileType: {
    type: String,
    enum: ["pdf", "video", "document", "other"],
    default: "other",
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course", // Relates to the Course model
    required: true,
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // Relates to the User who uploaded it
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "approved", 
  }
}, { timestamps: true });

module.exports = mongoose.model("Material", MaterialSchema);