const express = require("express");
const {
  createReport,
  getReport,
  getReportById,
  searchReports,
  getComments,
  getCommentReplies,
  addComment,
  addReply,
  likeComment,
  trackShare,
  editReport,
  deleteReport,
  upvoteReport,
  downvoteReport,
  updateStatus,
  getMyReport,
} = require("../Controllers/reportController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");
const router = express.Router();

router.post("/create", UserMiddleware, createReport);
router.post("/upvote", UserMiddleware, upvoteReport);
router.post("/downvote", UserMiddleware, downvoteReport);
router.post("/updateReportStatus", UserMiddleware, updateStatus);
router.get("/get", getReport);
router.get("/search", searchReports);
router.get("/single/:reportId", getReportById);
router.get("/comments/:reportId", getComments);
router.get("/comments/:reportId/replies/:commentId", getCommentReplies);
router.post("/comment", UserMiddleware, addComment);
router.post("/comment/reply", UserMiddleware, addReply);
router.post("/comment/like", UserMiddleware, likeComment);
router.post("/share", trackShare);
router.post("/getMy", UserMiddleware, getMyReport);
router.post("/delete", deleteReport);
router.post("/edit", editReport);

module.exports = router;
