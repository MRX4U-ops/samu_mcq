const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { protect: jwtProtect } = require('../middleware/authMiddleware');
const paymentStore = require('../services/paymentStore');

// Legacy simple header middleware kept for older internal endpoints
const legacyHeaderProtect = async (req, res, next) => {
  const userId = req.headers['user-id'];
  if (!userId) return res.status(401).json({ message: 'Unauthorized' });
  req.userId = userId;
  next();
};

// Get profile & stats (legacy)
router.get('/profile', legacyHeaderProtect, async (req, res) => {
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

// ── Complete Profile Dashboard Payload (JWT Protected) ──
router.get('/profile/full', jwtProtect, async (req, res) => {
  try {
    const userId = req.user.id;
    const meta = req.user.user_metadata || {};

    const [
      { data: profileRow },
      subState,
      { data: streakRow },
      { data: monthlyLb },
      { data: attemptsRows },
      { data: devicesRows },
      { data: notifRows },
      { data: ticketsRows },
      settings,
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('id', userId).maybeSingle(),
      paymentStore.computeUserSubscriptionState(userId),
      supabaseAdmin.from('user_streaks').select('*').eq('user_id', userId).maybeSingle(),
      supabaseAdmin.from('leaderboard_monthly').select('*').eq('user_id', userId).order('month_start', { ascending: false }).limit(1).maybeSingle(),
      supabaseAdmin.from('attempts').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      supabaseAdmin.from('devices').select('*').eq('user_id', userId).order('last_login', { ascending: false }),
      supabaseAdmin.from('notifications').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(30),
      supabaseAdmin.from('support_tickets').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
      paymentStore.getGlobalSettings(),
    ]);

    const attempts = attemptsRows || [];
    const attemptSumTotal = attempts.reduce((s, a) => s + (Number(a.total_questions) || 0), 0);
    const attemptSumCorrect = attempts.reduce((s, a) => s + (Number(a.correct_count) || 0), 0);

    const totalAttempted = Math.max(Number(profileRow?.total_attempted) || 0, attemptSumTotal);
    const totalCorrect = Math.max(Number(profileRow?.total_correct) || 0, attemptSumCorrect);
    const totalWrong = Math.max(Number(profileRow?.total_wrong) || 0, Math.max(0, totalAttempted - totalCorrect));
    const accuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : (Number(profileRow?.accuracy) || 0);

    res.json({
      personal: {
        id: userId,
        name: meta.full_name || profileRow?.name || meta.name || req.user.email?.split('@')[0] || 'Student',
        email: profileRow?.email || req.user.email || '',
        phone: profileRow?.phone || meta.phone || meta.mobile || '',
        hemisId: profileRow?.hemis_id || meta.hemis_id || '',
        courseYear: profileRow?.course_year || meta.course_year || '',
        semester: profileRow?.semester || meta.semester || '',
        avatarUrl: meta.avatar_url || profileRow?.avatar_url || '',
        role: req.user.role,
        nameChanged: Boolean(meta.name_changed),
      },
      subscription: subState,
      progress: {
        totalAttempted,
        totalCorrect,
        totalWrong,
        accuracy,
        currentStreak: streakRow?.current_streak || 0,
        maxStreak: streakRow?.max_streak || 0,
        monthlyPoints: monthlyLb?.score || monthlyLb?.total_points || attempts.reduce((s, a) => s + (Number(a.score_earned) || 0), 0),
        recentAttempts: attempts.slice(0, 8),
      },
      devices: devicesRows || [],
      notifications: notifRows || [],
      announcement: settings.announcementBanner || '',
      tickets: ticketsRows || [],
    });
  } catch (error) {
    console.error('[users/profile/full] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Update Personal Account Details (Mobile, HEMIS ID, Course Year, Semester) ──
router.put('/profile/details', jwtProtect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { phone, hemisId, courseYear, semester } = req.body || {};

    const cleanPhone = phone !== undefined ? String(phone).trim() : undefined;
    const cleanHemis = hemisId !== undefined ? String(hemisId).trim() : undefined;
    const cleanYear = courseYear !== undefined ? String(courseYear).trim() : undefined;
    const cleanSem = semester !== undefined ? String(semester).trim() : undefined;

    if (cleanPhone && cleanPhone.length > 20) {
      return res.status(400).json({ error: 'Invalid mobile number length.' });
    }

    // 1. Always persist in Supabase Auth user_metadata (guaranteed storage)
    const currentMeta = req.user.user_metadata || {};
    const metaPatch = {
      ...currentMeta,
      ...(cleanPhone !== undefined ? { phone: cleanPhone, mobile: cleanPhone } : {}),
      ...(cleanHemis !== undefined ? { hemis_id: cleanHemis } : {}),
      ...(cleanYear !== undefined ? { course_year: cleanYear } : {}),
      ...(cleanSem !== undefined ? { semester: cleanSem } : {}),
    };

    const { error: authErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      user_metadata: metaPatch,
    });
    if (authErr) throw authErr;

    // 2. Sync phone to profiles table, plus optional academic columns if migration was run
    if (cleanPhone !== undefined) {
      await supabaseAdmin.from('profiles').update({ phone: cleanPhone }).eq('id', userId);
    }
    try {
      const colPatch = {};
      if (cleanHemis !== undefined) colPatch.hemis_id = cleanHemis;
      if (cleanYear !== undefined) colPatch.course_year = cleanYear;
      if (cleanSem !== undefined) colPatch.semester = cleanSem;
      if (Object.keys(colPatch).length > 0) {
        await supabaseAdmin.from('profiles').update(colPatch).eq('id', userId);
      }
    } catch {
      // Optional columns if SQL migration not yet run
    }

    res.json({
      ok: true,
      personal: {
        phone: metaPatch.phone || '',
        hemisId: metaPatch.hemis_id || '',
        courseYear: metaPatch.course_year || '',
        semester: metaPatch.semester || '',
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Device Management Endpoints ──
router.get('/devices', jwtProtect, async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('devices')
      .select('*')
      .eq('user_id', req.user.id)
      .order('last_login', { ascending: false });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/devices/:deviceId', jwtProtect, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { error } = await supabaseAdmin
      .from('devices')
      .delete()
      .eq('user_id', req.user.id)
      .eq('device_id', deviceId);
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/devices/logout-all', jwtProtect, async (req, res) => {
  try {
    const { keepSessionId } = req.body || {};
    let query = supabaseAdmin.from('devices').delete().eq('user_id', req.user.id);
    if (keepSessionId) {
      query = query.neq('device_id', String(keepSessionId));
    }
    const { error } = await query;
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Notifications Endpoints ──
router.get('/notifications', jwtProtect, async (req, res) => {
  try {
    const [{ data: notifs, error }, settings] = await Promise.all([
      supabaseAdmin
        .from('notifications')
        .select('*')
        .eq('user_id', req.user.id)
        .order('created_at', { ascending: false })
        .limit(40),
      paymentStore.getGlobalSettings(),
    ]);
    if (error) throw error;
    res.json({
      notifications: notifs || [],
      announcement: settings.announcementBanner || '',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/notifications/read', jwtProtect, async (req, res) => {
  try {
    const { notificationId } = req.body || {};
    let q = supabaseAdmin.from('notifications').update({ is_read: true }).eq('user_id', req.user.id);
    if (notificationId) {
      q = q.eq('id', notificationId);
    } else {
      q = q.eq('is_read', false);
    }
    const { error } = await q;
    if (error) throw error;
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Per-Topic Past 3 Attempts History (JWT Protected) ──
router.get('/topic-attempts', jwtProtect, async (req, res) => {
  try {
    const history = await paymentStore.getTopicAttemptsHistory(req.user.id);
    res.json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/topic-attempts', jwtProtect, async (req, res) => {
  try {
    const userId = req.user.id;
    const body = req.body || {};
    const { entry, history } = await paymentStore.saveTopicAttempt(userId, body);

    // Also update profile aggregate stats & leaderboard attempts safely
    const totalQ = Number(body.total) || 0;
    const correctQ = Number(body.correct) || 0;
    const wrongQ = Number(body.wrong) || Math.max(0, totalQ - correctQ);

    if (totalQ > 0) {
      try {
        await supabaseAdmin.rpc('record_quiz_attempt', {
          p_user_id: userId,
          p_subject_id: String(body.subjectId || 'general'),
          p_topic_id: String(body.topicDbId || body.topicId || 'topic'),
          p_correct_count: correctQ,
          p_total_questions: totalQ,
        });
      } catch {}

      try {
        const { data: prof } = await supabaseAdmin
          .from('profiles')
          .select('total_attempted, total_correct, total_wrong')
          .eq('id', userId)
          .maybeSingle();
        if (prof) {
          const newTotal = (prof.total_attempted || 0) + totalQ;
          const newCorrect = (prof.total_correct || 0) + correctQ;
          const newWrong = (prof.total_wrong || 0) + wrongQ;
          const newAcc = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;
          await supabaseAdmin
            .from('profiles')
            .update({ total_attempted: newTotal, total_correct: newCorrect, total_wrong: newWrong, accuracy: newAcc })
            .eq('id', userId);
        }
      } catch {}
    }

    res.status(201).json({ ok: true, entry, history });
  } catch (error) {
    console.error('[users/topic-attempts] save error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update performance stats
router.post('/stats', legacyHeaderProtect, async (req, res) => {
  const { attempted, correct, wrong } = req.body;
  try {
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
        accuracy: newAccuracy,
      })
      .eq('id', req.userId);

    if (updateError) throw updateError;
    res.json({ success: true, stats: { total_attempted: newTotal, total_correct: newCorrect, accuracy: newAccuracy } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle bookmark
router.post('/bookmarks/toggle', legacyHeaderProtect, async (req, res) => {
  const { questionId } = req.body;
  try {
    const { data: existing } = await supabaseAdmin
      .from('bookmarks')
      .select('*')
      .eq('user_id', req.userId)
      .eq('question_id', questionId)
      .maybeSingle();

    if (existing) {
      await supabaseAdmin.from('bookmarks').delete().eq('id', existing.id);
      res.json({ bookmarked: false });
    } else {
      await supabaseAdmin.from('bookmarks').insert({ user_id: req.userId, question_id: questionId });
      res.json({ bookmarked: true });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user bookmarks
router.get('/bookmarks', legacyHeaderProtect, async (req, res) => {
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

// Claim single active device session (invalidates all older devices)
router.post('/session/claim', async (req, res) => {
  const { userId, sessionId } = req.body || {};
  if (!userId || !sessionId) {
    return res.status(400).json({ message: 'userId and sessionId are required' });
  }
  try {
    await supabaseAdmin.from('devices').delete().eq('user_id', userId);
    const { error } = await supabaseAdmin.from('devices').insert({
      user_id: userId,
      device_id: String(sessionId),
      last_login: new Date().toISOString(),
    });
    if (error) throw error;
    res.json({ ok: true, activeSessionId: sessionId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Check if current device session is still the active one
router.get('/session/check', async (req, res) => {
  const { userId, sessionId } = req.query || {};
  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('devices')
      .select('device_id, last_login')
      .eq('user_id', userId)
      .order('last_login', { ascending: false })
      .limit(1);

    if (error) throw error;
    const latest = data && data[0];
    if (!latest) {
      return res.json({ valid: true, activeSessionId: null });
    }
    const valid = Boolean(sessionId && latest.device_id === String(sessionId));
    res.json({ valid, activeSessionId: latest.device_id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
