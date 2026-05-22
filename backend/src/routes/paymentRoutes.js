const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { supabaseAdmin } = require('../config/supabase');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Validate Promocode
router.get('/validate-promo/:code', protect, async (req, res) => {
  try {
    const { code } = req.params;
    const { data, error } = await supabaseAdmin.rpc('validate_promo', { promo_code: code });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate UPI Link and Reference
router.post('/create', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { promoCode } = req.body;
    
    // Check if there is already a pending request
    const { data: existingPending } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (existingPending) {
      return res.status(400).json({ error: "You already have a pending payment request." });
    }

    let amount = 199;
    let promoCodeId = null;

    if (promoCode) {
        const { data: promoData, error: promoErr } = await supabaseAdmin.rpc('validate_promo', { promo_code: promoCode });
        if (promoErr) throw promoErr;
        
        if (promoData && promoData.valid) {
            const discount = (amount * promoData.discount_percentage) / 100;
            amount = Math.floor(amount - discount);
            promoCodeId = promoData.id;
        } else {
            return res.status(400).json({ error: promoData?.message || "Invalid promocode" });
        }
    }

    // Generate Payment Reference
    const userIdLast4 = userId.slice(-4).toUpperCase();
    const random4 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const payment_reference = `SAMU_${userIdLast4}_${random4}`;

    const upiId = "mrx4u@ybl";
    const upiLink = `upi://pay?pa=${upiId}&pn=SAMU%20MCQs&am=${amount}&cu=INR&tn=${payment_reference}`;

    const { error: insertErr } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        payment_reference,
        transaction_id: `TEMP_${payment_reference}`, // Placeholder until submit
        amount,
        promo_code_id: promoCodeId,
        status: 'pending'
      });

    if (insertErr) throw insertErr;

    res.status(201).json({
      payment_reference,
      upiLink,
      amount,
      upiId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit Transaction ID
router.post('/submit', protect, async (req, res) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user.id;

    if (!transactionId || transactionId.length < 8) {
      return res.status(400).json({ error: "Valid Transaction ID is required." });
    }

    const { data: pendingRequest } = await supabaseAdmin
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .maybeSingle();

    if (!pendingRequest) {
      return res.status(404).json({ error: "No pending request found." });
    }

    const { error: updateErr } = await supabaseAdmin
      .from('payment_requests')
      .update({ transaction_id: transactionId })
      .eq('id', pendingRequest.id);
    
    if (updateErr) throw updateErr;

    res.json({ message: "Payment submitted successfully. Awaiting admin verification." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin: Get All Pending Payments
router.get('/admin/pending', protect, adminOnly, async (req, res) => {
    const { data, error } = await supabaseAdmin
        .from('payment_requests')
        .select('*, profiles(email, name)')
        .eq('status', 'pending');
    
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Admin: Approve Payment
router.post('/admin/approve/:id', protect, adminOnly, async (req, res) => {
    const { id } = req.params;
    const { error } = await supabaseAdmin
        .from('payment_requests')
        .update({ status: 'approved' })
        .eq('id', id);
    
    if (error) return res.status(500).json({ error: error.message });
    res.json({ message: "Payment approved and subscription activated." });
});

// Claim Free Promo (100% discount code)
router.post('/claim-free-promo', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { promoCode } = req.body;
    
    if (!promoCode) {
      return res.status(400).json({ error: "Promo code is required." });
    }

    // 1. Validate promo code via RPC
    const { data: promoData, error: promoErr } = await supabaseAdmin.rpc('validate_promo', { promo_code: promoCode });
    if (promoErr) throw promoErr;

    if (!promoData || !promoData.valid) {
      return res.status(400).json({ error: promoData?.message || "Invalid or inactive promo code." });
    }

    if (parseFloat(promoData.discount_percentage) !== 100.00) {
      return res.status(400).json({ error: "This promo code does not offer a 100% discount." });
    }

    // Check if user already has an active subscription
    const { data: activeSub, error: subCheckErr } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    if (subCheckErr) throw subCheckErr;

    if (activeSub) {
      return res.status(400).json({ error: "You already have an active subscription." });
    }

    // Generate unique payment reference and transaction ID
    const userIdLast4 = userId.slice(-4).toUpperCase();
    const random4 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const paymentReference = `SAMU_${userIdLast4}_${random4}`;
    const transactionId = `FREE_${promoCode}_${paymentReference}`;

    // 2. Insert payment request with approved status and 0 amount
    const { error: insertErr } = await supabaseAdmin
      .from('payment_requests')
      .insert({
        user_id: userId,
        payment_reference: paymentReference,
        transaction_id: transactionId,
        amount: 0,
        promo_code_id: promoData.id,
        status: 'approved'
      });

    if (insertErr) {
      if (insertErr.code === '23505') {
        return res.status(400).json({ error: "This request has already been processed." });
      }
      throw insertErr;
    }

    // 3. Upsert subscription for 90 days
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 90);

    const { error: subUpsertErr } = await supabaseAdmin
      .from('subscriptions')
      .upsert({
        user_id: userId,
        status: 'active',
        end_date: endDate.toISOString()
      }, { onConflict: 'user_id' });

    if (subUpsertErr) throw subUpsertErr;

    // 4. Increment promo code usage
    const { data: promoObj, error: getPromoErr } = await supabaseAdmin
      .from('promo_codes')
      .select('current_usage')
      .eq('id', promoData.id)
      .single();

    if (!getPromoErr && promoObj) {
      const newUsage = (promoObj.current_usage || 0) + 1;
      await supabaseAdmin
        .from('promo_codes')
        .update({ current_usage: newUsage })
        .eq('id', promoData.id);
    }

    res.json({ message: "Subscription activated successfully!", end_date: endDate.toISOString() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
