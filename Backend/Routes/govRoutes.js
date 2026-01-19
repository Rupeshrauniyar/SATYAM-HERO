const express = require("express");
const { getUsers, updateUserRole } = require("../Controllers/govController.js");
const UserMiddleware = require("../Middlewares/UserMiddleware.js");

const router = express.Router();

router.post("/user", UserMiddleware, getUsers);
router.post("/user/update", UserMiddleware, updateUserRole);

module.exports = router;
