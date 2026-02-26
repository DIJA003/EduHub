const User = require('../models/User');

exports.verifyEmailExistence = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "This email is not registered in our system." 
      });
    }

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: "Server error during email verification." 
    });
  }
};