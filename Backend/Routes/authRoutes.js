const express = require("express");
const {
  signin,
  signup,
  checkAuth,
  checkPhone,
} = require("../Controllers/authController.js");

const router = express.Router();

router.post("/signin", signin);
router.post("/signup", signup);
router.post("/check", checkAuth);
router.post("/check-phone", checkPhone);

module.exports = router;
