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
    savedCourses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ role: 1, status: 1 });
UserSchema.index({ email: 1 });

module.exports = mongoose.model("User", UserSchema);
