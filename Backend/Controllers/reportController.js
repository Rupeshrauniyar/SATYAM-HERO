require("dotenv").config();
const Report = require("../Models/ReportModel");
const User = require("../Models/UserModel");

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
    const Reports = await Report.find().populate({
      path: "userId changer",
      select: "name -_id",
    });
    res.status(200).json({ Reports });
  } catch (err) {
    console.log(err);
    res.status(404).json({ success: false });
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
    const Reports = await Report.find({ userId }).populate({
      path: "userId changer",
      select: "name -_id",
    });
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
  upvoteReport,
  updateStatus,
  downvoteReport,
  editReport,
  deleteReport,
  getMyReport,
};
