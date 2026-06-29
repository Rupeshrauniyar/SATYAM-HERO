const User = require("../Models/UserModel.js");

const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, profilePicture } = req.body;

    const updates = {};
    if (typeof name === "string") updates.name = name.trim();
    if (typeof profilePicture === "string") updates.profilePicture = profilePicture.trim();

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ success: false, message: "Nothing to update" });
    }

    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-__v");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { updateProfile };
