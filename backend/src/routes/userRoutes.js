const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');

// Middleware to verify session (Simple version for demo)
const protect = async (req, res, next) => {
  const userId = req.headers['user-id']; // For simplicity in dev, pass ID in header
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  req.userId = userId;
  next();
};

// Get profile & stats
router.get('/profile', protect, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', req.userId)
      .single();
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update performance stats
router.post('/stats', protect, async (req, res) => {
  const { attempted, correct, wrong } = req.body;
  
  try {
    // Get current stats
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('total_attempted, total_correct, total_wrong')
      .eq('id', req.userId)
      .single();

    if (fetchError) throw fetchError;

    const newTotal = (profile.total_attempted || 0) + attempted;
    const newCorrect = (profile.total_correct || 0) + correct;
    const newWrong = (profile.total_wrong || 0) + wrong;
    const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;

    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({
        total_attempted: newTotal,
        total_correct: newCorrect,
        total_wrong: newWrong,
        accuracy: newAccuracy
      })
      .eq('id', req.userId);

    if (updateError) throw updateError;
    res.json({ success: true, stats: { total_attempted: newTotal, total_correct: newCorrect, accuracy: newAccuracy } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle bookmark
router.post('/bookmarks/toggle', protect, async (req, res) => {
  const { questionId } = req.body;
  
  try {
    // Check if exists
    const { data: existing } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('user_id', req.userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (existing) {
      // Remove
      await supabaseAdmin.from('bookmarks').delete().eq('id', existing.id);
      res.json({ bookmarked: false });
    } else {
      // Add
      await supabaseAdmin.from('bookmarks').insert({ user_id: req.userId, question_id: questionId });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookmarks
router.get('/bookmarks', protect, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('user_id', req.userId);
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
