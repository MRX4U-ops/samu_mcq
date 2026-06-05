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

// Helper to catch missing table errors and return mock/fallback data gracefully
const handleDbError = (error, res, fallbackData = []) => {
  console.log('Database operation failed:', error.message);
  const msg = error.message || '';
  if (
    error.code === '42P01' || 
    msg.includes('relation') || 
    msg.includes('does not exist') || 
    msg.includes('schema cache') || 
    msg.includes('Could not find the table')
  ) {
    return res.json({ isFallback: true, data: fallbackData });
  }
  return res.status(500).json({ message: error.message });
};

// --- STUDY ALARMS ---

// Get all study alarms for user
router.get('/alarms', protect, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('study_alarms')
      .select('*')
      .eq('user_id', req.userId)
      .order('created_at', { ascending: false });

    if (error) return handleDbError(error, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new study alarm
router.post('/alarms', protect, async (req, res) => {
  const { title, time, repeat_type, days_of_week, ringtone_enabled, vibration_enabled, is_active } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('study_alarms')
      .insert({
        user_id: req.userId,
        title,
        time,
        repeat_type,
        days_of_week,
        ringtone_enabled: ringtone_enabled !== undefined ? ringtone_enabled : true,
        vibration_enabled: vibration_enabled !== undefined ? vibration_enabled : true,
        is_active: is_active !== undefined ? is_active : true
      })
      .select()
      .single();

    if (error) return handleDbError(error, res, { id: 'fallback-' + Date.now(), ...req.body });
    res.status(210).json(data); // 210 custom created/success code to represent direct insert
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update an existing study alarm
router.put('/alarms/:id', protect, async (req, res) => {
  const { title, time, repeat_type, days_of_week, ringtone_enabled, vibration_enabled, is_active } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('study_alarms')
      .update({
        title,
        time,
        repeat_type,
        days_of_week,
        ringtone_enabled,
        vibration_enabled,
        is_active
      })
      .eq('id', req.params.id)
      .eq('user_id', req.userId)
      .select()
      .single();

    if (error) return handleDbError(error, res, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a study alarm
router.delete('/alarms/:id', protect, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('study_alarms')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return handleDbError(error, res, { success: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- EXAM REMINDERS ---

// Get all exam reminders for user
router.get('/exams', protect, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_reminders')
      .select('*')
      .eq('user_id', req.userId)
      .order('exam_date', { ascending: true });

    if (error) return handleDbError(error, res);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new exam reminder
router.post('/exams', protect, async (req, res) => {
  const { subject, exam_date, notes } = req.body;
  try {
    const { data, error } = await supabaseAdmin
      .from('exam_reminders')
      .insert({
        user_id: req.userId,
        subject,
        exam_date,
        notes
      })
      .select()
      .single();

    if (error) return handleDbError(error, res, { id: 'fallback-' + Date.now(), ...req.body });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an exam reminder
router.delete('/exams/:id', protect, async (req, res) => {
  try {
    const { error } = await supabaseAdmin
      .from('exam_reminders')
      .delete()
      .eq('id', req.params.id)
      .eq('user_id', req.userId);

    if (error) return handleDbError(error, res, { success: false });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
