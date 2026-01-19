const express = require("express");
const {
  createReport,
  getReport,
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
router.post("/getMy", UserMiddleware, getMyReport);
router.post("/delete", deleteReport);
router.post("/edit", editReport);

module.exports = router;
