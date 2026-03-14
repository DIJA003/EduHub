const User = require("../models/User");

// save course 
exports.saveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id; 

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedCourses: courseId } },
      { new: true }
    );

    res.status(200).json({ message: 'Course saved successfully', savedCourses: updatedUser.savedCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }  
};

// unsave course 
exports.unsaveCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedCourses: courseId } },
      { new: true }
    );
    res.status(200).json({ message: 'Course removed from dashboard', savedCourses: updatedUser.savedCourses });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });  }
};

// get student dashboard courses
exports.getSavedCourses = async (req, res) => {
  try{
    const userId = req.user.id;

    const user = await User.findById(userId).populate({
      path: 'savedCourses',
      select: 'title code semesterId coverImage' 
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Dashboard loaded',
      courses: user.savedCourses 
    });
  }
    catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
}