require("dotenv").config();
const GovPost = require("../Models/GovPostModel");
const User = require("../Models/UserModel");

const createGovPost = async (req, res) => {
  try {
    // // Debugging: log incoming user and body to diagnose 403 issues
    // console.log("createGovPost called - req.user:", req.user);
    // console.log("createGovPost called - req.body:", { ...req.body, token: !!req.body.token });

    if (!req.user) {
      return res.status(403).json({ success: false, message: "Forbidden",  });
    }

    const { formData, media } = req.body;
    if (!formData?.title || !formData?.category || !formData?.ward || !formData?.postType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const normalizedPostType = formData.postType === "alert" || formData.postType === "alerts" ? "alert" : "update";
    const isAlert = normalizedPostType === "alert";

    const newGovPost = await GovPost.create({
      title: formData.title,
      description: formData.description || "",
      category: formData.category,
      postType: normalizedPostType,
      ward_number: formData.ward,
      authorId: req.user._id,
      media: Array.isArray(media) ? media : [],
      upvotes: [],
      downvotes: [],
      comments: [],
    });

    await User.findOneAndUpdate(
      { _id: req.user._id },
      {
        $addToSet: isAlert ? { alerts: newGovPost._id } : { updates: newGovPost._id },
      },
    );

    return res.status(200).json({ success: true, post: newGovPost });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getGovUpdates = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));
    const skip = (page - 1) * limit;
 
    // return trimmed gov updates (counts + author) using aggregation
    const pipeline = [
      { $match: { postType: "update" } },
      { $sort: { updatedAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          body: "$description",
          createdAt: 1,
          updatedAt: 1,
          media: 1,
          authorId: 1,
          ward_number: 1,
          status: 1,
          shares: 1,
          upvotes: 1,
          downvotes: 1,
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "author" } },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          body: 1,
          createdAt: 1,
          updatedAt: 1,
          media: 1,
          ward_number: 1,
          status: 1,
          shares: 1,
          upvotes: 1,
          downvotes: 1,
          commentsCount: 1,
          author: { name: "$author.name", role: "$author.role", _id: "$author._id", profilePicture: "$author.profilePicture" },
          user: { name: "$author.name", role: "$author.role", _id: "$author._id", profilePicture: "$author.profilePicture" },
          authorId: { name: "$author.name", role: "$author.role", _id: "$author._id", profilePicture: "$author.profilePicture" },
        },
      },
    ];

    const [updates, total] = await Promise.all([GovPost.aggregate(pipeline), GovPost.countDocuments({ postType: "update" })]);

    return res.status(200).json({ success: true, Reports: updates, hasMore: skip + updates.length < total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const getGovAlerts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || "1", 10));
    const limit = Math.min(20, Math.max(1, parseInt(req.query.limit || "3", 10)));
    const skip = (page - 1) * limit;

    const authorFilter = req.user?._id ? { authorId: req.user._id } : {};
    // aggregation to trim alerts
    const pipeline = [
      { $match: { postType: "alert", ...authorFilter } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          body: "$description",
          createdAt: 1,
          media: 1,
          authorId: 1,
          ward_number: 1,
          status: 1,
          shares: 1,
          upvotes: 1,
          downvotes: 1,
          commentsCount: { $size: { $ifNull: ["$comments", []] } },
        },
      },
      { $lookup: { from: "users", localField: "authorId", foreignField: "_id", as: "author" } },
      { $unwind: { path: "$author", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          title: 1,
          description: 1,
          body: 1,
          createdAt: 1,
          media: 1,
          ward_number: 1,
          status: 1,
          shares: 1,
          upvotes: 1,
          downvotes: 1,
          commentsCount: 1,
          author: { name: "$author.name", role: "$author.role", _id: "$author._id", profilePicture: "$author.profilePicture" },
          user: { name: "$author.name", role: "$author.role", _id: "$author._id", profilePicture: "$author.profilePicture" },
        },
      },
    ];

    const [alerts, total] = await Promise.all([GovPost.aggregate(pipeline), GovPost.countDocuments({ postType: "alert", ...authorFilter })]);

    return res.status(200).json({ success: true, reports: alerts, hasMore: skip + alerts.length < total });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = {
  createGovPost,
  getGovUpdates,
  getGovAlerts,
};
