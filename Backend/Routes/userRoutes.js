const express = require("express");
const { updateProfile } = require("../Controllers/userController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");

const router = express.Router();

router.post("/update", UserMiddleware, updateProfile);

module.exports = router;
