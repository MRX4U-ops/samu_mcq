const express = require('express');
const router = express.Router();
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');

// Super Admin Email Check
const SUPER_ADMIN_EMAIL = 'mohd6396889713@gmail.com';

// Admin Authorization Middleware
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid or expired session token' });
    }

    const isSuperAdmin = user.email?.toLowerCase() === SUPER_ADMIN_EMAIL;

    // Check profile role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!isSuperAdmin && profile?.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admin credentials required' });
    }

    req.user = {
      ...user,
      isSuperAdmin,
      role: isSuperAdmin ? 'super_admin' : (profile?.role || 'admin'),
      profile
    };

    next();
  } catch (err) {
    console.error('requireAdmin error:', err);
    res.status(500).json({ error: 'Authentication verification failure' });
  }
};

// Apply to all admin endpoints
router.use(requireAdmin);

// ==========================================
// 1. DASHBOARD & SYSTEM OVERVIEW
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
    // Parallel counts from Supabase
    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: blockedUsers },
      { count: totalMCQs },
      { count: pendingPayments },
      { count: approvedPayments },
      { count: totalCourses },
      { count: totalSubjects },
      { count: totalTopics },
      { count: openTickets },
      { data: recentSubs }
    ] = await Promise.all([
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabaseAdmin.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'blocked'),
      supabaseAdmin.from('mcqs').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabaseAdmin.from('payment_requests').select('*', { count: 'exact', head: true }).eq('status', 'approved'),
      supabaseAdmin.from('courses').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('subjects').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('topics').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('support_tickets').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'IN_PROGRESS', 'open']),
      supabaseAdmin.from('subscriptions').select('id, start_date, end_date, status, profiles:user_id(name, email)').order('created_at', { ascending: false }).limit(5)
    ]);

    // Active subscriptions count: end_date >= now and status = active
    const nowIso = new Date().toISOString();
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', nowIso);

    // Calculate revenue from approved payments (standard ₹49 per approval)
    const { data: approvedData } = await supabaseAdmin
      .from('payment_requests')
      .select('amount')
      .eq('status', 'approved');
    
    const totalRevenue = (approvedData || []).reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

    res.json({
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      blockedUsers: blockedUsers || 0,
      totalMCQs: totalMCQs || 0,
      pendingPayments: pendingPayments || 0,
      approvedPayments: approvedPayments || 0,
      totalRevenue,
      activeSubscriptions: activeSubscriptions || 0,
      totalCourses: totalCourses || 6,
      totalSubjects: totalSubjects || 128,
      totalTopics: totalTopics || 1930,
      openTickets: openTickets || 0,
      recentSubs: recentSubs || []
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard metrics' });
  }
});

// ==========================================
// 2. USER MANAGEMENT
// ==========================================
router.get('/users', async (req, res) => {
  try {
    const { search, status, role, page = 1, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('profiles')
      .select('*, subscriptions(id, status, start_date, end_date)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%,phone.ilike.%${search}%`);
    }
    if (status) query = query.eq('status', status);
    if (role) query = query.eq('role', role);

    const { data: users, count, error } = await query;
    if (error) throw error;

    // Normalize subscription status
    const formatted = (users || []).map(u => {
      const activeSub = (u.subscriptions || []).find(s => s.status === 'active' && new Date(s.end_date) > new Date());
      return {
        ...u,
        hasActiveSubscription: !!activeSub,
        subscriptionEndDate: activeSub?.end_date || u.subscriptions?.[0]?.end_date || null
      };
    });

    res.json({ users: formatted, total: count });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve user directory' });
  }
});

// Create/Invite User by Email
router.post('/users', async (req, res) => {
  try {
    const { email, name, phone, grantDays = 0 } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Check if user already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .single();

    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create user via Supabase Auth Admin
    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name || email.split('@')[0] }
    });

    if (authErr) throw authErr;

    // Create profile
    const { data: newProfile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name: name || email.split('@')[0],
        phone: phone || null,
        role: 'user',
        status: 'active'
      })
      .select()
      .single();

    if (pErr) throw pErr;

    // Grant subscription if requested
    if (grantDays > 0) {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + grantDays * 86400000);
      await supabaseAdmin.from('subscriptions').insert({
        user_id: authData.user.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
        status: 'active'
      });
    }

    res.status(201).json({ message: 'User created successfully', user: newProfile });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

// Update User (Block/Unblock, Notes, Role)
router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, name, phone, admin_notes } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

    // Only Super Admin can change roles
    if (role !== undefined) {
      if (!req.user.isSuperAdmin) {
        return res.status(403).json({ error: 'Only Super Admin can modify user permissions' });
      }
      updates.role = role;
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'User updated successfully', user: data });
  } catch (error) {
    console.error('Admin update user error:', error);
    res.status(500).json({ error: 'Failed to update user profile' });
  }
});

// Delete User Profile
router.delete('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Admin can permanently remove accounts' });
    }

    // Delete from profiles
    await supabaseAdmin.from('profiles').delete().eq('id', id);
    // Delete from auth.users
    await supabaseAdmin.auth.admin.deleteUser(id);

    res.json({ message: 'User removed successfully' });
  } catch (error) {
    console.error('Admin delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// ==========================================
// 3. SUBSCRIPTION MANAGEMENT
// ==========================================
router.get('/subscriptions', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 50 } = req.query;
    let query = supabaseAdmin
      .from('subscriptions')
      .select('*, profiles:user_id(name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) query = query.eq('status', status);

    const { data: subs, count, error } = await query;
    if (error) throw error;

    const now = new Date();
    const formatted = (subs || []).map(s => {
      const end = new Date(s.end_date);
      const remainingDays = Math.max(0, Math.ceil((end - now) / (1000 * 60 * 60 * 24)));
      const isExpired = end < now;
      return {
        ...s,
        remainingDays,
        isExpired,
        displayStatus: (s.status === 'active' && !isExpired) ? 'active' : 'expired'
      };
    });

    res.json({ subscriptions: formatted, total: count });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription list' });
  }
});

// Manual Subscription Activation / Extension
router.post('/subscriptions/manual', async (req, res) => {
  try {
    const { userId, days = 90, customDate, reason = 'Admin grant' } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    // Check existing subscription
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    let startDate = new Date();
    let endDate;

    if (customDate) {
      endDate = new Date(customDate);
    } else {
      // If active, extend from existing end date; otherwise from now
      const baseDate = (existingSub && new Date(existingSub.end_date) > new Date())
        ? new Date(existingSub.end_date)
        : new Date();
      endDate = new Date(baseDate.getTime() + Number(days) * 86400000);
    }

    let result;
    if (existingSub) {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .update({
          status: 'active',
          end_date: endDate.toISOString()
        })
        .eq('id', existingSub.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: userId,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    res.json({ message: 'Subscription successfully activated/extended', subscription: result });
  } catch (error) {
    console.error('Admin manual subscription error:', error);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

// Revoke/Suspend Subscription
router.post('/subscriptions/revoke/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('subscriptions')
      .update({ status: 'revoked', end_date: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Subscription revoked', subscription: data });
  } catch (error) {
    console.error('Admin revoke subscription error:', error);
    res.status(500).json({ error: 'Failed to revoke subscription' });
  }
});

// ==========================================
// 4. PAYMENT REQUESTS & VERIFICATION
// ==========================================
router.get('/payment-requests', async (req, res) => {
  try {
    const { status, search } = req.query;
    let query = supabaseAdmin
      .from('payment_requests')
      .select('*, profiles:user_id(name, email, phone)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);
    if (search) {
      query = query.or(`transaction_id.ilike.%${search}%,payment_reference.ilike.%${search}%`);
    }

    const { data: requests, error } = await query;
    if (error) throw error;

    res.json(requests || []);
  } catch (error) {
    console.error('Admin payment requests error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment records' });
  }
});

// Approve Payment & Activate Subscription
router.post('/payment-approve/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { validityDays = 90 } = req.body;

    const { data: request, error: fetchErr } = await supabaseAdmin
      .from('payment_requests')
      .select('*, profiles:user_id(id, email, name)')
      .eq('id', id)
      .single();

    if (fetchErr || !request) return res.status(404).json({ error: 'Payment request not found' });
    if (request.status === 'approved') return res.status(400).json({ error: 'Payment already approved' });

    // 1. Mark payment approved
    const { error: updateErr } = await supabaseAdmin
      .from('payment_requests')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (updateErr) throw updateErr;

    // 2. Grant 90-day subscription (or extend existing)
    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', request.user_id)
      .order('end_date', { ascending: false })
      .limit(1)
      .single();

    let startDate = new Date();
    const baseDate = (existingSub && new Date(existingSub.end_date) > new Date())
      ? new Date(existingSub.end_date)
      : new Date();
    const endDate = new Date(baseDate.getTime() + Number(validityDays) * 86400000);

    if (existingSub) {
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'active', end_date: endDate.toISOString() })
        .eq('id', existingSub.id);
    } else {
      await supabaseAdmin
        .from('subscriptions')
        .insert({
          user_id: request.user_id,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'active'
        });
    }

    res.json({ message: 'Payment approved and subscription activated for 90 days' });
  } catch (error) {
    console.error('Admin approve payment error:', error);
    res.status(500).json({ error: 'Failed to approve payment request' });
  }
});

// Reject Payment
router.post('/payment-reject/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason = 'Transaction ID not verified' } = req.body;

    const { data, error } = await supabaseAdmin
      .from('payment_requests')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Payment marked as rejected', request: data });
  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ error: 'Failed to reject payment' });
  }
});

// Record Manual / Offline Payment
router.post('/payments/manual', async (req, res) => {
  try {
    const { userId, amount = 49, transactionId, validityDays = 90 } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const ref = 'MANUAL_' + Math.random().toString(36).substring(2, 9).toUpperCase();
    const { data: payment, error } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        amount: Number(amount),
        transaction_id: transactionId || ref,
        payment_reference: ref,
        status: 'approved'
      })
      .select()
      .single();

    if (error) throw error;

    // Activate subscription
    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + Number(validityDays) * 86400000);
    await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
      status: 'active'
    });

    res.json({ message: 'Manual payment recorded and subscription activated', payment });
  } catch (error) {
    console.error('Admin manual payment error:', error);
    res.status(500).json({ error: 'Failed to record manual payment' });
  }
});

// ==========================================
// 5. ACADEMIC HIERARCHY & LIVE MCQ EDITOR
// ==========================================
router.get('/academic/courses', async (req, res) => {
  try {
    const { data: courses, error } = await supabaseAdmin
      .from('courses')
      .select('*, subjects(id, title, topics(id, title))')
      .order('id', { ascending: true });

    if (error) throw error;
    res.json(courses || []);
  } catch (error) {
    console.error('Admin get courses error:', error);
    res.status(500).json({ error: 'Failed to retrieve courses' });
  }
});

router.get('/academic/mcqs', async (req, res) => {
  try {
    const { topicId, taskType = 'test_question', search, page = 1, limit = 100 } = req.query;
    let query = supabaseAdmin
      .from('mcqs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: true })
      .range((page - 1) * limit, page * limit - 1);

    if (topicId) query = query.eq('topic_id', topicId);
    if (taskType) query = query.eq('task_type', taskType);
    if (search) query = query.ilike('question', `%${search}%`);

    const { data: mcqs, count, error } = await query;
    if (error) throw error;

    res.json({ mcqs: mcqs || [], total: count });
  } catch (error) {
    console.error('Admin get mcqs error:', error);
    res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
});

// Add Single MCQ
router.post('/academic/mcqs', async (req, res) => {
  try {
    const { topicId, question, options, correctIndex, explanation, taskType = 'test_question' } = req.body;
    if (!topicId || !question || !options || correctIndex === undefined) {
      return res.status(400).json({ error: 'Missing required MCQ fields' });
    }

    const { data, error } = await supabaseAdmin
      .from('mcqs')
      .insert({
        topic_id: topicId,
        question,
        options,
        correct_index: Number(correctIndex),
        explanation: explanation || '',
        task_type: taskType
      })
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ message: 'MCQ added successfully', mcq: data });
  } catch (error) {
    console.error('Admin add MCQ error:', error);
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
});

// Edit MCQ Live
router.put('/academic/mcqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { question, options, correctIndex, explanation, taskType } = req.body;

    const updates = {};
    if (question !== undefined) updates.question = question;
    if (options !== undefined) updates.options = options;
    if (correctIndex !== undefined) updates.correct_index = Number(correctIndex);
    if (explanation !== undefined) updates.explanation = explanation;
    if (taskType !== undefined) updates.task_type = taskType;

    const { data, error } = await supabaseAdmin
      .from('mcqs')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'MCQ updated live in database', mcq: data });
  } catch (error) {
    console.error('Admin update MCQ error:', error);
    res.status(500).json({ error: 'Failed to update MCQ' });
  }
});

// Delete MCQ
router.delete('/academic/mcqs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabaseAdmin.from('mcqs').delete().eq('id', id);
    if (error) throw error;
    res.json({ message: 'MCQ removed successfully' });
  } catch (error) {
    console.error('Admin delete MCQ error:', error);
    res.status(500).json({ error: 'Failed to delete MCQ' });
  }
});

// Bulk Import MCQs
router.post('/academic/mcqs/bulk', async (req, res) => {
  try {
    const { topicId, mcqs, taskType = 'test_question' } = req.body;
    if (!topicId || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ error: 'Valid topicId and array of MCQs required' });
    }

    const payload = mcqs.map(q => ({
      topic_id: topicId,
      question: q.question,
      options: q.options,
      correct_index: Number(q.correctIndex || 0),
      explanation: q.explanation || '',
      task_type: taskType
    }));

    const { data, error } = await supabaseAdmin.from('mcqs').insert(payload).select();
    if (error) throw error;

    res.status(201).json({ message: `Successfully imported ${data.length} MCQs`, count: data.length });
  } catch (error) {
    console.error('Admin bulk import error:', error);
    res.status(500).json({ error: 'Failed to bulk import MCQs' });
  }
});

// ==========================================
// 6. SUPPORT TICKETS & HELP DESK
// ==========================================
router.get('/support', async (req, res) => {
  try {
    const { status } = req.query;
    let query = supabaseAdmin
      .from('support_tickets')
      .select('*, profiles:user_id(name, email, phone)')
      .order('created_at', { ascending: false });

    if (status) query = query.eq('status', status);

    const { data: tickets, error } = await query;
    if (error) throw error;

    res.json(tickets || []);
  } catch (error) {
    console.error('Admin support tickets error:', error);
    res.status(500).json({ error: 'Failed to retrieve support tickets' });
  }
});

router.put('/support/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, priority } = req.body;

    const updates = { updated_at: new Date().toISOString() };
    if (status) updates.status = status;
    if (adminNotes !== undefined) updates.admin_notes = adminNotes;
    if (priority) updates.priority = priority;

    const { data, error } = await supabaseAdmin
      .from('support_tickets')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Ticket updated', ticket: data });
  } catch (error) {
    console.error('Admin update ticket error:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

// ==========================================
// 7. SUB-ADMINS & PERMISSIONS (SUPER ADMIN)
// ==========================================
router.get('/sub-admins', async (req, res) => {
  try {
    const { data: admins, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin');

    if (error) throw error;
    res.json(admins || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-admins' });
  }
});

router.post('/sub-admins', async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Admin can appoint sub-admins' });
    }

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .ilike('email', email)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: `Promoted ${email} to Admin`, profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to appoint sub-admin' });
  }
});

router.delete('/sub-admins/:id', async (req, res) => {
  try {
    if (!req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Admin can revoke admin privileges' });
    }

    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json({ message: 'Admin privileges revoked', profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke admin privileges' });
  }
});

module.exports = router;
