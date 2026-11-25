const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const {
  SUPER_ADMIN_EMAIL,
  protect,
  adminOnly,
  superAdminOnly,
  requirePermission,
} = require('../middleware/authMiddleware');
const paymentStore = require('../services/paymentStore');

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
}

// Apply authentication & admin role check to all /api/admin endpoints
router.use(protect);
router.use(adminOnly);

// Current admin identity & permissions
router.get('/me', (req, res) => {
  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
    isSuperAdmin: req.user.isSuperAdmin,
    permissions: req.user.permissions,
  });
});

// ==========================================
// 1. DASHBOARD & SYSTEM OVERVIEW
// ==========================================
router.get('/dashboard', async (req, res) => {
  try {
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
      { data: recentSubs },
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
      supabaseAdmin.from('subscriptions').select('id, start_date, end_date, status, profiles:user_id(name, email)').order('created_at', { ascending: false }).limit(5),
    ]);

    const nowIso = new Date().toISOString();
    const { count: activeSubscriptions } = await supabaseAdmin
      .from('subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active')
      .gte('end_date', nowIso);

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
      recentSubs: recentSubs || [],
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to aggregate dashboard metrics' });
  }
});

// ==========================================
// 1B. DYNAMIC SUBSCRIPTION PLANS CRUD
// ==========================================
router.get('/plans', async (req, res) => {
  try {
    const plans = await paymentStore.getPlans({ activeOnly: false });
    res.json(plans);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/plans', requirePermission('manage_plans'), async (req, res) => {
  try {
    const plan = await paymentStore.createPlan(req.body || {}, req.user);
    await paymentStore.appendAuditLog({
      category: 'PLAN',
      targetId: plan.id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PLAN_CREATED',
      newValues: plan,
      reason: 'Admin created subscription plan',
      ipAddress: getClientIp(req),
    });
    res.status(201).json(plan);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/plans/:id', requirePermission('manage_plans'), async (req, res) => {
  try {
    const { prev, updated } = await paymentStore.updatePlan(req.params.id, req.body || {}, req.user);
    await paymentStore.appendAuditLog({
      category: 'PLAN',
      targetId: updated.id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PLAN_UPDATED',
      previousValues: prev,
      newValues: updated,
      reason: 'Admin updated subscription plan',
      ipAddress: getClientIp(req),
    });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete('/plans/:id', requirePermission('manage_plans'), async (req, res) => {
  try {
    const deleted = await paymentStore.deletePlan(req.params.id);
    await paymentStore.appendAuditLog({
      category: 'PLAN',
      targetId: deleted.id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PLAN_DELETED',
      previousValues: deleted,
      reason: 'Admin deleted subscription plan',
      ipAddress: getClientIp(req),
    });
    res.json({ ok: true, deleted });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ==========================================
// 1C. GLOBAL SETTINGS & PAYMENT CONFIGURATION
// ==========================================
router.get('/settings', async (req, res) => {
  try {
    const settings = await paymentStore.getGlobalSettings();
    res.json({
      ...settings,
      autoVerificationConfigured: paymentStore.isAutoVerificationConfigured(),
      webhookConfigured: paymentStore.isWebhookConfigured(),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/settings', requirePermission('manage_settings'), async (req, res) => {
  try {
    const body = req.body || {};
    // Pricing, UPI ID, and verification settings can only be changed by Super Admin
    const sensitiveFields = ['upiId', 'defaultPrice', 'defaultValidityDays', 'verificationMode', 'autoVerifyEnabled'];
    const touchesSensitive = sensitiveFields.some((f) => body[f] !== undefined);
    if (touchesSensitive && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Only Super Admin can modify pricing, UPI ID, or payment verification settings.' });
    }

    const prev = await paymentStore.getGlobalSettings();
    const updated = await paymentStore.updateGlobalSettings(body, req.user);
    await paymentStore.appendAuditLog({
      category: 'SETTINGS',
      targetId: 'global',
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'SETTINGS_UPDATED',
      previousValues: prev,
      newValues: updated,
      reason: 'Admin updated global platform settings',
      ipAddress: getClientIp(req),
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
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

    const formatted = (users || []).map((u) => {
      const subs = Array.isArray(u.subscriptions) ? u.subscriptions : (u.subscriptions ? [u.subscriptions] : []);
      const activeSub = subs.find((s) => s.status === 'active' && new Date(s.end_date) > new Date());
      return {
        ...u,
        hasActiveSubscription: !!activeSub,
        subscriptionEndDate: activeSub?.end_date || subs[0]?.end_date || null,
      };
    });

    res.json({ users: formatted, total: count });
  } catch (error) {
    console.error('Admin get users error:', error);
    res.status(500).json({ error: 'Failed to retrieve user directory' });
  }
});

router.post('/users', async (req, res) => {
  try {
    const { email, name, phone, grantDays = 0 } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
    const { data: authData, error: authErr } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { full_name: name || email.split('@')[0], phone: phone || '' },
    });
    if (authErr) throw authErr;

    const { data: newProfile, error: pErr } = await supabaseAdmin
      .from('profiles')
      .insert({
        id: authData.user.id,
        email,
        name: name || email.split('@')[0],
        phone: phone || null,
        role: 'user',
        status: 'active',
      })
      .select()
      .single();
    if (pErr) throw pErr;

    if (grantDays > 0) {
      await paymentStore.activateOrExtendSubscription({
        userId: authData.user.id,
        validityDays: Number(grantDays),
        planName: `Admin Grant (${grantDays} Days)`,
        price: 0,
        activationSource: 'MANUAL_ADMIN',
        adminId: req.user.id,
        adminEmail: req.user.email,
        reason: 'Granted during user creation',
      });
    }

    res.status(201).json({ message: 'User created successfully', user: newProfile });
  } catch (error) {
    console.error('Admin create user error:', error);
    res.status(500).json({ error: error.message || 'Failed to create user' });
  }
});

router.put('/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, role, name, phone, admin_notes } = req.body;

    const updates = {};
    if (status !== undefined) updates.status = status;
    if (name !== undefined) updates.name = name;
    if (phone !== undefined) updates.phone = phone;
    if (admin_notes !== undefined) updates.admin_notes = admin_notes;

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

router.delete('/users/:id', superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    await supabaseAdmin.from('profiles').delete().eq('id', id);
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
    const { search = '', status = 'all', page = 1, limit = 200 } = req.query;
    const { data: subs, count, error } = await supabaseAdmin
      .from('subscriptions')
      .select('*, profiles:user_id(name, email, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (error) throw error;

    const now = new Date();
    const formatted = await Promise.all(
      (subs || []).map(async (s) => {
        const meta = await paymentStore.getSubscriptionMeta(s.user_id);
        const end = new Date(s.end_date);
        const isSuspended = meta?.lifecycleStatus === 'SUSPENDED';
        const isCancelled = meta?.lifecycleStatus === 'CANCELLED' || meta?.lifecycleStatus === 'REVOKED';
        const isFuture = end > now;
        const isActive = s.status === 'active' && isFuture && !isSuspended && !isCancelled;
        const remainingDays = isActive ? Math.max(0, Math.ceil((end - now) / 86400000)) : 0;
        const lifecycleStatus = isSuspended ? 'SUSPENDED' : isCancelled ? 'CANCELLED' : isActive ? 'ACTIVE' : 'EXPIRED';

        return {
          ...s,
          remainingDays,
          isExpired: !isActive,
          displayStatus: isActive ? 'active' : lifecycleStatus.toLowerCase(),
          lifecycleStatus,
          planName: meta?.planName || 'Standard Pass',
          activationSource: meta?.activationSource || 'SYSTEM',
          reason: meta?.reason || '',
          updatedAt: meta?.updatedAt || s.created_at,
        };
      })
    );

    let filtered = formatted;
    if (status && status !== 'all') {
      filtered = filtered.filter((s) => s.displayStatus === status.toLowerCase() || s.lifecycleStatus === status.toUpperCase());
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      filtered = filtered.filter((s) => {
        const p = s.profiles || {};
        return (
          (p.name || '').toLowerCase().includes(q) ||
          (p.email || '').toLowerCase().includes(q) ||
          (p.phone || '').toLowerCase().includes(q)
        );
      });
    }

    res.json({ subscriptions: filtered, total: count || filtered.length });
  } catch (error) {
    console.error('Admin subscriptions error:', error);
    res.status(500).json({ error: 'Failed to retrieve subscription list' });
  }
});

// Manual Subscription Activation / Extension (Requires manage_subscriptions + reason)
router.post('/subscriptions/manual', requirePermission('manage_subscriptions'), async (req, res) => {
  try {
    const { userId, days = 90, customDate, reason, planName } = req.body || {};
    if (!userId) return res.status(400).json({ error: 'User ID is required' });
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'A clear reason is required for manual subscription changes.' });
    }

    const { data: existingSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('end_date', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (customDate) {
      const targetEnd = new Date(customDate);
      if (Number.isNaN(targetEnd.getTime())) return res.status(400).json({ error: 'Invalid customDate' });
      const nowIso = new Date().toISOString();
      const prevMeta = await paymentStore.getSubscriptionMeta(userId);
      if (existingSub) {
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: targetEnd > new Date() ? 'active' : 'expired', end_date: targetEnd.toISOString() })
          .eq('id', existingSub.id);
      } else {
        await supabaseAdmin.from('subscriptions').insert({
          user_id: userId,
          start_date: nowIso,
          end_date: targetEnd.toISOString(),
          status: targetEnd > new Date() ? 'active' : 'expired',
        });
      }
      await paymentStore.saveSubscriptionMeta(userId, {
        ...(prevMeta || {}),
        userId,
        planName: planName || prevMeta?.planName || 'Admin Custom Plan',
        lifecycleStatus: targetEnd > new Date() ? 'ACTIVE' : 'EXPIRED',
        expiryDate: targetEnd.toISOString(),
        activationSource: 'MANUAL_ADMIN',
        reason,
        updatedAt: nowIso,
        updatedBy: req.user.email,
      });
      await paymentStore.appendAuditLog({
        category: 'SUBSCRIPTION',
        targetId: existingSub?.id || userId,
        userId,
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: 'SUBSCRIPTION_EXPIRY_CHANGED',
        previousValues: existingSub,
        newValues: { end_date: targetEnd.toISOString() },
        reason,
        ipAddress: getClientIp(req),
      });
      return res.json({ message: 'Subscription expiry updated', endDate: targetEnd.toISOString() });
    }

    const result = await paymentStore.activateOrExtendSubscription({
      userId,
      validityDays: Number(days),
      planName: planName || `Admin Grant (${days}d)`,
      price: 0,
      activationSource: 'MANUAL_ADMIN',
      adminId: req.user.id,
      adminEmail: req.user.email,
      reason: String(reason).trim(),
    });

    res.json({ message: 'Subscription successfully activated/extended', subscription: result });
  } catch (error) {
    console.error('Admin manual subscription error:', error);
    res.status(500).json({ error: error.message || 'Failed to update subscription' });
  }
});

// Suspend / Reinstate / Revoke / Cancel Subscription
router.post('/subscriptions/:id/status', requirePermission('manage_subscriptions'), async (req, res) => {
  try {
    const { id } = req.params;
    const { action, reason, days, customDate } = req.body || {};
    if (!reason || !String(reason).trim()) {
      return res.status(400).json({ error: 'Reason is required for subscription status changes.' });
    }

    const { data: sub, error: fetchErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !sub) return res.status(404).json({ error: 'Subscription not found' });
    const prevMeta = await paymentStore.getSubscriptionMeta(sub.user_id);
    const now = new Date();
    const nowIso = now.toISOString();

    if (action === 'suspend' || action === 'revoke' || action === 'cancel') {
      const lifecycleStatus = action === 'suspend' ? 'SUSPENDED' : 'CANCELLED';
      await supabaseAdmin
        .from('subscriptions')
        .update({ status: 'expired', end_date: new Date(now.getTime() - 1000).toISOString() })
        .eq('id', sub.id);

      await paymentStore.saveSubscriptionMeta(sub.user_id, {
        ...(prevMeta || {}),
        userId: sub.user_id,
        lifecycleStatus,
        reason,
        updatedAt: nowIso,
        updatedBy: req.user.email,
      });

      await paymentStore.appendAuditLog({
        category: 'SUBSCRIPTION',
        targetId: sub.id,
        userId: sub.user_id,
        adminId: req.user.id,
        adminEmail: req.user.email,
        action: `SUBSCRIPTION_${lifecycleStatus}`,
        previousValues: { status: sub.status, end_date: sub.end_date, lifecycleStatus: prevMeta?.lifecycleStatus },
        newValues: { status: 'expired', lifecycleStatus },
        reason,
        ipAddress: getClientIp(req),
      });

      await paymentStore.createNotification({
        userId: sub.user_id,
        title: action === 'suspend' ? 'Subscription Suspended' : 'Subscription Cancelled',
        body: `Your subscription was ${action === 'suspend' ? 'suspended' : 'cancelled'}. Reason: ${reason}`,
        type: 'subscription_suspended',
        data: { reason },
      });

      return res.json({ message: `Subscription ${lifecycleStatus.toLowerCase()}`, lifecycleStatus });
    }

    if (action === 'reinstate') {
      const targetDays = Number(days) > 0 ? Number(days) : (prevMeta?.validityDays || 30);
      const result = await paymentStore.activateOrExtendSubscription({
        userId: sub.user_id,
        validityDays: targetDays,
        planId: prevMeta?.planId || 'reinstated',
        planName: prevMeta?.planName || 'Reinstated Pass',
        price: prevMeta?.price ?? 0,
        activationSource: 'ADMIN_REINSTATE',
        adminId: req.user.id,
        adminEmail: req.user.email,
        reason,
      });
      return res.json({ message: 'Subscription reinstated', subscription: result });
    }

    if (action === 'extend' || action === 'set_expiry') {
      if (customDate) {
        const end = new Date(customDate);
        if (Number.isNaN(end.getTime())) return res.status(400).json({ error: 'Invalid date' });
        await supabaseAdmin
          .from('subscriptions')
          .update({ status: end > now ? 'active' : 'expired', end_date: end.toISOString() })
          .eq('id', sub.id);
        await paymentStore.saveSubscriptionMeta(sub.user_id, {
          ...(prevMeta || {}),
          userId: sub.user_id,
          lifecycleStatus: end > now ? 'ACTIVE' : 'EXPIRED',
          expiryDate: end.toISOString(),
          reason,
          updatedAt: nowIso,
          updatedBy: req.user.email,
        });
        await paymentStore.appendAuditLog({
          category: 'SUBSCRIPTION',
          targetId: sub.id,
          userId: sub.user_id,
          adminId: req.user.id,
          adminEmail: req.user.email,
          action: 'SUBSCRIPTION_EXPIRY_CHANGED',
          previousValues: { end_date: sub.end_date },
          newValues: { end_date: end.toISOString() },
          reason,
          ipAddress: getClientIp(req),
        });
        return res.json({ message: 'Expiry date updated', endDate: end.toISOString() });
      }
      const result = await paymentStore.activateOrExtendSubscription({
        userId: sub.user_id,
        validityDays: Number(days) || 30,
        planId: prevMeta?.planId || 'extension',
        planName: prevMeta?.planName || 'Extended Pass',
        price: prevMeta?.price ?? 0,
        activationSource: 'ADMIN_EXTEND',
        adminId: req.user.id,
        adminEmail: req.user.email,
        reason,
      });
      return res.json({ message: 'Subscription extended', subscription: result });
    }

    res.status(400).json({ error: 'Unsupported subscription status action' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Legacy revoke endpoint
router.post('/subscriptions/revoke/:id', requirePermission('manage_subscriptions'), async (req, res) => {
  req.body = { action: 'revoke', reason: req.body?.reason || 'Revoked by administrator' };
  const { id } = req.params;
  const { data: sub } = await supabaseAdmin.from('subscriptions').select('*').eq('id', id).maybeSingle();
  if (!sub) return res.status(404).json({ error: 'Subscription not found' });
  await supabaseAdmin.from('subscriptions').update({ status: 'expired', end_date: new Date().toISOString() }).eq('id', id);
  await paymentStore.saveSubscriptionMeta(sub.user_id, { userId: sub.user_id, lifecycleStatus: 'CANCELLED', reason: req.body.reason, updatedAt: new Date().toISOString(), updatedBy: req.user.email });
  res.json({ message: 'Subscription revoked' });
});

// ==========================================
// 4. PAYMENT REQUESTS, VERIFICATION & REPORTS
// ==========================================
async function buildAdminPaymentsList(req) {
  const { status = 'all', search = '' } = req.query;

  const [{ data: requests, error }, orderMetas, { data: subs }] = await Promise.all([
    supabaseAdmin
      .from('payment_requests')
      .select('*, profiles:user_id(id, name, email, phone)')
      .order('created_at', { ascending: false }),
    paymentStore.listOrderMetas(600),
    supabaseAdmin.from('subscriptions').select('user_id, status, end_date'),
  ]);

  if (error) throw error;

  const subByUser = {};
  const now = new Date();
  (subs || []).forEach((s) => {
    const active = s.status === 'active' && s.end_date && new Date(s.end_date) > now;
    subByUser[s.user_id] = active ? 'ACTIVE' : 'EXPIRED';
  });

  // Detect duplicate UTR attempts across rows
  const utrCounts = {};
  (requests || []).forEach((r) => {
    if (r.transaction_id && !r.transaction_id.startsWith('TEMP_')) {
      utrCounts[r.transaction_id] = (utrCounts[r.transaction_id] || 0) + 1;
    }
  });

  const enriched = (requests || []).map((r) => {
    const meta = orderMetas[r.id] || {};
    const profile = Array.isArray(r.profiles) ? r.profiles[0] : r.profiles;
    const isTemp = !r.transaction_id || r.transaction_id.startsWith('TEMP_');
    const verificationStatus =
      r.status === 'approved'
        ? (meta.verificationMethod === 'AUTO_API' || meta.verificationMethod === 'WEBHOOK' ? 'VERIFIED' : 'MANUALLY_APPROVED')
        : r.status === 'rejected'
        ? 'REJECTED'
        : isTemp
        ? 'PENDING'
        : 'PENDING_VERIFICATION';

    const isDuplicate = Boolean(meta.isDuplicateAttempt) || (!isTemp && utrCounts[r.transaction_id] > 1);
    const isSuspicious = Boolean(meta.isSuspicious) || isDuplicate;

    return {
      ...r,
      profiles: profile || { id: r.user_id, name: 'Student', email: r.user_id, phone: '' },
      orderId: meta.orderId || `ORD-${r.id.slice(0, 8).toUpperCase()}`,
      planId: meta.planId || null,
      planName: meta.planName || 'Standard Pass',
      validityDays: meta.validityDays || 90,
      payerName: meta.payerName || profile?.name || '—',
      transactionDate: meta.transactionDate || r.created_at,
      submittedAt: meta.submittedAt || (isTemp ? null : r.updated_at),
      verificationMethod: meta.verificationMethod || 'MANUAL_ADMIN',
      verificationStatus,
      subscriptionStatus: subByUser[r.user_id] || 'FREE',
      assignedAdmin: meta.verifiedByEmail || meta.assignedAdmin || '—',
      hasScreenshot: Boolean(meta.screenshotPath),
      rejectionReason: meta.rejectionReason || null,
      adminNotes: meta.adminNotes || '',
      isDuplicate,
      isSuspicious,
      suspiciousReasons: meta.suspiciousReasons || [],
      isTempOrder: isTemp,
    };
  });

  const stats = {
    totalRequests: enriched.length,
    pendingVerification: enriched.filter((x) => x.verificationStatus === 'PENDING_VERIFICATION').length,
    pendingUnpaid: enriched.filter((x) => x.verificationStatus === 'PENDING').length,
    autoVerified: enriched.filter((x) => x.verificationStatus === 'VERIFIED').length,
    manuallyApproved: enriched.filter((x) => x.verificationStatus === 'MANUALLY_APPROVED').length,
    rejected: enriched.filter((x) => x.status === 'rejected').length,
    confirmedRevenue: enriched
      .filter((x) => x.status === 'approved')
      .reduce((acc, x) => acc + (Number(x.amount) || 0), 0),
    duplicateAttempts: enriched.filter((x) => x.isDuplicate).length,
    suspiciousAttempts: enriched.filter((x) => x.isSuspicious).length,
  };

  let filtered = enriched;
  if (status && status !== 'all') {
    const f = status.toLowerCase();
    filtered = filtered.filter((x) => {
      if (f === 'pending') return x.status === 'pending';
      if (f === 'verification_in_progress' || f === 'pending_verification') return x.verificationStatus === 'PENDING_VERIFICATION';
      if (f === 'verified') return x.verificationStatus === 'VERIFIED';
      if (f === 'manually_approved' || f === 'approved') return x.status === 'approved';
      if (f === 'rejected') return x.status === 'rejected';
      if (f === 'duplicate') return x.isDuplicate;
      if (f === 'suspicious') return x.isSuspicious;
      return true;
    });
  }

  if (search.trim()) {
    const q = search.trim().toLowerCase();
    filtered = filtered.filter((x) =>
      (x.transaction_id || '').toLowerCase().includes(q) ||
      (x.payment_reference || '').toLowerCase().includes(q) ||
      (x.orderId || '').toLowerCase().includes(q) ||
      (x.payerName || '').toLowerCase().includes(q) ||
      (x.profiles?.email || '').toLowerCase().includes(q) ||
      (x.profiles?.name || '').toLowerCase().includes(q) ||
      (x.profiles?.phone || '').toLowerCase().includes(q)
    );
  }

  return { stats, payments: filtered };
}

router.get('/payments', requirePermission('view_payments'), async (req, res) => {
  try {
    const data = await buildAdminPaymentsList(req);
    res.json(data);
  } catch (error) {
    console.error('Admin payments list error:', error);
    res.status(500).json({ error: 'Failed to retrieve payment records' });
  }
});

// Legacy list endpoint
router.get('/payment-requests', requirePermission('view_payments'), async (req, res) => {
  try {
    const { payments } = await buildAdminPaymentsList(req);
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Secure private screenshot view for admin
router.get('/payments/:id/screenshot', requirePermission('view_payments'), async (req, res) => {
  try {
    const meta = await paymentStore.getOrderMeta(req.params.id);
    if (!meta?.screenshotPath) {
      return res.status(404).json({ error: 'No screenshot uploaded for this payment' });
    }
    const { buffer, contentType } = await paymentStore.downloadPrivateScreenshot(meta.screenshotPath);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(buffer);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

// Verify payment against external provider (if configured)
router.post('/payments/:id/verify-provider', requirePermission('view_payments'), async (req, res) => {
  try {
    const { id } = req.params;
    const { data: pr } = await supabaseAdmin.from('payment_requests').select('*').eq('id', id).maybeSingle();
    if (!pr) return res.status(404).json({ error: 'Payment request not found' });

    const meta = (await paymentStore.getOrderMeta(id)) || {};
    const result = await paymentStore.verifyTransactionWithProvider({
      transactionId: pr.transaction_id,
      amount: pr.amount,
      upiId: meta.upiId || 'mrx4u@ybl',
      paymentReference: pr.payment_reference,
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Approve Payment (Requires approve_payments, prevents self-approval, atomic lock)
async function handleApprovePayment(req, res) {
  try {
    const { id } = req.params;
    const { validityDays, adminNotes } = req.body || {};

    const { data: request, error: fetchErr } = await supabaseAdmin
      .from('payment_requests')
      .select('*, profiles:user_id(id, email, name)')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !request) return res.status(404).json({ error: 'Payment request not found' });

    // Security: Prevent user/sub-admin from approving their own payment
    if (request.user_id === req.user.id && !req.user.isSuperAdmin) {
      return res.status(403).json({ error: 'Security violation: You cannot approve your own payment.' });
    }

    if (request.status === 'approved') {
      return res.status(409).json({ error: 'Payment already approved' });
    }
    if (!request.transaction_id || request.transaction_id.startsWith('TEMP_')) {
      return res.status(400).json({ error: 'Cannot approve an unpaid order with no submitted UTR/Transaction ID.' });
    }

    const meta = (await paymentStore.getOrderMeta(id)) || {};
    const grantDays = Number(validityDays) || Number(meta.validityDays) || 90;
    const nowIso = new Date().toISOString();

    // Snapshot subscription BEFORE payment_requests update (avoids legacy DB trigger skew)
    const { data: prevSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', request.user_id)
      .maybeSingle();

    // Atomic concurrency lock: ONLY 1 request can transition pending -> approved
    const { data: lockedReq, error: lockErr } = await supabaseAdmin
      .from('payment_requests')
      .update({ status: 'approved', updated_at: nowIso })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .maybeSingle();

    if (lockErr) throw lockErr;
    if (!lockedReq) {
      return res.status(409).json({ error: 'Payment was already processed by another concurrent request.' });
    }

    const subResult = await paymentStore.activateOrExtendSubscription({
      userId: request.user_id,
      validityDays: grantDays,
      planId: meta.planId || 'plan-90d',
      planName: meta.planName || `${grantDays}-Day Premium Pass`,
      price: Number(request.amount),
      paymentTransactionId: request.transaction_id,
      activationSource: 'MANUAL_ADMIN',
      adminId: req.user.id,
      adminEmail: req.user.email,
      reason: adminNotes || `Approved payment ${request.transaction_id}`,
      previousSub: prevSub || null,
    });

    await paymentStore.saveOrderMeta(id, {
      ...meta,
      orderStatus: 'APPROVED',
      verificationMethod: 'MANUAL_ADMIN',
      verificationStatus: 'VERIFIED',
      verifiedAt: nowIso,
      verifiedBy: req.user.id,
      verifiedByEmail: req.user.email,
      adminNotes: adminNotes || meta.adminNotes || '',
    });

    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: id,
      userId: request.user_id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PAYMENT_MANUALLY_APPROVED',
      previousStatus: 'pending',
      newStatus: 'approved',
      newValues: { validityDays: grantDays, endDate: subResult.endDate, amount: request.amount },
      reason: adminNotes || 'Verified and approved by administrator',
      ipAddress: getClientIp(req),
    });

    res.json({
      message: `Payment approved and subscription activated for ${grantDays} days.`,
      subscription: subResult,
    });
  } catch (error) {
    console.error('Admin approve payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to approve payment request' });
  }
}

router.post('/payments/:id/approve', requirePermission('approve_payments'), handleApprovePayment);
router.post('/payment-approve/:id', requirePermission('approve_payments'), handleApprovePayment);

// Reject Payment (Requires reject_payments + mandatory reason)
async function handleRejectPayment(req, res) {
  try {
    const { id } = req.params;
    const { reason, adminNotes } = req.body || {};
    const cleanReason = String(reason || '').trim();
    if (!cleanReason) {
      return res.status(400).json({ error: 'A rejection reason is required.' });
    }

    const { data: existing } = await supabaseAdmin.from('payment_requests').select('*').eq('id', id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Payment request not found' });
    if (existing.status === 'approved') {
      return res.status(400).json({ error: 'Cannot reject an already approved payment. Revoke the subscription instead.' });
    }

    const nowIso = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('payment_requests')
      .update({ status: 'rejected', updated_at: nowIso })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    const meta = (await paymentStore.getOrderMeta(id)) || {};
    await paymentStore.saveOrderMeta(id, {
      ...meta,
      orderStatus: 'REJECTED',
      verificationStatus: 'REJECTED',
      rejectionReason: cleanReason,
      verifiedAt: nowIso,
      verifiedBy: req.user.id,
      verifiedByEmail: req.user.email,
      adminNotes: adminNotes || meta.adminNotes || '',
    });

    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: id,
      userId: existing.user_id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'PAYMENT_REJECTED',
      previousStatus: existing.status,
      newStatus: 'rejected',
      reason: cleanReason,
      ipAddress: getClientIp(req),
    });

    await paymentStore.createNotification({
      userId: existing.user_id,
      title: 'Payment Rejected',
      body: `Your payment (${existing.transaction_id}) could not be verified. Reason: ${cleanReason}`,
      type: 'payment_rejected',
      data: { paymentId: id, reason: cleanReason },
    });

    res.json({ message: 'Payment marked as rejected', request: data });
  } catch (error) {
    console.error('Admin reject payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to reject payment' });
  }
}

router.post('/payments/:id/reject', requirePermission('reject_payments'), handleRejectPayment);
router.post('/payment-reject/:id', requirePermission('reject_payments'), handleRejectPayment);

// Flag suspicious payment + internal notes
router.post('/payments/:id/flag', requirePermission('view_payments'), async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspicious = true, reason = '', adminNotes } = req.body || {};
    const { data: existing } = await supabaseAdmin.from('payment_requests').select('*').eq('id', id).maybeSingle();
    if (!existing) return res.status(404).json({ error: 'Payment request not found' });

    const meta = (await paymentStore.getOrderMeta(id)) || {};
    const nextReasons = reason ? [...(meta.suspiciousReasons || []), reason] : (meta.suspiciousReasons || []);

    await paymentStore.saveOrderMeta(id, {
      ...meta,
      isSuspicious: Boolean(isSuspicious),
      suspiciousReasons: nextReasons,
      ...(adminNotes !== undefined ? { adminNotes } : {}),
    });

    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: id,
      userId: existing.user_id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: isSuspicious ? 'PAYMENT_FLAGGED_SUSPICIOUS' : 'PAYMENT_UNFLAGGED',
      reason: reason || adminNotes || 'Admin flagged request',
      ipAddress: getClientIp(req),
    });

    res.json({ ok: true, isSuspicious: Boolean(isSuspicious), suspiciousReasons: nextReasons });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Record Manual / Offline Payment (Requires approve_payments)
router.post('/payments/manual', requirePermission('approve_payments'), async (req, res) => {
  try {
    const { userId, amount = 49, transactionId, validityDays = 90, reason = 'Offline / Manual Admin Payment' } = req.body;
    if (!userId) return res.status(400).json({ error: 'User ID is required' });

    const ref = 'MANUAL_' + crypto.randomBytes(3).toString('hex').toUpperCase();
    const cleanTxn = (transactionId && String(transactionId).trim()) || ref;

    const { data: payment, error } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        amount: Number(amount),
        transaction_id: cleanTxn,
        payment_reference: ref,
        status: 'approved',
      })
      .select()
      .single();

    if (error) throw error;

    await paymentStore.saveOrderMeta(payment.id, {
      orderId: `ORD-${ref}`,
      paymentRequestId: payment.id,
      userId,
      planName: `Manual Plan (${validityDays}d)`,
      validityDays: Number(validityDays),
      amount: Number(amount),
      orderStatus: 'APPROVED',
      verificationMethod: 'MANUAL_ADMIN',
      verificationStatus: 'VERIFIED',
      verifiedAt: new Date().toISOString(),
      verifiedBy: req.user.id,
      verifiedByEmail: req.user.email,
      adminNotes: reason,
    });

    const sub = await paymentStore.activateOrExtendSubscription({
      userId,
      validityDays: Number(validityDays),
      planName: `Manual Plan (${validityDays}d)`,
      price: Number(amount),
      paymentTransactionId: cleanTxn,
      activationSource: 'MANUAL_ADMIN',
      adminId: req.user.id,
      adminEmail: req.user.email,
      reason,
    });

    res.json({ message: 'Manual payment recorded and subscription activated', payment, subscription: sub });
  } catch (error) {
    console.error('Admin manual payment error:', error);
    res.status(500).json({ error: error.message || 'Failed to record manual payment' });
  }
});

// Revenue & Verification Reports (Only confirmed approved payments counted in revenue!)
router.get('/payments/reports', requirePermission('view_payments'), async (req, res) => {
  try {
    const [{ payments }, { data: subs }] = await Promise.all([
      buildAdminPaymentsList({ query: { status: 'all', search: '' } }),
      supabaseAdmin.from('subscriptions').select('*'),
    ]);

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const soonDate = new Date(now.getTime() + 7 * 86400000);

    const approved = payments.filter((p) => p.status === 'approved');
    const dailyRevenue = approved
      .filter((p) => new Date(p.verifiedAt || p.updated_at || p.created_at) >= todayStart)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const monthlyRevenue = approved
      .filter((p) => new Date(p.verifiedAt || p.updated_at || p.created_at) >= monthStart)
      .reduce((s, p) => s + (Number(p.amount) || 0), 0);
    const totalRevenue = approved.reduce((s, p) => s + (Number(p.amount) || 0), 0);

    const bySource = {};
    approved.forEach((p) => {
      const src = p.verificationMethod || 'MANUAL_ADMIN';
      bySource[src] = (bySource[src] || 0) + 1;
    });

    const approvedByUser = {};
    approved.forEach((p) => {
      approvedByUser[p.user_id] = (approvedByUser[p.user_id] || 0) + 1;
    });
    const renewalsCount = Object.values(approvedByUser).filter((c) => c > 1).length;

    const expiringSoon = (subs || []).filter((s) => {
      const end = s.end_date ? new Date(s.end_date) : null;
      return s.status === 'active' && end && end > now && end <= soonDate;
    }).length;

    res.json({
      dailyRevenue,
      monthlyRevenue,
      totalRevenue,
      confirmedPayments: approved.length,
      pendingPayments: payments.filter((p) => p.status === 'pending').length,
      rejectedPayments: payments.filter((p) => p.status === 'rejected').length,
      renewalsCount,
      expiringSoon,
      byVerificationSource: bySource,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Logs
router.get('/audit-logs', requirePermission('view_payments'), async (req, res) => {
  try {
    const { category = 'all', limit = 150 } = req.query;
    const logs = await paymentStore.listAuditLogs({ category, limit: Math.min(300, Number(limit) || 150) });
    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: 'Failed to fetch MCQs' });
  }
});

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
        task_type: taskType,
      })
      .select()
      .single();
    if (error) throw error;
    res.status(201).json({ message: 'MCQ added successfully', mcq: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create MCQ' });
  }
});

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
    res.status(500).json({ error: 'Failed to update MCQ' });
  }
});

router.delete('/academic/mcqs/:id', async (req, res) => {
  try {
    const { error } = await supabaseAdmin.from('mcqs').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'MCQ removed successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete MCQ' });
  }
});

router.post('/academic/mcqs/bulk', async (req, res) => {
  try {
    const { topicId, mcqs, taskType = 'test_question' } = req.body;
    if (!topicId || !Array.isArray(mcqs) || mcqs.length === 0) {
      return res.status(400).json({ error: 'Valid topicId and array of MCQs required' });
    }
    const payload = mcqs.map((q) => ({
      topic_id: topicId,
      question: q.question,
      options: q.options,
      correct_index: Number(q.correctIndex || 0),
      explanation: q.explanation || '',
      task_type: taskType,
    }));
    const { data, error } = await supabaseAdmin.from('mcqs').insert(payload).select();
    if (error) throw error;
    res.status(201).json({ message: `Successfully imported ${data.length} MCQs`, count: data.length });
  } catch (error) {
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
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
});

// ==========================================
// 7. SUB-ADMINS & PERMISSIONS (SUPER ADMIN)
// ==========================================
router.get('/sub-admins', async (req, res) => {
  try {
    const [{ data: admins, error }, allPerms] = await Promise.all([
      supabaseAdmin.from('profiles').select('*').eq('role', 'admin'),
      paymentStore.getAllSubAdminPermissions(),
    ]);
    if (error) throw error;

    const enriched = (admins || []).map((a) => {
      const isSuper = a.email?.toLowerCase() === SUPER_ADMIN_EMAIL;
      return {
        ...a,
        isSuperAdmin: isSuper,
        permissions: isSuper
          ? Object.fromEntries(paymentStore.ALL_PERMISSIONS.map((p) => [p, true]))
          : allPerms[a.id] || {
              view_payments: true,
              approve_payments: false,
              reject_payments: false,
              manage_subscriptions: false,
              manage_plans: false,
              manage_settings: false,
            },
      };
    });

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sub-admins' });
  }
});

router.post('/sub-admins', superAdminOnly, async (req, res) => {
  try {
    const { email, permissions } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'admin' })
      .ilike('email', email.trim())
      .select()
      .single();

    if (error) throw error;

    if (permissions && data?.id) {
      await paymentStore.setSubAdminPermissions(data.id, permissions, req.user);
    }

    await paymentStore.appendAuditLog({
      category: 'PERMISSION',
      targetId: data.id,
      userId: data.id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'SUB_ADMIN_APPOINTED',
      newValues: { email, permissions },
      reason: 'Appointed by Super Admin',
      ipAddress: getClientIp(req),
    });

    res.json({ message: `Promoted ${email} to Admin`, profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to appoint sub-admin' });
  }
});

router.put('/sub-admins/:id/permissions', superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body || {};
    if (!permissions || typeof permissions !== 'object') {
      return res.status(400).json({ error: 'permissions object is required' });
    }

    const { prev, next } = await paymentStore.setSubAdminPermissions(id, permissions, req.user);
    await paymentStore.appendAuditLog({
      category: 'PERMISSION',
      targetId: id,
      userId: id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'SUB_ADMIN_PERMISSIONS_UPDATED',
      previousValues: prev,
      newValues: next,
      reason: 'Permissions updated by Super Admin',
      ipAddress: getClientIp(req),
    });

    res.json({ ok: true, permissions: next });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/sub-admins/:id', superAdminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({ role: 'user' })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    await paymentStore.appendAuditLog({
      category: 'PERMISSION',
      targetId: id,
      userId: id,
      adminId: req.user.id,
      adminEmail: req.user.email,
      action: 'SUB_ADMIN_REVOKED',
      reason: 'Admin privileges revoked by Super Admin',
      ipAddress: getClientIp(req),
    });

    res.json({ message: 'Admin privileges revoked', profile: data });
  } catch (error) {
    res.status(500).json({ error: 'Failed to revoke admin privileges' });
  }
});

module.exports = router;
