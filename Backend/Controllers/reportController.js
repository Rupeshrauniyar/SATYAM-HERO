require("dotenv").config();
const Report = require("../Models/ReportModel");
const User = require("../Models/UserModel");

const reportPopulate = [
  { path: "userId changer", select: "name role -_id" },
  { path: "comments.userId", select: "name -_id" },
];

const createReport = async (req, res) => {
  try {
    const { formData, media } = req.body;
    const userId = req.user._id;
    console.log(userId);
    console.log(formData);

    const newReport = await Report.create({
      title: formData.title,
      description: formData.description,
      category: formData.category,
      ward_number: formData.ward, // or formData.ward if that’s what you sent
      userId: userId, // attach user
      media,
    });
    await User.findOneAndUpdate(
      { _id: userId },
      {
        $addToSet: { reports: newReport._id },
      },
    );

    console.log(newReport);

    res.status(200).json({ success: true, newReport });
  } catch (err) {
    console.error(err);
    res.status(403).json({ msg: "data not received" });
  }
};
const getReport = async (req, res) => {
  try {
    const Reports = await Report.find()
      .sort({ createdAt: -1 })
      .populate(reportPopulate);
    res.status(200).json({ Reports });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false });
  }
};

const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId).populate(reportPopulate);

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
    const govUsers = await User.find({ role: "gov" }).select("_id");
    const govIds = govUsers.map((u) => u._id);

    const Reports = await Report.find({
      $or: [
        { changer: { $in: govIds } },
        { userId: { $in: govIds } },
        { status: { $in: ["Progress", "Resolved"] } },
      ],
    })
      .sort({ updatedAt: -1 })
      .populate(reportPopulate);

    res.status(200).json({ Reports });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false });
  }
};

const getComments = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findById(reportId).populate({
      path: "comments.userId",
      select: "name -_id",
    });

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    res.status(200).json({ success: true, comments: report.comments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

const addComment = async (req, res) => {
  try {
    const { reportId, text } = req.body;
    const userId = req.user._id;

    if (!reportId || !text?.trim()) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    const report = await Report.findByIdAndUpdate(
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

    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const newComment = report.comments[report.comments.length - 1];

    res.status(200).json({ success: true, comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
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
    const { reportId, commentId, method } = req.body;
    const userId = req.user._id;

    if (!reportId || !commentId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res.status(400).json({ success: false, message: "Invalid method" });
    }

    const report = await Report.findById(reportId);
    if (!report) {
      return res.status(404).json({ success: false, message: "Report not found" });
    }

    const comment = report.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    if (method === "push") {
      const already = comment.likes.some((id) => id.toString() === userId.toString());
      if (!already) comment.likes.push(userId);
    } else {
      comment.likes = comment.likes.filter(
        (id) => id.toString() !== userId.toString(),
      );
    }

    await report.save();
    await report.populate({ path: "comments.userId", select: "name -_id" });

    const updated = report.comments.id(commentId);
    res.status(200).json({ success: true, comment: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};
const upvoteReport = async (req, res) => {
  try {
    const { reportId, method } = req.body;
    const userId = req.user._id;

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid method" });
    }

    const report = await Report.findById(reportId);
    const user = await User.findById(userId);

    if (!report || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (method === "push") {
      await Promise.all([
        Report.findByIdAndUpdate(reportId, {
          $pull: { downvotes: userId },
          $addToSet: { upvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { downvotes: reportId },
          $addToSet: { upvotes: reportId },
        }),
      ]);
    }

    if (method === "pull") {
      await Promise.all([
        Report.findByIdAndUpdate(reportId, {
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
    const { reportId, method } = req.body;
    const userId = req.user._id;

    if (!reportId || !method) {
      return res.status(400).json({ success: false, message: "Missing data" });
    }

    if (!["push", "pull"].includes(method)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid method" });
    }

    const report = await Report.findById(reportId);
    const user = await User.findById(userId);

    if (!report || !user) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    if (method === "push") {
      await Promise.all([
        Report.findByIdAndUpdate(reportId, {
          $pull: { upvotes: userId },
          $addToSet: { downvotes: userId },
        }),
        User.findByIdAndUpdate(userId, {
          $pull: { upvotes: reportId },
          $addToSet: { downvotes: reportId },
        }),
      ]);
    }

    if (method === "pull") {
      await Promise.all([
        Report.findByIdAndUpdate(reportId, {
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
    );
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
  getComments,
  addComment,
  likeComment,
  trackShare,
  upvoteReport,
  updateStatus,
  downvoteReport,
  editReport,
  deleteReport,
  getMyReport,
};
