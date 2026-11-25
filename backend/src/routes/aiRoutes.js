const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { protect, requireActiveSubscription } = require('../middleware/authMiddleware');

router.post('/ask', protect, requireActiveSubscription, aiController.askQuestion);
router.post('/analyze-image', protect, requireActiveSubscription, aiController.analyzeImage);

module.exports = router;
