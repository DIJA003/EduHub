const mongoose = require("mongoose");

const semesterSchema = new mongoose.Schema({
  number: { type: Number, required: true, min: 1, max: 3 },
  name: { type: String, required: true, trim: true },
  active: { type: Boolean, default: true },
});

const yearSchema = new mongoose.Schema({
  year: { type: Number, required: true, min: 1, max: 7 },
  name: { type: String, required: true, trim: true },
  semesters: [semesterSchema],
  active: { type: Boolean, default: true },
  /** When set, only students in this program see this year on the academic path. */
  program: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Program",
    default: null,
  },
});

const facultySchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    years: [yearSchema],
    dean: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
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
  { timestamps: true }
);

facultySchema.index({ status: 1, isDeleted: 1 });

module.exports = mongoose.model("Faculty", facultySchema);
