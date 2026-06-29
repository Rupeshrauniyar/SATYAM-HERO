require("dotenv").config();
const Report = require("../Models/ReportModel");
const User = require("../Models/UserModel");

const getMyWork = async (req, res) => {
  try {
    const userId = req.user._id;

    const reports = await Report.find({ changer: userId })
      .populate([
        { path: "userId", select: "name role profilePicture" },
        { path: "changer", select: "name role profilePicture" },
      ])
      .sort({ updatedAt: -1 });

    const summary = reports.reduce(
      (acc, report) => {
        acc.totalHandled += 1;
        acc.upvotes += Array.isArray(report.upvotes) ? report.upvotes.length : 0;
        acc.downvotes += Array.isArray(report.downvotes) ? report.downvotes.length : 0;
        acc.comments += Array.isArray(report.comments) ? report.comments.length : 0;
        return acc;
      },
      { totalHandled: 0, upvotes: 0, downvotes: 0, comments: 0 },
    );

    res.status(200).json({ success: true, Reports: reports, summary });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false });
  }
};

module.exports = getMyWork;
