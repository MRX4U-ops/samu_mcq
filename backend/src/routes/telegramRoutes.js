const express = require('express');
const router = express.Router();
const telegramService = require('../services/telegramService');

// GET /api/telegram/status
router.get('/status', (req, res) => {
  res.json({
    configured: telegramService.isConfigured(),
  });
});

// GET /api/telegram/topics
router.get('/topics', async (req, res) => {
  try {
    if (!telegramService.isConfigured()) {
      return res.status(503).json({
        configured: false,
        topics: [],
      });
    }
    const data = await telegramService.getForumTopics();
    res.json({ configured: true, ...data });
  } catch (err) {
    console.error('Telegram topics error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/telegram/feed?limit=30&offsetId=0&type=all&topicId=0
router.get('/feed', async (req, res) => {
  try {
    if (!telegramService.isConfigured()) {
      return res.status(503).json({
        configured: false,
        error: 'Telegram group sync is not configured yet on the server.',
      });
    }

    const topicId = parseInt(req.query.topicId || '0', 10);
    const defaultLimit = topicId > 0 ? '300' : '40';
    const limit = Math.min(parseInt(req.query.limit || defaultLimit, 10), 500);
    const offsetId = parseInt(req.query.offsetId || '0', 10);
    const type = ['all', 'video', 'pdf', 'document'].includes(req.query.type)
      ? req.query.type
      : 'all';

    const data = await telegramService.getGroupMedia({ limit, offsetId, type, topicId });
    res.json({ configured: true, ...data });
  } catch (err) {
    console.error('Telegram feed error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/telegram/stream/:messageId
router.get('/stream/:messageId', async (req, res) => {
  try {
    await telegramService.streamMedia(req.params.messageId, req, res);
  } catch (err) {
    console.error('Telegram stream error:', err.message);
    if (!res.headersSent) {
      res.status(500).json({ error: err.message });
    } else {
      res.end();
    }
  }
});

// GET /api/telegram/thumb/:messageId
router.get('/thumb/:messageId', async (req, res) => {
  try {
    await telegramService.getThumbnail(req.params.messageId, res);
  } catch (err) {
    if (!res.headersSent) res.status(404).end();
  }
});

module.exports = router;
