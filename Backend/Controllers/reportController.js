require("dotenv").config();
const Report = require("../Models/ReportModel");
const GovPost = require("../Models/GovPostModel");
const User = require("../Models/UserModel");
const Notification = require("../Models/NotificationModel");
const { normalizeResourceType, isResourceOwner } = require("../Utils/voteHelpers");
const { extractToken } = require("../Utils/authUtils");

const jwt = require("jsonwebtoken");

const reportPopulate = [
  { path: "userId changer", select: "name role" },
  { path: "comments.userId", select: "name" },
];
const govPostPopulate = [{ path: "authorId", select: "name role" }];

const createNotification = async ({ userId, reportId, sourceUserId, type, message, commentId, replyId }) => {
  if (!userId || !message) return;
  const doc = { userId, reportId, sourceUserId, type, message };
  if (commentId) doc.commentId = commentId;
  if (replyId) doc.replyId = replyId;
  return Notification.create(doc);
};

const getResourceModel = (resourceType = "report") => {
  return normalizeResourceType(resourceType) === "govPost" ? GovPost : Report;
};

const getOwnerId = (resource) => {
  return resource?.authorId?._id || resource?.authorId || resource?.userId?._id || resource?.userId;
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

    // Use aggregation to only return necessary fields and counts (avoid sending full comments/replies)
    const pipeline = [
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          ward_number: 1,
          status: 1,
          media: 1,
          createdAt: 1,
          shares: 1,
          userId: 1,
          upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
          downvotesCount: { $size: { $ifNull: ["$downvotes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          ward_number: 1,
          status: 1,
          media: 1,
          createdAt: 1,
          shares: 1,
          upvotesCount: 1,
          downvotesCount: 1,
          commentsCount: 1,
          user: { name: "$user.name", role: "$user.role", _id: "$user._id" },
        },
      },
    ];

    const [Reports, total] = await Promise.all([
      Report.aggregate(pipeline),
      Report.countDocuments(),
    ]);

    res.status(200).json({ success: true, Reports, hasMore: skip + Reports.length < total });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false });
  }
};

const getInsights = async (req, res) => {
  try {
    const { status, ward, category, search } = req.query;
    const query = {};

    if (status && status !== "all") {
      query.status = status;
    }

    if (ward && ward !== "all") {
      const parsedWard = Number(ward);
      query.ward_number = Number.isNaN(parsedWard) ? ward : parsedWard;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), "i");
      query.$or = [
        { title: regex },
        { description: regex },
        { category: regex },
      ];
    }

    const now = new Date();
    const last24 = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const total = await Report.countDocuments(query);
    const pending = await Report.countDocuments({ ...query, status: "Pending" });
    const progress = await Report.countDocuments({ ...query, status: "Progress" });
    const resolved = await Report.countDocuments({ ...query, status: "Resolved" });
    const last24Hours = await Report.countDocuments({ ...query, createdAt: { $gte: last24 } });

    const categories = (await Report.distinct("category")).filter(Boolean).sort();
    const wards = (await Report.distinct("ward_number")).filter((w) => w != null).map((w) => String(w)).sort((a, b) => Number(a) - Number(b));

    return res.status(200).json({
      success: true,
      summary: { total, pending, progress, resolved, last24Hours },
      filters: { categories, wards },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
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

    // Aggregate to return trimmed gov posts with counts and author info
    const pipeline = [
      { $match: { postType: "update" } },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          media: 1,
          authorId: 1,
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "author" } },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, body: 1, createdAt: 1, updatedAt: 1, media: 1, commentsCount: 1, author: { name: "$author.name", role: "$author.role", _id: "$author._id" } } },
    ];

    const [updates, total] = await Promise.all([
      GovPost.aggregate(pipeline),
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

    const pipeline = [
      { $match: { postType: "alert" } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      { $project: { title: 1, body: 1, createdAt: 1, media: 1, authorId: 1, commentsCount: { $size: { $ifNull: ["$comments", []] } } } },
      { $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "author" } },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, body: 1, createdAt: 1, media: 1, commentsCount: 1, author: { name: "$author.name", role: "$author.role", _id: "$author._id" } } },
    ];

    const [alerts, total] = await Promise.all([
      GovPost.aggregate(pipeline),
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
    const normalizedType = normalizeResourceType(resourceType);
    const Model = getResourceModel(normalizedType);
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
    const normalizedType = normalizeResourceType(resourceType);
    const Model = getResourceModel(normalizedType);
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
    const normalizedType = normalizeResourceType(resourceType);

    if (!reportId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const Model = getResourceModel(normalizedType);
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
    // Use aggregation to return trimmed report objects (counts instead of full comments)
    const pipeline = [
      { $match: searchQuery },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          title: 1,
          description: 1,
          category: 1,
          ward_number: 1,
          status: 1,
          media: 1,
          createdAt: 1,
          shares: 1,
          userId: 1,
          upvotesCount: { $size: { $ifNull: ["$upvotes", []] } },
          downvotesCount: { $size: { $ifNull: ["$downvotes", []] } },
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $lookup: { from: "users", localField: "userId", foreignField: "_id", as: "user" } },
      { $unwind: { path: "$user", preserveNullAndEmptyArrays: true } },
      { $project: { title: 1, description: 1, category: 1, ward_number: 1, status: 1, media: 1, createdAt: 1, shares: 1, upvotesCount: 1, downvotesCount: 1, commentsCount: 1, user: { name: "$user.name", role: "$user.role", _id: "$user._id" } } },
    ];

    const Reports = await Report.aggregate(pipeline);

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
    const { reportId, commentId, replyId, method, resourceType = "report" } = req.body;
    const userId = req.user._id;
    const normalizedType = normalizeResourceType(resourceType);

    if (!reportId || !commentId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    const Model = getResourceModel(normalizedType);
    const resource = await Model.findById(reportId);
    if (!resource) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = resource.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    let target = comment;
    let notificationTargetId = comment.userId;

    if (replyId) {
      const reply = comment.replies.id(replyId);
      if (!reply) {
        return res.status(404).json({ success: false, message: "Reply not found" });
      }
      target = reply;
      notificationTargetId = reply.userId;
    }

    if (method === "push") {
      const already = (target.likes || []).some((id) => id.toString() === userId.toString());
      if (!already) target.likes.push(userId);
      try {
        const sourceUser = await User.findById(userId).select("name");
        if (notificationTargetId.toString() !== userId.toString()) {
          await createNotification({
            userId: notificationTargetId,
            reportId,
            sourceUserId: userId,
            type: "comment_like",
            commentId,
            replyId,
            message: `${sourceUser?.name || "Someone"} liked your ${replyId ? "reply" : "comment"}.`,
          });
        }
      } catch (e) {
        console.error("notify comment like error", e);
      }
    } else {
      target.likes = (target.likes || []).filter((id) => id.toString() !== userId.toString());
    }

    await resource.save();
    await resource.populate({ path: "comments.userId", select: "name -_id" });
    await resource.populate({ path: "comments.replies.userId", select: "name -_id" });

    const updatedComment = resource.comments.id(commentId);
    if (replyId) {
      const updatedReply = updatedComment.replies.id(replyId);
      return res.status(200).json({ success: true, reply: updatedReply, comment: updatedComment });
    }

    res.status(200).json({ success: true, comment: updatedComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const addReply = async (req, res) => {
  try {
    const { reportId, commentId, text, resourceType = "report" } = req.body;
    const userId = req.user._id;
    const normalizedType = normalizeResourceType(resourceType);

    if (!reportId || !commentId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const Model = getResourceModel(normalizedType);
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
    const explicitToken = extractToken(req);
    const resolvedUserId = req.user?._id || req.userId;

    if (!resolvedUserId && explicitToken) {
      try {
        const decoded = jwt.verify(explicitToken, process.env.JWT || "civicreport-secret");
        if (decoded?._id) {
          req.user = { _id: decoded._id };
        }
      } catch (tokenError) {
        console.error("Upvote token decode failed", tokenError.message);
      }
    }

    const currentUserId = req.user?._id || req.userId;
    const normalizedType = normalizeResourceType(resourceType);

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const Model = getResourceModel(normalizedType);
    const resource = await Model.findById(reportId);
    const user = await User.findById(currentUserId);

    if (!resource || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (isResourceOwner(resource, currentUserId)) {
      return res.status(403).json({ success: false, message: "You cannot vote on your own post." });
    }

    let updatedResource;
    let updatedUser;

    if (method === "push") {
      [updatedResource, updatedUser] = await Promise.all([
        Model.findByIdAndUpdate(
          reportId,
          {
            $pull: { downvotes: currentUserId },
            $addToSet: { upvotes: currentUserId },
          },
          { new: true },
        ),
        User.findByIdAndUpdate(
          currentUserId,
          {
            $pull: { downvotes: reportId },
            $addToSet: { upvotes: reportId },
          },
          { new: true },
        ),
      ]);

      const sourceUser = await User.findById(currentUserId).select("name");
      const ownerId = getOwnerId(resource);
      if (ownerId && ownerId.toString() !== currentUserId.toString()) {
        await createNotification({
          userId: ownerId,
          reportId,
          sourceUserId: currentUserId,
          type: "upvote",
          message: `${sourceUser?.name || "Someone"} upvoted your report.`,
        });
      }
    }

    if (method === "pull") {
      [updatedResource, updatedUser] = await Promise.all([
        Model.findByIdAndUpdate(
          reportId,
          {
            $pull: { upvotes: currentUserId },
          },
          { new: true },
        ),
        User.findByIdAndUpdate(
          currentUserId,
          {
            $pull: { upvotes: reportId },
          },
          { new: true },
        ),
      ]);
    }

    return res.status(200).json({
      success: true,
      resource: updatedResource,
      user: updatedUser,
      action: method,
      resourceType: normalizedType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const getMyReport = async (req, res) => {
  try {
    const userId = req.user._id;
    // return summary counts for the user's reports
    const pipeline = [
      { $match: { userId: userId } },
      { $project: { upvotesCount: { $size: { $ifNull: ["$upvotes", []] } }, downvotesCount: { $size: { $ifNull: ["$downvotes", []] } }, commentsCount: { $size: { $ifNull: ["$comments", []] } } } },
      { $group: { _id: null, totalReports: { $sum: 1 }, upvotes: { $sum: "$upvotesCount" }, downvotes: { $sum: "$downvotesCount" }, comments: { $sum: "$commentsCount" } } },
    ];

    const result = await Report.aggregate(pipeline);
    const summary = result[0] || { totalReports: 0, upvotes: 0, downvotes: 0, comments: 0 };

    const reports = await Report.find({ userId })
      .sort({ createdAt: -1 })
      .populate("userId", "name role")
      .lean();

    const includeRecent = req.query.recent === "1";
    const recent = includeRecent ? reports.slice(0, 10) : [];

    res.status(200).json({ success: true, summary, reports, recent });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const downvoteReport = async (req, res) => {
  try {
    const { reportId, method, resourceType = "report" } = req.body;
    const explicitToken = extractToken(req);
    const resolvedUserId = req.user?._id || req.userId;

    if (!resolvedUserId && explicitToken) {
      try {
        const decoded = jwt.verify(explicitToken, process.env.JWT || "civicreport-secret");
        if (decoded?._id) {
          req.user = { _id: decoded._id };
        }
      } catch (tokenError) {
        console.error("Downvote token decode failed", tokenError.message);
      }
    }

    const currentUserId = req.user?._id || req.userId;
    const normalizedType = normalizeResourceType(resourceType);

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    if (!currentUserId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const Model = getResourceModel(normalizedType);
    const resource = await Model.findById(reportId);
    const user = await User.findById(currentUserId);

    if (!resource || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (isResourceOwner(resource, currentUserId)) {
      return res.status(403).json({ success: false, message: "You cannot vote on your own post." });
    }

    let updatedResource;
    let updatedUser;

    if (method === "push") {
      [updatedResource, updatedUser] = await Promise.all([
        Model.findByIdAndUpdate(
          reportId,
          {
            $pull: { upvotes: currentUserId },
            $addToSet: { downvotes: currentUserId },
          },
          { new: true },
        ),
        User.findByIdAndUpdate(
          currentUserId,
          {
            $pull: { upvotes: reportId },
            $addToSet: { downvotes: reportId },
          },
          { new: true },
        ),
      ]);

      const sourceUser = await User.findById(currentUserId).select("name");
      const ownerId = getOwnerId(resource);
      if (ownerId && ownerId.toString() !== currentUserId.toString()) {
        await createNotification({
          userId: ownerId,
          reportId,
          sourceUserId: currentUserId,
          type: "downvote",
          message: `${sourceUser?.name || "Someone"} downvoted your report.`,
        });
      }
    }

    if (method === "pull") {
      [updatedResource, updatedUser] = await Promise.all([
        Model.findByIdAndUpdate(
          reportId,
          {
            $pull: { downvotes: currentUserId },
          },
          { new: true },
        ),
        User.findByIdAndUpdate(
          currentUserId,
          {
            $pull: { downvotes: reportId },
          },
          { new: true },
        ),
      ]);
    }

    return res.status(200).json({
      success: true,
      resource: updatedResource,
      user: updatedUser,
      action: method,
      resourceType: normalizedType,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};
const deleteReport = async (req, res) => {
  try {
    const { reportId, resourceType = "report" } = req.body;
    const normalizedType = normalizeResourceType(resourceType);
    const Model = getResourceModel(normalizedType);
    const resource = await Model.findById(reportId);

    if (!resource) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    await Model.findByIdAndDelete(reportId);
    await User.updateMany(
      { $or: [{ alerts: reportId }, { updates: reportId }, { reports: reportId }] },
      { $pull: { alerts: reportId, updates: reportId, reports: reportId } },
    );

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
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
  getInsights,
};
