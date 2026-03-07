const User     = require('../models/User');
const Course   = require('../models/Course');
const Material = require('../models/Material');

exports.getStats = async (req, res) => {
  try {
    const [totalStudents, totalMentors, activeCourses] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'mentor' }),
      Course.countDocuments({ status: 'Published' }),
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalMentors,
        activeCourses,
        pendingApprovals: 0,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const recentUsers = await User.find()
      .select('name createdAt role')
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentUsers.map((u) => ({
      id:     u._id,
      user:   u.name,
      action: `joined as ${u.role}`,
      time:   u.createdAt,
    }));

    res.json({ success: true, data: activity });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};