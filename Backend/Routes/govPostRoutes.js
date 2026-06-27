const express = require("express");
const {
  createGovPost,
  getGovUpdates,
  getGovAlerts,
} = require("../Controllers/govPostController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");
const router = express.Router();

router.post("/create", UserMiddleware, createGovPost);
router.get("/updates", getGovUpdates);
router.get("/alerts", getGovAlerts);

module.exports = router;
