const JWT = require("jsonwebtoken");
require("dotenv").config();
const UserMiddleware = async (req, res, next) => {
  try {
    const token = req.body?.token || req.headers?.authorization || req.query?.token;
    if (!token) {
      return res.status(404).json({ success: false, msg: "Invalid token" });
    }
    const user = JWT.verify(token, process.env.JWT);
    if (user && user._id) {
      req.user = user;
      next();
    } else {
      return res.status(404).json({ success: false, msg: "Invalid token" });
    }
  } catch (err) {
    console.log(err);
    return res.status(404).json({ success: false });
  }
};

module.exports = UserMiddleware;
