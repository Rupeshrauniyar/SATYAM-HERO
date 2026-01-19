const express = require("express");
const {
  signin,
  signup,
  checkAuth,
} = require("../Controllers/authController.js");

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/check", checkAuth);

module.exports = router;
