const express = require('express');
const router = express.Router();
const { translate } = require('../Controllers/translateController');

router.post('/', translate);

module.exports = router;
