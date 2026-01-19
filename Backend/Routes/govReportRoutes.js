const express = require("express");
const getMyWork  = require("../Controllers/govReportController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");

const router = express.Router();

router.post("/getMyWork", UserMiddleware, getMyWork);

module.exports = router;
