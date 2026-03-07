const User = require('../models/User');

exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select('-__v').sort({ createdAt: -1 });
    // Shape to match admin UI expectations
    const shaped = users.map((u) => ({
      _id:     u._id,
      name:    u.name,
      email:   u.email,
      role:    u.role.charAt(0).toUpperCase() + u.role.slice(1), // "student" → "Student"
      college: u.college || '—',
      joined:  u.createdAt.toISOString().split('T')[0],
      status:  u.status || 'Active',
    }));
    res.json({ success: true, data: shaped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, email, role, college, status } = req.body;
    const updatePayload = {
      ...(name    && { name }),
      ...(email   && { email: email.toLowerCase() }),
      ...(role    && { role: role.toLowerCase() }),
      ...(college && { college }),
      ...(status  && { status }),
    };
    const user = await User.findByIdAndUpdate(req.params.id, updatePayload, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User removed successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};