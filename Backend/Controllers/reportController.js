require("dotenv").config();
const Report = require("../Models/ReportModel");
const GovPost = require("../Models/GovPostModel");
const User = require("../Models/UserModel");
const Notification = require("../Models/NotificationModel");

const reportPopulate = [
  { path: "userId changer", select: "name role -_id" },
  { path: "comments.userId", select: "name -_id" },
];
const govPostPopulate = [{ path: "authorId", select: "name role -_id" }];

const createNotification = async ({ userId, reportId, sourceUserId, type, message, commentId, replyId }) => {
  if (!userId || !message) return;
  const doc = { userId, reportId, sourceUserId, type, message };
  if (commentId) doc.commentId = commentId;
  if (replyId) doc.replyId = replyId;
  return Notification.create(doc);
};

const getResourceModel = (resourceType = "report") => {
  return resourceType === "govPost" ? GovPost : Report;
};

const getOwnerId = (resource) => {
  return resource?.authorId || resource?.userId;
};

const normalizeComments = (comments = [], includeReplies = false) => {
  return comments.map((comment) => {
    const doc = comment.toObject ? comment.toObject() : comment;
    return {
      ...doc,
      replyCount: doc.replies?.length || 0,
      replies: includeReplies ? doc.replies || [] : [],
    };
  });
};

const createReport = async (req, res) => {
  try {
    if (req.user.role === "gov") {
      return res.status(403).json({
        success: false,
        message: "Government posts must be created via /api/gov/post/create",
      });
    }

    const { formData, media } = req.body;
    const userId = req.user._id;

    const newReport = await Report.create({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      postType: "issue",
      ward_number: formData.ward,
      userId,
      media,
    });

    await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { reports: newReport._id },
      },
    );

    res.status(200).json({ success: true, newReport });
  } catch (err) {
    console.error(err);
    res.status(403).json({ msg: "data not received" });
  }
};
const getReport = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));
    const skip = (page - 1) * limit;

    const [Reports, total] = await Promise.all([
      Report.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(reportPopulate),
      Report.countDocuments(),
    ]);

    res.status(200).json({ success: true, Reports, hasMore: skip + Reports.length < total });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false });
  }
};

const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    let report = await Report.findById(reportId).populate(reportPopulate);

    if (!report) {
      report = await GovPost.findById(reportId).populate(govPostPopulate);
    }

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, Report: report });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const getAuthorityReports = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));
    const skip = (page - 1) * limit;

    const [updates, total] = await Promise.all([
      GovPost.find({ postType: "update" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(govPostPopulate),
      GovPost.countDocuments({ postType: "update" }),
    ]);

    res.status(200).json({ success: true, Reports: updates, hasMore: skip + updates.length < total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const getAlerts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));
    const skip = (page - 1) * limit;

    const [alerts, total] = await Promise.all([
      GovPost.find({ postType: "alert" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate(govPostPopulate),
      GovPost.countDocuments({ postType: "alert" }),
    ]);

    res.status(200).json({ success: true, reports: alerts, hasMore: skip + alerts.length < total });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const getComments = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { resourceType, includeReplies } = req.query;
    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    await resource.populate({ path: "comments.userId", select: "name -_id" });
    if (includeReplies === "true" || includeReplies === "1") {
      await resource.populate({ path: "comments.replies.userId", select: "name -_id" });
    }

    res.status(200).json({ success: true, comments: normalizeComments(resource.comments, includeReplies === "true" || includeReplies === "1") });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const getCommentReplies = async (req, res) => {
  try {
    const { reportId, commentId } = req.params;
    const { resourceType } = req.query;
    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = resource.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    await resource.populate({ path: "comments.replies.userId", select: "name -_id" });
    const updatedComment = resource.comments.id(commentId);

    res.status(200).json({ success: true, replies: updatedComment.replies || [] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const addComment = async (req, res) => {
  try {
    const { reportId, text, resourceType = "report" } = req.body;
    const userId = req.user._id;

    if (!reportId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const Model = getResourceModel(resourceType);
    const resource = await Model.findByIdAndUpdate(
      reportId,
      {
        $push: {
          comments: {
            userId,
            text: text.trim(),
          },
        },
      },
      { new: true },
    ).populate({
      path: "comments.userId",
      select: "name -_id",
    });

    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const newComment = resource.comments[resource.comments.length - 1];
    const sourceUser = await User.findById(userId).select("name");
    const ownerId = getOwnerId(resource);

    if (ownerId && ownerId.toString() !== userId.toString()) {
      await createNotification({
        userId: ownerId,
        reportId,
        sourceUserId: userId,
        type: "comment",
        message: `${sourceUser?.name || "Someone"} commented on your report.`,
      });
    }

    res.status(200).json({ success: true, comment: { ...newComment.toObject(), replyCount: 0, replies: [] } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const searchReports = async (req, res) => {
  try {
    const { q } = req.query;
    const query = (q || "").trim();
    if (!query) {
      return res.status(200).json({ success: true, reports: [] });
    }

    const conditions = [];
    const normalized = query.toLowerCase();
    const wardMatch = normalized.match(/ward\s*([0-9]+)/i) || normalized.match(/^([0-9]+)$/);

    if (wardMatch) {
      conditions.push({ ward_number: parseInt(wardMatch[1], 10) });
    }

    const textSearch = query.replace(/ward\s*[0-9]+/gi, "").trim();
    if (textSearch) {
      const regex = new RegExp(textSearch, "i");
      conditions.push({
        $or: [
          { title: regex },
          { description: regex },
          { category: regex },
        ],
      });
    }

    const searchQuery = conditions.length === 0 ? {} : { $or: conditions };
    const Reports = await Report.find(searchQuery)
      .sort({ createdAt: -1 })
      .populate(reportPopulate);

    return res.status(200).json({ success: true, reports: Reports });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, reports: [] });
  }
};

const trackShare = async (req, res) => {
  try {
    const { reportId } = req.body;

    await Report.findByIdAndUpdate(reportId, { $inc: { shares: 1 } });

    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const likeComment = async (req, res) => {
  try {
    const { reportId, commentId, method, resourceType = "report" } = req.body;
    const userId = req.user._id;

    if (!reportId || !commentId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = resource.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (method === "push") {
      const already = comment.likes.some((id) => id.toString() === userId.toString());
      if (!already) comment.likes.push(userId);
      try {
        const sourceUser = await User.findById(userId).select("name");
        if (comment.userId.toString() !== userId.toString()) {
          await createNotification({
            userId: comment.userId,
            reportId,
            sourceUserId: userId,
            type: "comment_like",
            commentId,
            message: `${sourceUser?.name || "Someone"} liked your comment.`,
          });
        }
      } catch (e) {
        console.error("notify comment like error", e);
      }
    } else {
      comment.likes = comment.likes.filter((id) => id.toString() !== userId.toString());
    }

    await resource.save();
    await resource.populate({ path: "comments.userId", select: "name -_id" });

    const updated = resource.comments.id(commentId);
    res.status(200).json({ success: true, comment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const addReply = async (req, res) => {
  try {
    const { reportId, commentId, text, resourceType = "report" } = req.body;
    const userId = req.user._id;

    if (!reportId || !commentId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = resource.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    comment.replies.push({ userId, text: text.trim() });
    await resource.save();

    await resource.populate({ path: "comments.userId", select: "name -_id" });
    await resource.populate({ path: "comments.replies.userId", select: "name -_id" });
    const updatedComment = resource.comments.id(commentId);
    const newReply = updatedComment.replies[updatedComment.replies.length - 1];

    const sourceUser = await User.findById(userId).select("name");
    try {
      if (comment.userId.toString() !== userId.toString()) {
        await createNotification({
          userId: comment.userId,
          reportId,
          sourceUserId: userId,
          type: "reply",
          commentId,
          message: `${sourceUser?.name || "Someone"} replied to your comment.`,
        });
      }
    } catch (e) {
      console.error("notify reply error", e);
    }

    return res.status(200).json({ success: true, reply: newReply, comment: updatedComment });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const upvoteReport = async (req, res) => {
  try {
    const { reportId, method, resourceType = "report" } = req.body;
    const userId = req.user._id;

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);
    const user = await User.findById(userId);

    if (!resource || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (method === "push") {
      await Promise.all([
        Model.findByIdAndUpdate(reportId, {
          $pull: { downvotes: userId },
          $addToSet: { upvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { downvotes: reportId },
          $addToSet: { upvotes: reportId },
        }),
      ]);

      const sourceUser = await User.findById(userId).select("name");
      const ownerId = getOwnerId(resource);
      if (ownerId && ownerId.toString() !== userId.toString()) {
        await createNotification({
          userId: ownerId,
          reportId,
          sourceUserId: userId,
          type: "upvote",
          message: `${sourceUser?.name || "Someone"} upvoted your report.`,
        });
      }
    }

    if (method === "pull") {
      await Promise.all([
        Model.findByIdAndUpdate(reportId, {
          $pull: { upvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { upvotes: reportId },
        }),
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const getMyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const Reports = await Report.find({ userId }).populate(reportPopulate);
    res.status(200).json({ Reports });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
const downvoteReport = async (req, res) => {
  try {
    const { reportId, method, resourceType = "report" } = req.body;
    const userId = req.user._id;

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    const Model = getResourceModel(resourceType);
    const resource = await Model.findById(reportId);
    const user = await User.findById(userId);

    if (!resource || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (method === "push") {
      await Promise.all([
        Model.findByIdAndUpdate(reportId, {
          $pull: { upvotes: userId },
          $addToSet: { downvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { upvotes: reportId },
          $addToSet: { downvotes: reportId },
        }),
      ]);

      const sourceUser = await User.findById(userId).select("name");
      const ownerId = getOwnerId(resource);
      if (ownerId && ownerId.toString() !== userId.toString()) {
        await createNotification({
          userId: ownerId,
          reportId,
          sourceUserId: userId,
          type: "downvote",
          message: `${sourceUser?.name || "Someone"} downvoted your report.`,
        });
      }
    }

    if (method === "pull") {
      await Promise.all([
        Model.findByIdAndUpdate(reportId, {
          $pull: { downvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { downvotes: reportId },
        }),
      ]);
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.body;
    const report = await Report.findOneAndDelete({ _id: reportId });
    console.log(report);
    res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
const updateStatus = async (req, res) => {
  try {
    const { reportId, status } = req.body;
    const userId = req.user._id;
    const report = await Report.findOneAndUpdate(
      { _id: reportId },
      {
        status,
        changer: userId,
      },
      { new: true },
    );

    const sourceUser = await User.findById(userId).select("name");
    if (report && report.userId.toString() !== userId.toString()) {
      await createNotification({
        userId: report.userId,
        reportId,
        sourceUserId: userId,
        type: "status",
        message: `${sourceUser?.name || "Government"} updated report status to ${status}.`,
      });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false });
  }
};
const editReport = async (req, res) => {};
module.exports = {
  createReport,
  getReport,
  getReportById,
  getAuthorityReports,
  getAlerts,
  searchReports,
  getComments,
  getCommentReplies,
  addComment,
  likeComment,
  addReply,
  trackShare,
  upvoteReport,
  updateStatus,
  downvoteReport,
  editReport,
  deleteReport,
  getMyReport,
};
