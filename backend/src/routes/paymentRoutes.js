const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const multer = require('multer');
const rateLimit = require('express-rate-limit');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/authMiddleware');
const paymentStore = require('../services/paymentStore');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 25,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many payment requests. Please wait a few minutes and try again.' },
});

function getClientIp(req) {
  return (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '').toString().split(',')[0].trim();
}

// ── Public / Student Configuration (Plans + UPI + Announcements) ──
router.get('/config', async (req, res) => {
  try {
    const [settings, plans] = await Promise.all([
      paymentStore.getGlobalSettings(),
      paymentStore.getPlans({ activeOnly: true }),
    ]);

    res.json({
      appName: settings.appName || 'SSMU MCQs',
      upiId: settings.upiId || 'mrx4u@ybl',
      defaultPrice: settings.defaultPrice ?? 49,
      defaultValidityDays: settings.defaultValidityDays ?? 90,
      announcementBanner: settings.announcementBanner || '',
      telegramLink: settings.telegramLink || 'https://t.me/mrx4u',
      supportEmail: settings.supportEmail || 'samumcqs@gmail.com',
      maintenanceMode: Boolean(settings.maintenanceMode),
      autoVerificationConfigured: paymentStore.isAutoVerificationConfigured(),
      verificationMode: paymentStore.isAutoVerificationConfigured() && settings.autoVerifyEnabled ? 'automatic' : 'manual',
      plans,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Validate Promocode ──
router.get('/validate-promo/:code', protect, async (req, res) => {
  try {
    const { code } = req.params;
    const { data, error } = await supabaseAdmin.rpc('validate_promo', { promo_code: code.trim().toUpperCase() });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Step 1: Create Unique Payment Order (Server calculates amount & validity) ──
async function handleCreateOrder(req, res) {
  try {
    const userId = req.user.id;
    const { planId, promoCode, replacePending = false } = req.body || {};

    const [settings, plans] = await Promise.all([
      paymentStore.getGlobalSettings(),
      paymentStore.getPlans({ activeOnly: true }),
    ]);

    let selectedPlan = plans.find((p) => p.id === planId) || plans.find((p) => p.isPopular) || plans[0];
    if (!selectedPlan) {
      selectedPlan = {
        id: 'default-plan',
        name: 'Standard Pass',
        days: settings.defaultValidityDays || 90,
        price: settings.defaultPrice ?? 49,
      };
    }

    // Check existing pending order
    const { data: existingPending } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingPending) {
      const existingMeta = await paymentStore.getOrderMeta(existingPending.id);
      const isSubmitted = existingPending.transaction_id && !existingPending.transaction_id.startsWith('TEMP_');
      const isExpired = existingMeta?.expiresAt && new Date(existingMeta.expiresAt) < new Date();

      if (isSubmitted && !isExpired) {
        return res.status(400).json({
          error: 'You already have a payment awaiting admin verification. Please wait for verification before creating a new order.',
          existingOrder: { ...existingPending, meta: existingMeta },
        });
      }

      // If unsubmitted old order is expired or student wants a fresh plan/order, cancel old temp order
      if (isExpired || replacePending || !isSubmitted) {
        await supabaseAdmin
          .from('payment_requests')
          .update({ status: 'rejected', updated_at: new Date().toISOString() })
          .eq('id', existingPending.id);

        if (existingMeta) {
          await paymentStore.saveOrderMeta(existingPending.id, {
            ...existingMeta,
            orderStatus: isExpired ? 'EXPIRED' : 'CANCELLED',
            rejectionReason: isExpired ? 'Order expired before payment submission' : 'Replaced by new payment order',
          });
        }
      }
    }

    const baseAmount = Number(selectedPlan.price);
    let finalAmount = baseAmount;
    let discountAmount = 0;
    let promoCodeId = null;

    if (promoCode && String(promoCode).trim()) {
      const cleanCode = String(promoCode).trim().toUpperCase();
      const { data: promoData, error: promoErr } = await supabaseAdmin.rpc('validate_promo', { promo_code: cleanCode });
      if (promoErr) throw promoErr;
      if (!promoData || !promoData.valid) {
        return res.status(400).json({ error: promoData?.message || 'Invalid promocode' });
      }
      const pct = Number(promoData.discount_percentage);
      if (pct < 0 || pct >= 100) {
        return res.status(400).json({ error: 'Use Redeem Free Coupon for 100% / free-days promo codes.' });
      }
      // Enforce 1-time per account
      const { data: usedBefore } = await supabaseAdmin
        .from('payment_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('promo_code_id', promoData.id)
        .eq('status', 'approved')
        .limit(1);
      if (usedBefore && usedBefore.length > 0) {
        return res.status(400).json({ error: `Coupon '${cleanCode}' has already been used on this account.` });
      }
      discountAmount = Math.round(((baseAmount * pct) / 100) * 100) / 100;
      finalAmount = Math.max(1, Math.round((baseAmount - discountAmount) * 100) / 100);
      promoCodeId = promoData.id;
    }

    const userIdLast4 = userId.replace(/-/g, '').slice(-4).toUpperCase();
    const random6 = crypto.randomBytes(3).toString('hex').toUpperCase();
    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${random6}`;
    const paymentReference = `SAMU_${userIdLast4}_${random6}`;
    const upiId = settings.upiId || 'mrx4u@ybl';
    const upiUri = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent('SSMU MCQs')}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent(paymentReference)}`;
    const nowIso = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        payment_reference: paymentReference,
        transaction_id: `TEMP_${paymentReference}`,
        amount: finalAmount,
        promo_code_id: promoCodeId,
        status: 'pending',
      })
      .select()
      .single();

    if (insertErr) throw insertErr;

    const orderMeta = {
      orderId,
      paymentRequestId: inserted.id,
      userId,
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      validityDays: Number(selectedPlan.days) || 90,
      baseAmount,
      discountAmount,
      amount: finalAmount,
      currency: 'INR',
      paymentMethod: 'DIRECT_UPI',
      upiId,
      paymentReference,
      upiUri,
      orderStatus: 'PENDING',
      verificationStatus: 'PENDING',
      verificationMethod: 'MANUAL_ADMIN',
      createdAt: nowIso,
      expiresAt,
    };

    await paymentStore.saveOrderMeta(inserted.id, orderMeta);
    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: inserted.id,
      userId,
      action: 'ORDER_CREATED',
      previousStatus: null,
      newStatus: 'PENDING',
      newValues: { orderId, amount: finalAmount, planId: selectedPlan.id, validityDays: orderMeta.validityDays },
      reason: 'Student initiated payment order',
      ipAddress: getClientIp(req),
    });

    res.status(201).json({
      id: inserted.id,
      orderId,
      payment_reference: paymentReference,
      paymentReference,
      upiLink: upiUri,
      upiUri,
      upiId,
      amount: finalAmount,
      baseAmount,
      discountAmount,
      currency: 'INR',
      planId: selectedPlan.id,
      planName: selectedPlan.name,
      validityDays: orderMeta.validityDays,
      status: 'PENDING',
      expiresAt,
      createdAt: nowIso,
    });
  } catch (error) {
    console.error('[payments/orders] create error:', error);
    res.status(500).json({ error: error.message || 'Failed to create payment order' });
  }
}

router.post('/orders', protect, paymentLimiter, handleCreateOrder);
router.post('/create', protect, paymentLimiter, handleCreateOrder);

// ── Get Single Order ──
router.get('/orders/:orderId', protect, async (req, res) => {
  try {
    const meta = await paymentStore.findOrderByOrderId(req.params.orderId);
    if (!meta || (meta.userId !== req.user.id && !req.user.isAdmin)) {
      return res.status(404).json({ error: 'Payment order not found' });
    }
    res.json(meta);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Step 3: Submit Payment Details (UTR, Payer Name, Date, Optional Screenshot) ──
router.post('/submit', protect, paymentLimiter, upload.single('screenshot'), async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, paymentReference, transactionId, payerName, transactionDate, screenshotBase64, screenshotMime } = req.body || {};

    const cleanUtr = String(transactionId || '').trim().toUpperCase();
    const cleanPayer = String(payerName || '').trim();

    if (!cleanUtr || cleanUtr.length < 8 || cleanUtr.length > 40 || !/^[A-Z0-9_-]+$/.test(cleanUtr) || cleanUtr.startsWith('TEMP_')) {
      return res.status(400).json({ error: 'Please enter a valid UPI Transaction ID / UTR (8–40 alphanumeric characters).' });
    }
    if (!cleanPayer || cleanPayer.length < 2) {
      return res.status(400).json({ error: 'Payer name is required.' });
    }

    const parsedDate = transactionDate ? new Date(transactionDate) : new Date();
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: 'Invalid payment date and time.' });
    }

    // Locate the target pending order owned by this student
    let pendingRequest = null;
    if (orderId) {
      const meta = await paymentStore.findOrderByOrderId(orderId);
      if (meta && meta.userId === userId) {
        const { data } = await supabaseAdmin.from('payment_requests').select('*').eq('id', meta.paymentRequestId).maybeSingle();
        pendingRequest = data;
      }
    } else if (paymentReference) {
      const { data } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('payment_reference', paymentReference)
        .maybeSingle();
      pendingRequest = data;
    } else {
      const { data } = await supabaseAdmin
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      pendingRequest = data;
    }

    if (!pendingRequest || pendingRequest.user_id !== userId) {
      return res.status(404).json({ error: 'No matching payment order found. Please initiate a new order first.' });
    }
    if (pendingRequest.status !== 'pending') {
      return res.status(400).json({ error: `This payment order is already ${pendingRequest.status}.` });
    }
    if (pendingRequest.transaction_id && !pendingRequest.transaction_id.startsWith('TEMP_')) {
      return res.status(400).json({ error: 'Transaction details were already submitted for this order.' });
    }

    const existingMeta = (await paymentStore.getOrderMeta(pendingRequest.id)) || {
      orderId: `ORD-${pendingRequest.id.slice(0, 8).toUpperCase()}`,
      paymentRequestId: pendingRequest.id,
      userId,
      validityDays: 90,
      amount: Number(pendingRequest.amount),
      upiId: 'mrx4u@ybl',
      paymentReference: pendingRequest.payment_reference,
    };

    if (existingMeta.expiresAt && new Date(existingMeta.expiresAt) < new Date()) {
      await supabaseAdmin.from('payment_requests').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', pendingRequest.id);
      await paymentStore.saveOrderMeta(pendingRequest.id, { ...existingMeta, orderStatus: 'EXPIRED', verificationStatus: 'REJECTED', rejectionReason: 'Order expired' });
      return res.status(400).json({ error: 'This payment order has expired. Please create a new order.' });
    }

    // Anti-Fraud: Check duplicate UTR across ALL payment_requests
    const { data: dupCheck } = await supabaseAdmin
      .from('payment_requests')
      .select('id, user_id, status')
      .eq('transaction_id', cleanUtr)
      .limit(1);

    if (dupCheck && dupCheck.length > 0) {
      await paymentStore.appendAuditLog({
        category: 'PAYMENT',
        targetId: pendingRequest.id,
        userId,
        action: 'DUPLICATE_UTR_ATTEMPT',
        previousStatus: 'PENDING',
        newStatus: 'FLAGGED',
        newValues: { attemptedUtr: cleanUtr, originalPaymentId: dupCheck[0].id },
        reason: 'Duplicate UTR submission blocked',
        ipAddress: getClientIp(req),
      });
      await paymentStore.saveOrderMeta(pendingRequest.id, {
        ...existingMeta,
        isSuspicious: true,
        isDuplicateAttempt: true,
        suspiciousReasons: [...(existingMeta.suspiciousReasons || []), `Attempted reuse of UTR ${cleanUtr}`],
      });
      return res.status(409).json({
        error: 'This UPI Transaction ID / UTR has already been submitted. Duplicate UTRs are blocked.',
      });
    }

    // Handle optional screenshot upload privately (never public URLs)
    let screenshotPath = null;
    if (req.file && req.file.buffer) {
      const uploaded = await paymentStore.uploadPrivateScreenshot({
        userId,
        paymentRequestId: pendingRequest.id,
        buffer: req.file.buffer,
        mimeType: req.file.mimetype,
      });
      screenshotPath = uploaded.storagePath;
    } else if (screenshotBase64 && typeof screenshotBase64 === 'string') {
      const match = screenshotBase64.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/);
      if (!match) {
        return res.status(400).json({ error: 'Unsupported screenshot file format. Only PNG, JPG, or WEBP allowed.' });
      }
      const buf = Buffer.from(match[2], 'base64');
      const uploaded = await paymentStore.uploadPrivateScreenshot({
        userId,
        paymentRequestId: pendingRequest.id,
        buffer: buf,
        mimeType: screenshotMime || match[1],
      });
      screenshotPath = uploaded.storagePath;
    }

    // Atomic update: only succeeds if row is still pending & TEMP_
    const nowIso = new Date().toISOString();
    const { data: updatedRow, error: updErr } = await supabaseAdmin
      .from('payment_requests')
      .update({
        transaction_id: cleanUtr,
        updated_at: nowIso,
      })
      .eq('id', pendingRequest.id)
      .eq('status', 'pending')
      .like('transaction_id', 'TEMP_%')
      .select()
      .maybeSingle();

    if (updErr) {
      if (updErr.code === '23505') {
        return res.status(409).json({ error: 'Duplicate Transaction ID detected.' });
      }
      throw updErr;
    }
    if (!updatedRow) {
      return res.status(409).json({ error: 'Order already submitted or processed.' });
    }

    // Suspicious heuristic checks (still allows manual review, flags for admin)
    const suspiciousReasons = [...(existingMeta.suspiciousReasons || [])];
    if (cleanUtr.length < 10) suspiciousReasons.push('Short UTR length (<10 chars)');
    if (/^(.)\1+$/.test(cleanUtr) || cleanUtr.includes('TEST') || cleanUtr.includes('FAKE')) {
      suspiciousReasons.push('Pattern matches test/synthetic UTR');
    }

    // Attempt automatic verification ONLY if authorised provider API is configured
    let verificationMethod = 'MANUAL_ADMIN';
    let verificationStatus = 'PENDING_VERIFICATION';
    let providerReference = null;
    let activated = false;
    let subResult = null;

    if (paymentStore.isAutoVerificationConfigured()) {
      try {
        const autoRes = await paymentStore.verifyTransactionWithProvider({
          transactionId: cleanUtr,
          amount: pendingRequest.amount,
          upiId: existingMeta.upiId,
          paymentReference: pendingRequest.payment_reference,
        });
        if (autoRes.verified) {
          verificationMethod = 'AUTO_API';
          verificationStatus = 'VERIFIED';
          providerReference = autoRes.providerReference;

          // Snapshot subscription BEFORE payment_requests update (avoids legacy DB trigger skew)
          const { data: prevSub } = await supabaseAdmin
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .maybeSingle();

          // Atomic pending -> approved
          const { data: lockedApprove } = await supabaseAdmin
            .from('payment_requests')
            .update({ status: 'approved', updated_at: nowIso })
            .eq('id', pendingRequest.id)
            .eq('status', 'pending')
            .select()
            .maybeSingle();

          if (lockedApprove) {
            subResult = await paymentStore.activateOrExtendSubscription({
              userId,
              validityDays: existingMeta.validityDays || 90,
              planId: existingMeta.planId,
              planName: existingMeta.planName || 'Standard Pass',
              price: Number(pendingRequest.amount),
              paymentTransactionId: cleanUtr,
              activationSource: 'AUTO_API',
              reason: 'Automatically verified by payment provider API',
              previousSub: prevSub || null,
            });
            activated = true;
          }
        }
      } catch (autoErr) {
        console.warn('[payments/submit] auto-verify error (falling back to manual):', autoErr.message);
      }
    }

    const updatedMeta = {
      ...existingMeta,
      transactionId: cleanUtr,
      payerName: cleanPayer,
      transactionDate: parsedDate.toISOString(),
      screenshotPath,
      orderStatus: activated ? 'APPROVED' : 'SUBMITTED',
      verificationMethod,
      verificationStatus,
      providerReference,
      verifiedAt: activated ? nowIso : null,
      isSuspicious: suspiciousReasons.length > 0,
      suspiciousReasons,
      submittedAt: nowIso,
    };

    await paymentStore.saveOrderMeta(pendingRequest.id, updatedMeta);

    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: pendingRequest.id,
      userId,
      action: activated ? 'PAYMENT_AUTO_VERIFIED' : 'PAYMENT_SUBMITTED',
      previousStatus: 'PENDING',
      newStatus: verificationStatus,
      newValues: { transactionId: cleanUtr, payerName: cleanPayer, hasScreenshot: Boolean(screenshotPath), suspiciousReasons },
      reason: activated ? 'Auto-verified via provider API' : 'Submitted for admin verification',
      ipAddress: getClientIp(req),
    });

    if (!activated) {
      await paymentStore.createNotification({
        userId,
        title: 'Payment Submitted for Verification',
        body: `Your UTR ${cleanUtr} (₹${pendingRequest.amount}) has been received and is under verification. Premium access unlocks once verified.`,
        type: 'payment_verification',
        data: { orderId: updatedMeta.orderId, transactionId: cleanUtr, amount: pendingRequest.amount },
      });
    }

    res.json({
      ok: true,
      activated,
      verificationStatus,
      verificationMethod,
      subscription: subResult,
      message: activated
        ? 'Payment verified automatically and subscription activated!'
        : 'Payment details submitted! Your payment is now under verification. Access will unlock after admin approval.',
    });
  } catch (error) {
    console.error('[payments/submit] error:', error);
    res.status(500).json({ error: error.message || 'Failed to submit payment details' });
  }
});

// ── Own Payment History ──
router.get('/my-history', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { data: rows, error } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = await Promise.all(
      (rows || []).map(async (r) => {
        const meta = await paymentStore.getOrderMeta(r.id);
        return {
          id: r.id,
          orderId: meta?.orderId || `ORD-${r.id.slice(0, 8).toUpperCase()}`,
          paymentReference: r.payment_reference,
          transactionId: r.transaction_id?.startsWith('TEMP_') ? null : r.transaction_id,
          amount: Number(r.amount),
          planId: meta?.planId || null,
          planName: meta?.planName || 'Standard Pass',
          validityDays: meta?.validityDays || 90,
          payerName: meta?.payerName || null,
          transactionDate: meta?.transactionDate || r.created_at,
          createdAt: r.created_at,
          updatedAt: r.updated_at,
          expiresAt: meta?.expiresAt || null,
          upiId: meta?.upiId || 'mrx4u@ybl',
          upiUri: meta?.upiUri || null,
          hasScreenshot: Boolean(meta?.screenshotPath),
          status: r.status,
          verificationStatus:
            r.status === 'approved'
              ? 'VERIFIED'
              : r.status === 'rejected'
              ? 'REJECTED'
              : r.transaction_id?.startsWith('TEMP_')
              ? 'PENDING'
              : 'PENDING_VERIFICATION',
          verificationMethod: meta?.verificationMethod || 'MANUAL_ADMIN',
          rejectionReason: meta?.rejectionReason || r.rejection_reason || null,
          verifiedAt: meta?.verifiedAt || (r.status !== 'pending' ? r.updated_at : null),
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Own Subscription State ──
router.get('/my-subscription', protect, async (req, res) => {
  try {
    const state = await paymentStore.computeUserSubscriptionState(req.user.id);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ── Private Screenshot Access (Owner or Admin with view_payments ONLY) ──
router.get('/screenshot/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { data: pr } = await supabaseAdmin.from('payment_requests').select('user_id').eq('id', id).maybeSingle();
    if (!pr) return res.status(404).json({ error: 'Payment record not found' });

    const isOwner = pr.user_id === req.user.id;
    const canAdminView = req.user.isSuperAdmin || (req.user.isAdmin && req.user.permissions?.view_payments);
    if (!isOwner && !canAdminView) {
      return res.status(403).json({ error: 'Access denied to payment screenshot' });
    }

    const meta = await paymentStore.getOrderMeta(id);
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

// ── Provider Webhook (Signature verified + Idempotent) ──
router.post('/webhook', async (req, res) => {
  try {
    const secret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!secret) {
      return res.status(501).json({
        error: 'Webhook processing disabled: PAYMENT_WEBHOOK_SECRET is not configured on this server.',
      });
    }

    const sig = req.headers['x-webhook-signature'] || req.headers['x-signature'];
    const rawBody = JSON.stringify(req.body || {});
    const expectedSig = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');

    if (!sig || !crypto.timingSafeEqual(Buffer.from(String(sig)), Buffer.from(expectedSig))) {
      await paymentStore.appendAuditLog({
        category: 'PAYMENT',
        targetId: 'WEBHOOK',
        action: 'FORGED_WEBHOOK_REJECTED',
        reason: 'Invalid HMAC signature',
        ipAddress: getClientIp(req),
      });
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const { paymentReference, transactionId, providerReference, amount, status, upiId } = req.body || {};
    if (String(status || '').toUpperCase() !== 'SUCCESS') {
      return res.json({ received: true, processed: false, reason: 'Non-success event ignored' });
    }

    const { data: pr } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .or(`payment_reference.eq.${paymentReference},transaction_id.eq.${transactionId}`)
      .maybeSingle();

    if (!pr) return res.status(404).json({ error: 'Matching order not found' });

    // Idempotency check
    if (pr.status === 'approved') {
      return res.json({ received: true, processed: false, idempotent: true, message: 'Already approved' });
    }

    const meta = (await paymentStore.getOrderMeta(pr.id)) || {};
    if (Number(amount) !== Number(pr.amount)) {
      return res.status(400).json({ error: 'Amount mismatch' });
    }
    if (upiId && meta.upiId && String(upiId).toLowerCase() !== String(meta.upiId).toLowerCase()) {
      return res.status(400).json({ error: 'Merchant UPI mismatch' });
    }

    // Snapshot subscription BEFORE payment_requests update (avoids legacy DB trigger skew)
    const { data: prevSub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', pr.user_id)
      .maybeSingle();

    const nowIso = new Date().toISOString();
    const { data: locked } = await supabaseAdmin
      .from('payment_requests')
      .update({ status: 'approved', transaction_id: transactionId || pr.transaction_id, updated_at: nowIso })
      .eq('id', pr.id)
      .eq('status', 'pending')
      .select()
      .maybeSingle();

    if (!locked) {
      return res.json({ received: true, processed: false, idempotent: true });
    }

    const subResult = await paymentStore.activateOrExtendSubscription({
      userId: pr.user_id,
      validityDays: meta.validityDays || 90,
      planId: meta.planId,
      planName: meta.planName || 'Standard Pass',
      price: Number(pr.amount),
      paymentTransactionId: transactionId || pr.transaction_id,
      activationSource: 'WEBHOOK',
      reason: `Verified via provider webhook (${providerReference || 'N/A'})`,
      previousSub: prevSub || null,
    });

    await paymentStore.saveOrderMeta(pr.id, {
      ...meta,
      orderStatus: 'APPROVED',
      verificationStatus: 'VERIFIED',
      verificationMethod: 'WEBHOOK',
      providerReference: providerReference || null,
      verifiedAt: nowIso,
    });

    await paymentStore.appendAuditLog({
      category: 'PAYMENT',
      targetId: pr.id,
      userId: pr.user_id,
      action: 'WEBHOOK_PAYMENT_APPROVED',
      previousStatus: 'pending',
      newStatus: 'approved',
      reason: `Provider ref: ${providerReference || 'N/A'}`,
      ipAddress: getClientIp(req),
    });

    res.json({ received: true, processed: true, subscription: subResult });
  } catch (error) {
    console.error('[payments/webhook] error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ── Claim Free Promo (100% discount / free-days coupon code) ──
router.post('/claim-free-promo', protect, paymentLimiter, async (req, res) => {
  try {
    const userId = req.user.id;
    const { promoCode } = req.body || {};

    if (!promoCode) {
      return res.status(400).json({ error: 'Promo code is required.' });
    }
    const cleanCode = String(promoCode).trim().toUpperCase();

    const { data: promoData, error: promoErr } = await supabaseAdmin.rpc('validate_promo', { promo_code: cleanCode });
    if (promoErr) throw promoErr;

    if (!promoData || !promoData.valid) {
      return res.status(400).json({ error: promoData?.message || 'Invalid or inactive promo code.' });
    }

    const discountVal = parseFloat(promoData.discount_percentage);
    const isFreeDays = discountVal < 0;
    const is100Percent = discountVal === 100.0;

    if (!isFreeDays && !is100Percent) {
      return res.status(400).json({
        error: `This promo code offers a ${discountVal}% discount on subscription purchase.`,
        discount_percentage: discountVal,
        is_discount: true,
      });
    }

    const grantDays = isFreeDays ? Math.round(Math.abs(discountVal)) : 90;

    const { data: alreadyUsed } = await supabaseAdmin
      .from('payment_requests')
      .select('id')
      .eq('user_id', userId)
      .or(`promo_code_id.eq.${promoData.id},payment_reference.ilike.%${cleanCode}%,transaction_id.ilike.%${cleanCode}%`)
      .limit(1);

    if (alreadyUsed && alreadyUsed.length > 0) {
      return res.status(400).json({
        error: `You have already redeemed coupon '${cleanCode}' on this account. Each coupon code can only be used once per account!`,
      });
    }

    const userIdLast4 = userId.replace(/-/g, '').slice(-4).toUpperCase();
    const random4 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const paymentReference = `SAMU_${userIdLast4}_${random4}`;
    const transactionId = `FREE_${cleanCode}_${paymentReference}`;

    const { data: insertedPay, error: insertErr } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        payment_reference: paymentReference,
        transaction_id: transactionId,
        amount: 0,
        promo_code_id: promoData.id,
        status: 'approved',
      })
      .select()
      .single();

    if (insertErr && insertErr.code !== '23505') throw insertErr;

    const subResult = await paymentStore.activateOrExtendSubscription({
      userId,
      validityDays: grantDays,
      planId: `promo-${cleanCode}`,
      planName: `Promo Pass (${cleanCode})`,
      price: 0,
      paymentTransactionId: transactionId,
      activationSource: 'FREE_PROMO',
      reason: `Redeemed promo code ${cleanCode} for ${grantDays} days`,
    });

    if (insertedPay) {
      await paymentStore.saveOrderMeta(insertedPay.id, {
        orderId: `ORD-PROMO-${random4}`,
        paymentRequestId: insertedPay.id,
        userId,
        planId: `promo-${cleanCode}`,
        planName: `Promo Pass (${cleanCode})`,
        validityDays: grantDays,
        amount: 0,
        currency: 'INR',
        paymentMethod: 'FREE_PROMO',
        paymentReference,
        transactionId,
        orderStatus: 'APPROVED',
        verificationMethod: 'FREE_PROMO',
        verificationStatus: 'VERIFIED',
        verifiedAt: new Date().toISOString(),
      });
    }

    const { data: promoObj } = await supabaseAdmin
      .from('promo_codes')
      .select('current_usage')
      .eq('id', promoData.id)
      .single();

    if (promoObj) {
      await supabaseAdmin
        .from('promo_codes')
        .update({ current_usage: (promoObj.current_usage || 0) + 1 })
        .eq('id', promoData.id);
    }

    res.json({
      message: isFreeDays
        ? `🎉 Promo applied! ${grantDays} Days of Free Premium Access activated.`
        : '🎉 100% Free Subscription activated!',
      end_date: subResult.endDate,
      free_days: grantDays,
    });
  } catch (error) {
    console.error('Claim free promo error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
