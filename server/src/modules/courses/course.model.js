const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
      index: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Program",
      default: null,
      index: true,
    },
    yearId: {
      type: Number,
      min: 1,
      max: 7,
      index: true,
    },
    semester: {
      type: Number,
      min: 1,
      max: 3,
      index: true,
    },
    academicYearRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AcademicYear",
      default: null,
    },
    instructor: {
      type: String,
      trim: true,
      default: "TBA",
    },
    instructorRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    creditHours: {
      type: Number,
      default: 3,
      min: 1,
      max: 6,
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Draft",
      index: true,
    },
    students: {
      type: Number,
      default: 0,
      min: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isDeleted: { type: Boolean, default: false, index: true },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  },
);

courseSchema.index({ status: 1, isDeleted: 1 });
courseSchema.index({ instructorRef: 1, isDeleted: 1 });
courseSchema.index({ faculty: 1, yearId: 1, semester: 1, status: 1, isDeleted: 1 });

module.exports = mongoose.model("Course", courseSchema);
