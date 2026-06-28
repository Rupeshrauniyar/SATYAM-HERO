require("dotenv").config();
const Report = require("../Models/ReportModel");
const User = require("../Models/UserModel");

const getMyWork = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    // return summary counts for gov user's handled reports
    const pipeline = [
      { $match: { changer: userId } },
      { $project: { upvotesCount: { $size: { $ifNull: ["$upvotes", []] } }, downvotesCount: { $size: { $ifNull: ["$downvotes", []] } }, commentsCount: { $size: { $ifNull: ["$comments", []] } } } },
      { $group: { _id: null, totalHandled: { $sum: 1 }, upvotes: { $sum: "$upvotesCount" }, downvotes: { $sum: "$downvotesCount" }, comments: { $sum: "$commentsCount" } } },
    ];

    const result = await Report.aggregate(pipeline);
    const summary = result[0] || { totalHandled: 0, upvotes: 0, downvotes: 0, comments: 0 };

    res.status(200).json({ success: true, summary });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

module.exports = getMyWork;
