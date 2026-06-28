const JWT = require("jsonwebtoken");
require("dotenv").config();
const { extractToken } = require("../Utils/authUtils");

const UserMiddleware = async (req, res, next) => {
  try {
    const token = extractToken(req);
    if (!token) {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }

    const secret = process.env.JWT || "civicreport-secret";
    const user = JWT.verify(token, secret);
    if (user && user._id) {
      req.user = user;
      next();
    } else {
      return res.status(401).json({ success: false, msg: "Invalid token" });
    }
  } catch (err) {
    console.error("UserMiddleware error:", err.message);
    return res.status(401).json({ success: false, msg: "Invalid token" });
  }
};

module.exports = UserMiddleware;
