const jwt = require("jsonwebtoken");
const User = require("../Models/UserModel.js");
require("dotenv").config();
const checkAuth = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.json({
        success: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.json({
        success: false,
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(error);
    return res.json({
      success: false,
    });
  }
};
// CHECK PHONE — lookup only, does not create a user
const checkPhone = async (req, res) => {
  const { phone } = req.body;

  try {
    const user = await User.findOne({ phone_number: phone });

    if (user) {
      return res.status(200).json({
        exists: true,
        user: {
          name: user.name,
          phone_number: user.phone_number,
        },
      });
    }

    return res.status(200).json({ exists: false });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// SIGN IN CONTROLLER
const signin = async (req, res) => {
  const { phone,name } = req.body;

  try {
    let user = await User.findOne({ phone_number: phone });

    if (!user) {
      user = await User.create({ phone_number: phone,name:name });
    } else if (user.verified) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT);
      return res.status(200).json({
        user,
        token,
        message: "Signedin Successfully",
      });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT);
    return res.status(200).json({
      user,
      token,
      message: "Signedin Successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// SIGN UP CONTROLLER
const signup = async (req, res) => {
  const { name, phone } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { phone_number: phone },
      {
        name: name,
        verified: true,
      },
      { new: true },
    );

    if (user) {
      const token = jwt.sign({ _id: user._id }, process.env.JWT);
      return res.status(200).json({
        user,
        token,
        message: "Success",
      });
    } else {
      return res.status(404).json({
        success: false,
        message: "Please create your account first.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
module.exports = { checkAuth, checkPhone, signin, signup };
