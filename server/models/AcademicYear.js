const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema({
  yearNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    enum: [1, 2, 3, 4],
    unique: true 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && (user.role === 'admin');
      },
      message: 'Only admins can create academic years'
    }
  }
}, {
  timestamps: true
});


academicYearSchema.index({ createdBy: 1, createdAt: -1 });

module.exports = mongoose.model("AcademicYear", academicYearSchema);