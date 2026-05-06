const mongoose = require("mongoose");

<<<<<<< HEAD
const materialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: String, trim: true },
    type: {
      type: String,
      enum: ["PDF", "Slides", "Video", "ZIP", "Other"],
      default: "PDF",
    },
    size: { type: String, default: "" },
    uploader: { type: String, trim: true },
=======
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
>>>>>>> FadyRiad-upload

    // pending = student upload awaiting mentor review
    // approved = mentor approved (visible to all)
    // rejected = mentor rejected
    // Draft = mentor draft (not yet published)
    // Active = mentor published/approved
    // Archived = archived
    status: {
      type: String,
      enum: ["Draft", "Active", "Archived", "pending", "approved", "rejected"],
      default: "Draft",
    },

    fileUrl: { type: String, default: "" },
    courseRef: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
    uploadedByRef: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    uploaderRole: { type: String, enum: ["student", "mentor", "admin"], default: "mentor" },
    mentorFeedback: { type: String, default: "" },
    yearId: { type: String, default: "" },
    courseId: { type: String, default: "" },
    sectionId: { type: String, default: "" },
    sectionLabel: { type: String, default: "" },
  },
  { timestamps: true },
);

materialSchema.index({ courseRef: 1, status: 1 });
materialSchema.index({ uploadedByRef: 1 });
materialSchema.index({ uploaderRole: 1, status: 1 });

module.exports = mongoose.model("Material", materialSchema);