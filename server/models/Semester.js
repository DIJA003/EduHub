const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    enum: ['Spring', 'Summer', 'Fall']
  },
  academicYearId: {  //reference to AcademicYear
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AcademicYear', 
    required: true,
    // Validate that the referenced academic year exists
    validate: {
      validator: async function(academicYearId) {
        const academicYear = await mongoose.model('AcademicYear').findById(academicYearId);
        return academicYear !== null;
      },
      message: 'Referenced academic year does not exist'
    }
  },
   createdBy: { //reference to User
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator information is required'],
    // Validate that creator is an admin (matching Academic Year restriction)
    validate: {
      validator: async function(userId) {
        const user = await mongoose.model('User').findById(userId);
        return user && (user.role === 'admin');
      },
      message: 'Only admins can create semesters'
    }
  },  
}, {
    timestamps: true

 });

module.exports = mongoose.model('Semester', semesterSchema);
  
 

// Ensure unique semester per academic year (can't have two Spring semesters in same year)
semesterSchema.index({ academicYearId: 1, name: 1 }, { unique: true });

// Index for efficient querying
// semesterSchema.index({ academicYearId: 1, createdBy: 1 });
