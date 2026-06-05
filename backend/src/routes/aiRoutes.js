const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

router.post('/ask', aiController.askQuestion);
router.post('/chat', aiController.askQuestion);  // alias used by web frontend
router.post('/analyze-image', aiController.analyzeImage);

module.exports = router;

