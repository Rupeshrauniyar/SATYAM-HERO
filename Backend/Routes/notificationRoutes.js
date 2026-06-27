const express = require("express");
const {
  getNotifications,
  getNotificationsByType,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../Controllers/notificationController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");
const router = express.Router();

router.get("/", UserMiddleware, getNotifications);
router.get("/type/:type", UserMiddleware, getNotificationsByType);
router.get("/unread-count", UserMiddleware, getUnreadCount);
router.post("/mark-read", UserMiddleware, markAsRead);
router.post("/mark-all-read", UserMiddleware, markAllAsRead);
router.post("/delete", UserMiddleware, deleteNotification);

module.exports = router;
