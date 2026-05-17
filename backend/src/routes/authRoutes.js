const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/verify-firebase', authController.verifyFirebase);

module.exports = router;
