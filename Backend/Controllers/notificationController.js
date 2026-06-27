const Notification = require("../Models/NotificationModel");

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sourceUserId", "name -_id");

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getNotificationsByType = async (req, res) => {
  try {
    const { type } = req.params;
    if (!type) {
      return res.status(400).json({ success: false, message: "Missing type" });
    }

    const notifications = await Notification.find({
      userId: req.user._id,
      type,
    })
      .sort({ createdAt: -1 })
      .populate("sourceUserId", "name -_id");

    return res.status(200).json({ success: true, notifications });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getUnreadCount = async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      userId: req.user._id,
      read: false,
    });
    return res.status(200).json({ success: true, count });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing notificationId" });
    }

    await Notification.findOneAndUpdate(
      { _id: notificationId, userId: req.user._id },
      { read: true },
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { read: true });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.body;
    if (!notificationId) {
      return res
        .status(400)
        .json({ success: false, message: "Missing notificationId" });
    }

    await Notification.findOneAndDelete({ _id: notificationId, userId: req.user._id });
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  getNotifications,
  getNotificationsByType,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
