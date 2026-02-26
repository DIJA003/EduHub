const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
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
  firebaseUid: { type: String, required: true },
});

module.exports = mongoose.model("User", UserSchema);
