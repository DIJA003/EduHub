const mongoose = require("mongoose");

const REQUEST_TYPES = [
  "enrollment",
  "mentor_assignment",
  "course_access",
  "add_faculty",
  "add_program",
  "support",
  "general",
];
const REQUEST_STATUSES = ["pending", "approved", "rejected", "cancelled"];

const requestSchema = new mongoose.Schema(
  {
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    // For public/guest requests (pre-registration)
    guestInfo: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
    },
    type: {
      type: String,
      enum: REQUEST_TYPES,
      required: true,
    },
    // For enrollment/course requests
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Faculty",
      default: null,
    },
    year: {
      type: Number,
      default: null,
    },
    semester: {
      type: Number,
      default: null,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },
    // For general requests
    title: {
      type: String,
      default: "",
      trim: true,
    },
    message: {
      type: String,
      default: "",
      trim: true,
    },
    // For add_faculty/add_program requests - stores the proposed data
    requestedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "pending",
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    responseMessage: {
      type: String,
      default: "",
      trim: true,
    },
    isDeleted: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

requestSchema.index({ requester: 1, status: 1 });
requestSchema.index({ faculty: 1, status: 1 });
requestSchema.index({ type: 1, status: 1 });
requestSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Request", requestSchema);
module.exports.REQUEST_TYPES = REQUEST_TYPES;
module.exports.REQUEST_STATUSES = REQUEST_STATUSES;
