const crypto = require('crypto');
const axios = require('axios');
const { supabaseAdmin } = require('../config/supabase');

const PROOFS_BUCKET = 'payment-proofs';
const STATE_BUCKET = 'system-state';

const DEFAULT_SETTINGS = {
  appName: 'SSMU MCQs',
  upiId: 'mrx4u@ybl',
  defaultPrice: 49,
  defaultValidityDays: 90,
  announcementBanner: '🔥 Welcome to SSMU MCQs! Direct UPI Subscription available for all 6 courses.',
  telegramLink: 'https://t.me/mrx4u',
  supportEmail: 'samumcqs@gmail.com',
  maintenanceMode: false,
  minAppVersion: '1.0.8',
  contentVersion: '2.4.0',
  verificationMode: 'manual',
  autoVerifyEnabled: false,
  emailNotificationsEnabled: false,
  pushNotificationsEnabled: false,
  updatedAt: null,
  updatedBy: null,
};

const DEFAULT_PLANS = [
  {
    id: 'plan-90d',
    name: 'Standard 90-Day Pass',
    description: 'Full access to all 6 courses, 8,000+ MCQs, AI Tutor & Live 1v1 Battle Mode',
    days: 90,
    price: 49,
    currency: 'INR',
    isPopular: true,
    isActive: true,
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

let bucketsReadyPromise = null;

async function ensureBuckets() {
  if (!bucketsReadyPromise) {
    bucketsReadyPromise = (async () => {
      try {
        const { data: existing } = await supabaseAdmin.storage.listBuckets();
        const names = new Set((existing || []).map((b) => b.name));
        if (!names.has(PROOFS_BUCKET)) {
          await supabaseAdmin.storage.createBucket(PROOFS_BUCKET, {
            public: false,
            fileSizeLimit: 5 * 1024 * 1024,
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
          });
        }
        if (!names.has(STATE_BUCKET)) {
          await supabaseAdmin.storage.createBucket(STATE_BUCKET, {
            public: false,
            fileSizeLimit: 5 * 1024 * 1024,
            allowedMimeTypes: ['application/json'],
          });
        }
      } catch (err) {
        console.warn('[paymentStore] ensureBuckets warning:', err.message);
      }
    })();
  }
  return bucketsReadyPromise;
}

const memCache = new Map();

async function readJson(filePath, fallback = null) {
  await ensureBuckets();
  const cached = memCache.get(filePath);
  if (cached && Date.now() - cached.ts < 3000) {
    return cached.data;
  }
  try {
    // Use signed URL + unique cache-buster query param so Supabase Storage CDN never serves stale JSON
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from(STATE_BUCKET)
      .createSignedUrl(filePath, 30);
    if (!signErr && signed?.signedUrl) {
      const sep = signed.signedUrl.includes('?') ? '&' : '?';
      const resp = await axios.get(`${signed.signedUrl}${sep}_cb=${Date.now()}`, {
        timeout: 8000,
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (resp.data !== undefined && resp.data !== null) {
        memCache.set(filePath, { data: resp.data, ts: Date.now() });
        return resp.data;
      }
    }
    const { data, error } = await supabaseAdmin.storage.from(STATE_BUCKET).download(filePath);
    if (error || !data) return fallback;
    const text = await data.text();
    const parsed = JSON.parse(text);
    memCache.set(filePath, { data: parsed, ts: Date.now() });
    return parsed;
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, payload) {
  await ensureBuckets();
  const body = Buffer.from(JSON.stringify(payload, null, 2), 'utf8');
  const { error } = await supabaseAdmin.storage.from(STATE_BUCKET).upload(filePath, body, {
    contentType: 'application/json',
    cacheControl: '0',
    upsert: true,
  });
  if (error) throw new Error(`Storage write failed (${filePath}): ${error.message}`);
  memCache.set(filePath, { data: payload, ts: Date.now() });
  return payload;
}

async function listJsonFolder(prefix, limit = 200) {
  await ensureBuckets();
  const { data: files, error } = await supabaseAdmin.storage.from(STATE_BUCKET).list(prefix, {
    limit,
    sortBy: { column: 'created_at', order: 'desc' },
  });
  if (error || !Array.isArray(files)) return [];
  const results = await Promise.all(
    files
      .filter((f) => f.name && f.name.endsWith('.json'))
      .slice(0, limit)
      .map((f) => readJson(`${prefix}/${f.name}`, null))
  );
  return results.filter(Boolean);
}

// ── Global Settings ──
async function getGlobalSettings() {
  const stored = await readJson('settings/global.json', null);
  return { ...DEFAULT_SETTINGS, ...(stored || {}) };
}

async function updateGlobalSettings(patch, adminUser) {
  const current = await getGlobalSettings();
  const next = {
    ...current,
    ...(patch.upiId !== undefined ? { upiId: String(patch.upiId).trim() || 'mrx4u@ybl' } : {}),
    ...(patch.defaultPrice !== undefined ? { defaultPrice: Math.max(0, Number(patch.defaultPrice) || 49) } : {}),
    ...(patch.defaultValidityDays !== undefined ? { defaultValidityDays: Math.max(1, parseInt(patch.defaultValidityDays, 10) || 90) } : {}),
    ...(patch.announcementBanner !== undefined ? { announcementBanner: String(patch.announcementBanner) } : {}),
    ...(patch.telegramLink !== undefined ? { telegramLink: String(patch.telegramLink).trim() } : {}),
    ...(patch.supportEmail !== undefined ? { supportEmail: String(patch.supportEmail).trim() } : {}),
    ...(patch.maintenanceMode !== undefined ? { maintenanceMode: Boolean(patch.maintenanceMode) } : {}),
    ...(patch.minAppVersion !== undefined ? { minAppVersion: String(patch.minAppVersion).trim() } : {}),
    ...(patch.contentVersion !== undefined ? { contentVersion: String(patch.contentVersion).trim() } : {}),
    ...(patch.verificationMode !== undefined ? { verificationMode: String(patch.verificationMode) } : {}),
    ...(patch.autoVerifyEnabled !== undefined ? { autoVerifyEnabled: Boolean(patch.autoVerifyEnabled) } : {}),
    ...(patch.emailNotificationsEnabled !== undefined ? { emailNotificationsEnabled: Boolean(patch.emailNotificationsEnabled) } : {}),
    ...(patch.pushNotificationsEnabled !== undefined ? { pushNotificationsEnabled: Boolean(patch.pushNotificationsEnabled) } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.email || adminUser?.id || 'admin',
  };
  await writeJson('settings/global.json', next);
  return next;
}

// ── Dynamic Subscription Plans ──
async function getPlans({ activeOnly = false } = {}) {
  let plans = await readJson('plans/plans.json', null);
  if (!Array.isArray(plans) || plans.length === 0) {
    const settings = await getGlobalSettings();
    plans = DEFAULT_PLANS.map((p) => ({
      ...p,
      price: settings.defaultPrice ?? 49,
      days: settings.defaultValidityDays ?? 90,
    }));
    await writeJson('plans/plans.json', plans);
  }
  const sorted = [...plans].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0) || a.days - b.days);
  return activeOnly ? sorted.filter((p) => p.isActive !== false) : sorted;
}

async function createPlan({ name, description = '', days, price, isPopular = false, isActive = true, sortOrder }, adminUser) {
  const cleanDays = parseInt(days, 10);
  const cleanPrice = Number(price);
  if (!name || !String(name).trim()) throw new Error('Plan name is required.');
  if (!Number.isFinite(cleanDays) || cleanDays < 1 || cleanDays > 3650) throw new Error('Validity days must be between 1 and 3650.');
  if (!Number.isFinite(cleanPrice) || cleanPrice < 0) throw new Error('Price must be a valid non-negative number.');

  const plans = await getPlans();
  const nowIso = new Date().toISOString();
  const newPlan = {
    id: `plan-${Date.now()}-${crypto.randomBytes(2).toString('hex')}`,
    name: String(name).trim(),
    description: String(description || '').trim(),
    days: cleanDays,
    price: Math.round(cleanPrice * 100) / 100,
    currency: 'INR',
    isPopular: Boolean(isPopular),
    isActive: isActive !== false,
    sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : plans.length + 1,
    createdAt: nowIso,
    updatedAt: nowIso,
    updatedBy: adminUser?.email || adminUser?.id || 'admin',
  };

  const next = newPlan.isPopular
    ? plans.map((p) => ({ ...p, isPopular: false })).concat(newPlan)
    : plans.concat(newPlan);

  await writeJson('plans/plans.json', next);
  return newPlan;
}

async function updatePlan(planId, updates, adminUser) {
  const plans = await getPlans();
  const idx = plans.findIndex((p) => p.id === planId);
  if (idx === -1) throw new Error('Subscription plan not found.');

  const prev = plans[idx];
  const nextDays = updates.days !== undefined ? parseInt(updates.days, 10) : prev.days;
  const nextPrice = updates.price !== undefined ? Number(updates.price) : prev.price;

  if (!Number.isFinite(nextDays) || nextDays < 1 || nextDays > 3650) {
    throw new Error('Validity days must be between 1 and 3650.');
  }
  if (!Number.isFinite(nextPrice) || nextPrice < 0) {
    throw new Error('Price must be a valid non-negative number.');
  }

  const updated = {
    ...prev,
    ...(updates.name !== undefined ? { name: String(updates.name).trim() || prev.name } : {}),
    ...(updates.description !== undefined ? { description: String(updates.description).trim() } : {}),
    days: nextDays,
    price: Math.round(nextPrice * 100) / 100,
    ...(updates.isPopular !== undefined ? { isPopular: Boolean(updates.isPopular) } : {}),
    ...(updates.isActive !== undefined ? { isActive: Boolean(updates.isActive) } : {}),
    ...(updates.sortOrder !== undefined ? { sortOrder: Number(updates.sortOrder) } : {}),
    updatedAt: new Date().toISOString(),
    updatedBy: adminUser?.email || adminUser?.id || 'admin',
  };

  const next = plans.map((p) => {
    if (p.id === planId) return updated;
    if (updates.isPopular === true) return { ...p, isPopular: false };
    return p;
  });

  await writeJson('plans/plans.json', next);
  return { prev, updated };
}

async function deletePlan(planId) {
  const plans = await getPlans();
  const target = plans.find((p) => p.id === planId);
  if (!target) throw new Error('Subscription plan not found.');
  const remaining = plans.filter((p) => p.id !== planId);
  await writeJson('plans/plans.json', remaining);
  return target;
}

// ── Sub-Admin Permissions ──
const ALL_PERMISSIONS = [
  'view_payments',
  'approve_payments',
  'reject_payments',
  'manage_subscriptions',
  'manage_plans',
  'manage_settings',
];

async function getAllSubAdminPermissions() {
  return (await readJson('permissions/admins.json', {})) || {};
}

async function getSubAdminPermissions(userId) {
  const all = await getAllSubAdminPermissions();
  return all[userId] || {
    view_payments: true,
    approve_payments: false,
    reject_payments: false,
    manage_subscriptions: false,
    manage_plans: false,
    manage_settings: false,
  };
}

async function setSubAdminPermissions(userId, perms, superAdmin) {
  const all = await getAllSubAdminPermissions();
  const prev = all[userId] || {};
  const clean = {};
  for (const key of ALL_PERMISSIONS) {
    clean[key] = Boolean(perms[key]);
  }
  clean.updatedAt = new Date().toISOString();
  clean.updatedBy = superAdmin?.email || superAdmin?.id;
  all[userId] = clean;
  await writeJson('permissions/admins.json', all);
  return { prev, next: clean };
}

// ── Orders & Transactions Metadata ──
async function saveOrderMeta(paymentRequestId, meta) {
  await writeJson(`orders/${paymentRequestId}.json`, meta);
  if (meta.orderId) {
    await writeJson(`order_index/${meta.orderId}.json`, { paymentRequestId });
  }
  return meta;
}

async function getOrderMeta(paymentRequestId) {
  return await readJson(`orders/${paymentRequestId}.json`, null);
}

async function findOrderByOrderId(orderId) {
  const idx = await readJson(`order_index/${orderId}.json`, null);
  if (!idx?.paymentRequestId) return null;
  return await getOrderMeta(idx.paymentRequestId);
}

async function listOrderMetas(limit = 500) {
  const list = await listJsonFolder('orders', limit);
  const map = {};
  list.forEach((m) => {
    if (m?.paymentRequestId) map[m.paymentRequestId] = m;
  });
  return map;
}

// ── Screenshots (Private Storage ONLY — Never Public URLs) ──
function detectImageMime(buffer) {
  if (!buffer || buffer.length < 12) return null;
  // PNG
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png';
  }
  // JPEG
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }
  // WEBP
  if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

async function uploadPrivateScreenshot({ userId, paymentRequestId, buffer, mimeType }) {
  await ensureBuckets();
  const detected = detectImageMime(buffer);
  if (!detected || !['image/png', 'image/jpeg', 'image/webp'].includes(detected)) {
    throw new Error('Invalid or unsupported screenshot format. Only PNG, JPG, and WEBP images are allowed.');
  }
  if (mimeType && mimeType !== detected && !(mimeType === 'image/jpg' && detected === 'image/jpeg')) {
    throw new Error('File content does not match declared image type.');
  }
  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('Screenshot file exceeds 5 MB maximum size.');
  }

  const ext = detected === 'image/png' ? 'png' : detected === 'image/webp' ? 'webp' : 'jpg';
  const storagePath = `${userId}/${paymentRequestId}-${Date.now()}.${ext}`;

  const { error } = await supabaseAdmin.storage.from(PROOFS_BUCKET).upload(storagePath, buffer, {
    contentType: detected,
    upsert: false,
  });
  if (error) throw new Error(`Screenshot upload failed: ${error.message}`);
  return { storagePath, contentType: detected };
}

async function downloadPrivateScreenshot(storagePath) {
  await ensureBuckets();
  const { data, error } = await supabaseAdmin.storage.from(PROOFS_BUCKET).download(storagePath);
  if (error || !data) throw new Error('Screenshot not found.');
  const arr = await data.arrayBuffer();
  return { buffer: Buffer.from(arr), contentType: data.type || 'image/jpeg' };
}

// ── Audit Logs (Immutable individual entries) ──
async function appendAuditLog({
  category = 'PAYMENT',
  targetId,
  userId = null,
  adminId = null,
  adminEmail = null,
  action,
  previousStatus = null,
  newStatus = null,
  previousValues = null,
  newValues = null,
  reason = '',
  ipAddress = '',
}) {
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const entry = {
    id,
    category,
    targetId: String(targetId || ''),
    userId,
    adminId,
    adminEmail,
    action,
    previousStatus,
    newStatus,
    previousValues,
    newValues,
    reason: String(reason || ''),
    ipAddress: String(ipAddress || ''),
    timestamp,
  };
  const safeTs = timestamp.replace(/[:.]/g, '-');
  await writeJson(`audit/${safeTs}_${id}.json`, entry);
  return entry;
}

async function listAuditLogs({ category = 'all', limit = 200 } = {}) {
  const all = await listJsonFolder('audit', limit);
  const filtered = category === 'all' ? all : all.filter((l) => l.category === category);
  return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

// ── Notifications ──
async function createNotification({ userId, title, body, type = 'system', data = {} }) {
  if (!userId) return null;
  try {
    const { data: row, error } = await supabaseAdmin
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        body,
        type,
        data,
        is_read: false,
      })
      .select()
      .single();
    if (error) {
      console.warn('[paymentStore] notification insert warning:', error.message);
      return null;
    }
    return row;
  } catch (err) {
    console.warn('[paymentStore] notification exception:', err.message);
    return null;
  }
}

// ── Subscription Metadata & Lifecycle ──
async function getSubscriptionMeta(userId) {
  return await readJson(`subs/${userId}.json`, null);
}

async function saveSubscriptionMeta(userId, meta) {
  return await writeJson(`subs/${userId}.json`, meta);
}

async function activateOrExtendSubscription({
  userId,
  validityDays = 90,
  planId = 'plan-90d',
  planName = 'Standard Pass',
  price = 49,
  paymentTransactionId = null,
  activationSource = 'MANUAL_ADMIN',
  adminId = null,
  adminEmail = null,
  reason = 'Verified payment approval',
  previousSub = undefined,
}) {
  const now = new Date();
  const nowIso = now.toISOString();
  const days = Math.max(1, parseInt(validityDays, 10) || 90);

  // Always fetch current DB row (needed to locate row id for update even if previousSub was captured pre-trigger)
  const { data: dbRow } = await supabaseAdmin
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('end_date', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Use pre-trigger snapshot if provided so legacy on_payment_approved Postgres trigger cannot skew dates
  const existingSub = previousSub !== undefined ? previousSub : dbRow;

  const prevMeta = await getSubscriptionMeta(userId);
  const isCurrentlyActive =
    existingSub &&
    existingSub.status === 'active' &&
    existingSub.end_date &&
    new Date(existingSub.end_date) > now &&
    !['SUSPENDED', 'CANCELLED', 'REVOKED'].includes(prevMeta?.lifecycleStatus);

  const startDate = isCurrentlyActive && existingSub.start_date ? existingSub.start_date : nowIso;
  const baseDate = isCurrentlyActive ? new Date(existingSub.end_date) : now;
  const endDate = new Date(baseDate.getTime() + days * 86400000).toISOString();

  if (dbRow) {
    const { error: upErr } = await supabaseAdmin
      .from('subscriptions')
      .update({
        status: 'active',
        start_date: startDate,
        end_date: endDate,
      })
      .eq('id', dbRow.id);
    if (upErr) throw upErr;
  } else {
    const { error: insErr } = await supabaseAdmin.from('subscriptions').insert({
      user_id: userId,
      status: 'active',
      start_date: startDate,
      end_date: endDate,
    });
    if (insErr) throw insErr;
  }

  const nextMeta = {
    userId,
    planId,
    planName,
    price,
    validityDays: days,
    lifecycleStatus: 'ACTIVE',
    startDate,
    expiryDate: endDate,
    paymentTransactionId,
    activationSource,
    reason,
    updatedAt: nowIso,
    updatedBy: adminEmail || adminId || activationSource,
  };
  await saveSubscriptionMeta(userId, nextMeta);

  await appendAuditLog({
    category: 'SUBSCRIPTION',
    targetId: existingSub?.id || userId,
    userId,
    adminId,
    adminEmail,
    action: isCurrentlyActive ? 'SUBSCRIPTION_EXTENDED' : 'SUBSCRIPTION_ACTIVATED',
    previousStatus: prevMeta?.lifecycleStatus || existingSub?.status || 'FREE',
    newStatus: 'ACTIVE',
    previousValues: existingSub ? { status: existingSub.status, start_date: existingSub.start_date, end_date: existingSub.end_date } : null,
    newValues: { status: 'active', start_date: startDate, end_date: endDate, validityDays: days, activationSource },
    reason,
  });

  await createNotification({
    userId,
    title: 'Subscription Activated!',
    body: `Your ${planName} is now active until ${new Date(endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}.`,
    type: 'subscription_activated',
    data: { planId, planName, startDate, endDate, validityDays: days },
  });

  return { startDate, endDate, validityDays: days, meta: nextMeta };
}

async function computeUserSubscriptionState(userId) {
  const now = new Date();
  const [{ data: sub }, subMeta, { data: payments }] = await Promise.all([
    supabaseAdmin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle(),
    getSubscriptionMeta(userId),
    supabaseAdmin.from('payment_requests').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
  ]);

  let effectiveStatus = 'FREE';
  let remainingDays = 0;

  if (sub) {
    const end = sub.end_date ? new Date(sub.end_date) : null;
    if (subMeta?.lifecycleStatus === 'SUSPENDED') {
      effectiveStatus = 'SUSPENDED';
    } else if (subMeta?.lifecycleStatus === 'CANCELLED' || subMeta?.lifecycleStatus === 'REVOKED') {
      effectiveStatus = 'CANCELLED';
    } else if (sub.status === 'active' && end && end > now) {
      effectiveStatus = 'ACTIVE';
      remainingDays = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
    } else {
      effectiveStatus = 'EXPIRED';
      if (sub.status === 'active') {
        await supabaseAdmin.from('subscriptions').update({ status: 'expired' }).eq('id', sub.id);
        await saveSubscriptionMeta(userId, { ...(subMeta || {}), userId, lifecycleStatus: 'EXPIRED', updatedAt: now.toISOString() });
        await createNotification({
          userId,
          title: 'Subscription Expired',
          body: 'Your SSMU MCQs subscription has expired. Renew anytime — all your progress and bookmarks are safely preserved.',
          type: 'subscription_expired',
          data: { endDate: sub.end_date },
        });
      }
    }
  }

  // Check if free/expired user has a pending or rejected payment
  const latestPay = payments && payments[0];
  let latestOrderMeta = null;
  if (latestPay) {
    latestOrderMeta = await getOrderMeta(latestPay.id);
    if (effectiveStatus !== 'ACTIVE' && effectiveStatus !== 'SUSPENDED' && effectiveStatus !== 'CANCELLED') {
      if (latestPay.status === 'pending') {
        const hasUtr = latestPay.transaction_id && !latestPay.transaction_id.startsWith('TEMP_');
        effectiveStatus = hasUtr ? 'PAYMENT_VERIFICATION' : 'PENDING_PAYMENT';
      } else if (latestPay.status === 'rejected' && effectiveStatus === 'FREE') {
        effectiveStatus = 'REJECTED';
      }
    }
  }

  return {
    status: effectiveStatus,
    isActive: effectiveStatus === 'ACTIVE',
    startDate: sub?.start_date || null,
    endDate: sub?.end_date || null,
    remainingDays,
    planId: subMeta?.planId || null,
    planName: subMeta?.planName || (effectiveStatus === 'ACTIVE' ? 'Premium Plan' : 'Free Plan'),
    price: subMeta?.price ?? null,
    validityDays: subMeta?.validityDays ?? null,
    reason: subMeta?.reason || latestOrderMeta?.rejectionReason || null,
    latestPayment: latestPay ? { ...latestPay, meta: latestOrderMeta } : null,
  };
}

// ── Automatic Verification Capability Check ──
function isAutoVerificationConfigured() {
  return Boolean(process.env.PAYMENT_VERIFICATION_API_URL && process.env.PAYMENT_VERIFICATION_API_KEY);
}

function isWebhookConfigured() {
  return Boolean(process.env.PAYMENT_WEBHOOK_SECRET);
}

async function verifyTransactionWithProvider({ transactionId, amount, upiId, paymentReference }) {
  if (!isAutoVerificationConfigured()) {
    return {
      configured: false,
      verified: false,
      message: 'Automatic bank/UPI verification API is not configured on this server. Manual admin verification is active.',
    };
  }

  const resp = await axios.post(
    process.env.PAYMENT_VERIFICATION_API_URL,
    { transactionId, amount, upiId, paymentReference },
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYMENT_VERIFICATION_API_KEY}`,
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    }
  );

  const d = resp.data || {};
  const statusOk = String(d.status || '').toUpperCase() === 'SUCCESS';
  const amountOk = Number(d.amount) === Number(amount);
  const upiOk = !d.upiId || String(d.upiId).toLowerCase() === String(upiId).toLowerCase();
  const refOk = !d.paymentReference || String(d.paymentReference) === String(paymentReference);

  if (!statusOk || !amountOk || !upiOk || !refOk) {
    return {
      configured: true,
      verified: false,
      message: `Provider mismatch or non-success status (${d.status || 'UNKNOWN'})`,
      providerResponse: d,
    };
  }

  return {
    configured: true,
    verified: true,
    providerReference: d.providerReference || d.rrn || transactionId,
    providerResponse: d,
  };
}

module.exports = {
  ALL_PERMISSIONS,
  getGlobalSettings,
  updateGlobalSettings,
  getPlans,
  createPlan,
  updatePlan,
  deletePlan,
  getAllSubAdminPermissions,
  getSubAdminPermissions,
  setSubAdminPermissions,
  saveOrderMeta,
  getOrderMeta,
  findOrderByOrderId,
  listOrderMetas,
  uploadPrivateScreenshot,
  downloadPrivateScreenshot,
  appendAuditLog,
  listAuditLogs,
  createNotification,
  getSubscriptionMeta,
  saveSubscriptionMeta,
  activateOrExtendSubscription,
  computeUserSubscriptionState,
  isAutoVerificationConfigured,
  isWebhookConfigured,
  verifyTransactionWithProvider,
};
