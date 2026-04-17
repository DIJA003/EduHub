const Notification = require("../models/Notification");

// Internal helper — called from other controllers, not an endpoint
exports.createNotification = async ({ recipient, sender, type, message, materialRef, courseRef }) => {
  try {
    await Notification.create({ recipient, sender, type, message, materialRef, courseRef });
  } catch (err) {
    console.error("Notification creation failed:", err.message);
  }
};

exports.getAll = async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      recipient: req.user.id,
      isDeleted: false  
    })
      .populate("sender", "name role")
      .populate("materialRef", "title type")
      .populate("courseRef", "title code")
      .sort({ createdAt: -1 });
    res.json({ success: true, data: notifications });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.getById = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user.id,
      isDeleted: false  
    })
      .populate("sender", "name role")
      .populate("materialRef", "title type")
      .populate("courseRef", "title code");
      
    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found or has been deleted" 
      });
    }
    res.json({ success: true, data: notification });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.softDelete = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        recipient: req.user.id,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedBy: req.user.id,
        deletedAt: new Date()
      },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ 
        success: false, 
        message: "Notification not found or already deleted" 
      });
    }

    res.json({ 
      success: true, 
      message: "Notification deleted successfully",
      data: notification
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteAll = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      {
        recipient: req.user.id,
        isDeleted: false
      },
      {
        isDeleted: true,
        deletedBy: req.user.id,
        deletedAt: new Date()
      }
    );

    res.json({ 
      success: true, 
      message: `${result.modifiedCount} notifications deleted successfully`
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

