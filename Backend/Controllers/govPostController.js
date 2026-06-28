require("dotenv").config();
const GovPost = require("../Models/GovPostModel");

const createGovPost = async (req, res) => {
  try {
    // Debugging: log incoming user and body to diagnose 403 issues
    console.log("createGovPost called - req.user:", req.user);
    console.log("createGovPost called - req.body:", { ...req.body, token: !!req.body.token });

    if (!req.user) {
      return res.status(403).json({ success: false, message: "Forbidden",  });
    }

    const { formData, media } = req.body;
    if (!formData?.title || !formData?.category || !formData?.ward || !formData?.postType) {
      return res.status(400).json({ success: false, message: "Missing required fields" });
    }

    const newGovPost = await GovPost.create({
      title: formData.title,
      description: formData.description || "",
      category: formData.category,
      postType: formData.postType,
      ward_number: formData.ward,
      authorId: req.user._id,
      media: media || [],
    });

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

    const [updates, total] = await Promise.all([
      GovPost.find({ postType: "update" })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name role -_id"),
      GovPost.countDocuments({ postType: "update" }),
    ]);

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

    const [alerts, total] = await Promise.all([
      GovPost.find({ postType: "alert" })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("authorId", "name role -_id"),
      GovPost.countDocuments({ postType: "alert" }),
    ]);

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
