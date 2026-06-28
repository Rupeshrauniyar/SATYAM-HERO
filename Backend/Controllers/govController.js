require("dotenv").config();
const User = require("../Models/UserModel");

// GET users via regex search
const getUsers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Name query is required" });
    }

    const regex = new RegExp(name, "i");
    const users = await User.find({ name: { $regex: regex } }).select(
      "name role"
    );

    return res.status(200).json({ success: true, users });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// UPDATE user role (promote or demote)
const updateUserRole = async (req, res) => {
  try {
    const { update, role } = req.body; // user ID
    if (!update) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    if (!role || !["gov", "user"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid role is required" });
    }

    const user = await User.findById(update);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.role === role) {
      return res.status(200).json({ success: true, user, message: "Role already set" });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUsers, updateUserRole };
