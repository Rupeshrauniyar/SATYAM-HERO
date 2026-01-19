require("dotenv").config();
const Report = require("../Models/ReportModel");
const User = require("../Models/UserModel");

const getMyWork = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(userId);
    const Reports = await Report.find({ changer: userId }).populate({
      path: "userId changer",
      select: "name -_id",
    });
    res.status(200).json({Reports});
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

module.exports = getMyWork;
