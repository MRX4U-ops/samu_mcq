const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/ask', aiController.askQuestion);
router.post('/analyze-image', aiController.analyzeImage);

module.exports = router;
