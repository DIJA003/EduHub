const mongoose = require("mongoose");

const academicYearSchema = new mongoose.Schema({
  yearNumber: {
    type: Number,
    required: true,
    min: 1,
    max: 4,
    enum: [1, 2, 3, 4],
    unique: true, 
    // validate: {
    //   validator: function(value) {
    //     return value >= 1 && value <= 4;
    //   },
    //   message: 'Year number must be between 1 and 4'
    // }
  },
  createdBy: { //reference to User
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    // Validate that creator is an admin or mentor
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
    
  
  
// Ensure unique year numbers
academicYearSchema.index({ yearNumber: 1 }, { unique: true });

// Index for efficient querying
academicYearSchema.index({ createdBy: 1, createdAt: -1 });


// Ensure unique year numbers (redundant with unique:true, but kept for clarity)
academicYearSchema.index({ yearNumber: 1 }, { unique: true });

module.exports = mongoose.model("AcademicYear", academicYearSchema);