const JWT = require("jsonwebtoken");
require("dotenv").config();

const getToken = (req) => {
  const headerToken = req.headers?.authorization || req.headers?.Authorization;
  if (typeof headerToken === "string") {
    return headerToken.startsWith("Bearer ") ? headerToken.slice(7).trim() : headerToken;
  }

  if (typeof req.body?.token === "string") return req.body.token;
  if (typeof req.query?.token === "string") return req.query.token;
  return null;
};

const UserMiddleware = async (req, res, next) => {
  try {
    const token = getToken(req);
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
