const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      default: "User",
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "mentor", "student"],
      default: "student",
    },
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
    },
    college: {
      type: String,
      trim: true,
      default: "—",
    },
    status: {
      type: String,
      enum: ["Active", "Pending", "Suspended"],
      default: "Active",
    },
    savedCourses: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course"
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);