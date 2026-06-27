const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Report",
    },
    sourceUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
      enum: ["upvote", "downvote", "comment", "status", "comment_like", "reply", "system"],
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    replyId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model("Notification", notificationSchema);
module.exports = Notification;
