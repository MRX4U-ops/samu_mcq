import { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import QRCode from 'qrcode';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import {
  Crown, ChevronLeft, CheckCircle, MessageCircle, Star, Zap,
  BookOpen, Brain, Trophy, Target, Flame, Shield, ArrowRight,
  Ticket, Gift, Percent, Sparkles, Loader2, AlertCircle, Clock,
  Copy, Check, QrCode, Upload, CreditCard, RefreshCw, Calendar, XCircle
} from 'lucide-react';
import styles from './SubscribePage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

const FEATURES = [
  { icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF', text: 'All 6 SSMU Medical Courses (Year 1–6)' },
  { icon: Brain,    color: '#8B5CF6', bg: '#F5F3FF', text: '8,000+ MCQs & Clinical Case Tasks' },
  { icon: Zap,      color: '#F59E0B', bg: '#FFFBEB', text: 'AI-Powered Study Assistant (Hinglish / Malayalam)' },
  { icon: Trophy,   color: '#10B981', bg: '#F0FDF4', text: 'Real-time Battle Mode & Global Leaderboard' },
  { icon: Target,   color: '#EF4444', bg: '#FFF1F2', text: 'Master Topic Reviews (50-MCQ Comprehensive Sets)' },
  { icon: Flame,    color: '#F97316', bg: '#FFF7ED', text: 'Daily Streaks, Progress Analytics & Bookmarks' },
];

const STATUS_META = {
  ACTIVE:               { label: 'ACTIVE',               bg: '#DCFCE7', color: '#166534' },
  PENDING_PAYMENT:      { label: 'PENDING PAYMENT',      bg: '#DBEAFE', color: '#1E40AF' },
  PAYMENT_VERIFICATION: { label: 'UNDER VERIFICATION',   bg: '#FEF3C7', color: '#92400E' },
  EXPIRED:              { label: 'EXPIRED',              bg: '#FEE2E2', color: '#991B1B' },
  REJECTED:             { label: 'REJECTED',             bg: '#FEE2E2', color: '#991B1B' },
  SUSPENDED:            { label: 'SUSPENDED',            bg: '#FFE4E6', color: '#9F1239' },
  CANCELLED:            { label: 'CANCELLED',            bg: '#F1F5F9', color: '#475569' },
  FREE:                 { label: 'FREE PLAN',            bg: '#F1F5F9', color: '#475569' },
};

function toLocalDatetimeInput(date = new Date()) {
  const pad = (n) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export default function SubscribePage() {
  const { user, isSubscribed, subscription, subscriptionState, refreshSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCode = (searchParams.get('code') || '').trim();

  // Dynamic Config & Plans from Backend (auto-updates when Admin changes plans/prices!)
  const [config, setConfig] = useState({
    upiId: 'mrx4u@ybl',
    defaultPrice: 49,
    defaultValidityDays: 90,
    plans: [],
    verificationMode: 'manual',
  });
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Payment Order & QR State
  const [activeOrder, setActiveOrder] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);

  // Payment Submission Form
  const [utr, setUtr] = useState('');
  const [payerName, setPayerName] = useState('');
  const [paymentDateTime, setPaymentDateTime] = useState(toLocalDatetimeInput());
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitError, setSubmitError] = useState('');

  // History & Live Sub State
  const [history, setHistory] = useState([]);
  const [subInfo, setSubInfo] = useState(null);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Coupon Code State
  const [couponCode, setCouponCode] = useState(urlCode);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [appliedDiscountCode, setAppliedDiscountCode] = useState('');

  useEffect(() => {
    if (urlCode) setCouponCode(urlCode.toUpperCase());
  }, [urlCode]);

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const loadConfigAndHistory = useCallback(async () => {
    setLoadingConfig(true);
    try {
      const cfgRes = await fetch(`${API_BASE_URL}/api/payments/config`);
      if (cfgRes.ok) {
        const cfg = await cfgRes.json();
        setConfig(cfg);
        if (Array.isArray(cfg.plans) && cfg.plans.length > 0) {
          setSelectedPlanId((prev) => {
            if (prev && cfg.plans.some((p) => p.id === prev)) return prev;
            const pop = cfg.plans.find((p) => p.isPopular) || cfg.plans[0];
            return pop.id;
          });
        }
      }
    } catch (e) {
      console.warn('Payment config fetch warning:', e.message);
    } finally {
      setLoadingConfig(false);
    }

    if (!user) return;
    setLoadingHistory(true);
    try {
      const token = await getToken();
      if (!token) return;
      const [histRes, subRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/payments/my-history`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/api/payments/my-subscription`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (histRes.ok) {
        const histData = await histRes.json();
        setHistory(Array.isArray(histData) ? histData : []);
        // Resume unsubmitted pending order if not expired
        const unpaid = (histData || []).find(
          (h) => h.status === 'pending' && !h.transactionId && (!h.expiresAt || new Date(h.expiresAt) > new Date())
        );
        if (unpaid && unpaid.upiUri) {
          setActiveOrder(unpaid);
        }
      }
      if (subRes.ok) {
        setSubInfo(await subRes.json());
      }
    } catch {}
    finally {
      setLoadingHistory(false);
    }
  }, [user]);

  useEffect(() => {
    loadConfigAndHistory();
  }, [loadConfigAndHistory]);

  // Generate QR code when activeOrder changes
  useEffect(() => {
    if (!activeOrder?.upiUri) {
      setQrDataUrl('');
      return;
    }
    QRCode.toDataURL(activeOrder.upiUri, { width: 220, margin: 2 })
      .then((url) => setQrDataUrl(url))
      .catch(() => setQrDataUrl(''));
  }, [activeOrder?.upiUri]);

  const activePlans = config.plans && config.plans.length > 0
    ? config.plans
    : [{ id: 'default-plan', name: 'Standard 90-Day Pass', days: config.defaultValidityDays || 90, price: config.defaultPrice ?? 49, description: 'Full access to all courses and MCQs', isPopular: true }];

  const selectedPlan = activePlans.find((p) => p.id === selectedPlanId) || activePlans[0];

  const handleCreateOrder = async (replacePending = false) => {
    if (!user) {
      setOrderError('Please sign in first to create a payment order.');
      return;
    }
    setCreatingOrder(true);
    setOrderError('');
    setSubmitSuccess('');
    setSubmitError('');

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/payments/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          planId: selectedPlan?.id,
          promoCode: appliedDiscountCode || undefined,
          replacePending,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not create payment order');
      setActiveOrder(data);
      setPayerName(user?.user_metadata?.full_name || '');
      setPaymentDateTime(toLocalDatetimeInput());
      await loadConfigAndHistory();
    } catch (err) {
      setOrderError(err.message || 'Failed to generate UPI order.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!activeOrder) return;
    setSubmitError('');
    setSubmitSuccess('');

    const cleanUtr = utr.trim().toUpperCase();
    if (cleanUtr.length < 8) {
      setSubmitError('Please enter a valid UPI Transaction ID / UTR (at least 8 characters).');
      return;
    }
    if (payerName.trim().length < 2) {
      setSubmitError('Please enter the Payer Name as shown in your UPI app.');
      return;
    }
    if (screenshotFile && screenshotFile.size > 5 * 1024 * 1024) {
      setSubmitError('Screenshot must be 5 MB or smaller.');
      return;
    }

    setSubmittingPayment(true);
    try {
      const token = await getToken();
      const fd = new FormData();
      fd.append('orderId', activeOrder.orderId);
      fd.append('paymentReference', activeOrder.paymentReference || activeOrder.payment_reference);
      fd.append('transactionId', cleanUtr);
      fd.append('payerName', payerName.trim());
      fd.append('transactionDate', new Date(paymentDateTime).toISOString());
      if (screenshotFile) {
        fd.append('screenshot', screenshotFile);
      }

      const res = await fetch(`${API_BASE_URL}/api/payments/submit`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit payment details');

      setSubmitSuccess(data.message);
      setActiveOrder(null);
      setUtr('');
      setScreenshotFile(null);
      await Promise.all([loadConfigAndHistory(), refreshSubscription?.()]);
    } catch (err) {
      setSubmitError(err.message || 'Payment submission failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCopy = async (text, which) => {
    try {
      await navigator.clipboard.writeText(text);
      if (which === 'upi') {
        setCopiedUpi(true);
        setTimeout(() => setCopiedUpi(false), 2000);
      } else {
        setCopiedRef(true);
        setTimeout(() => setCopiedRef(false), 2000);
      }
    } catch {}
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    if (!user) {
      setCouponError('Please sign in or register to redeem a coupon code.');
      return;
    }
    setCouponLoading(true);
    setCouponError(null);
    setCouponResult(null);
    const cleanCode = couponCode.trim().toUpperCase();

    try {
      const { data: promoData, error: promoErr } = await supabase.rpc('validate_promo', { promo_code: cleanCode });
      if (promoErr) throw promoErr;
      if (!promoData || !promoData.valid) {
        throw new Error(promoData?.message || 'Invalid or expired coupon code.');
      }

      const discountVal = parseFloat(promoData.discount_percentage);
      const isFreeDays = discountVal < 0;
      const is100Percent = discountVal === 100.0;

      if (isFreeDays || is100Percent) {
        const token = await getToken();
        const res = await fetch(`${API_BASE_URL}/api/payments/claim-free-promo`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ promoCode: cleanCode }),
        });
        const resData = await res.json();
        if (!res.ok) throw new Error(resData.error || 'Failed to activate coupon.');

        const freeDays = resData.free_days || (isFreeDays ? Math.round(Math.abs(discountVal)) : 90);
        await Promise.all([refreshSubscription?.(), loadConfigAndHistory()]);

        setCouponResult({
          type: 'free',
          title: '🎉 Coupon Activated Successfully!',
          message: `Granted ${freeDays} Days of 100% Free Full Premium Access!`,
          endDate: resData.end_date ? new Date(resData.end_date).toLocaleDateString() : 'Extended',
          code: cleanCode,
        });
        setCouponCode('');
      } else {
        const originalPrice = Number(selectedPlan?.price ?? config.defaultPrice ?? 49);
        const discountAmount = Math.round((originalPrice * discountVal) / 100);
        const finalPrice = Math.max(1, originalPrice - discountAmount);
        setAppliedDiscountCode(cleanCode);
        setCouponResult({
          type: 'discount',
          title: `🏷️ ${discountVal}% Discount Applied!`,
          message: `Coupon '${cleanCode}' applied to ${selectedPlan?.name}: ₹${originalPrice} → ₹${finalPrice}. Click "Pay via Direct UPI" below to generate your discounted order.`,
          discount: discountVal,
          finalPrice,
          code: cleanCode,
        });
      }
    } catch (err) {
      setCouponError(err.message || 'Failed to validate coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  const liveSub = subInfo || subscriptionState || {};
  const subStatusKey = liveSub.status || (isSubscribed ? 'ACTIVE' : 'FREE');
  const statusBadge = STATUS_META[subStatusKey] || STATUS_META.FREE;
  const displayStart = liveSub.startDate || subscription?.start_date;
  const displayEnd = liveSub.endDate || subscription?.end_date;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Link to="/home" className={styles.backBtn} style={{ marginBottom: 0 }}>
            <ChevronLeft size={18} /> Back
          </Link>
          <button
            type="button"
            onClick={loadConfigAndHistory}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10, border: '1px solid #CBD5E1', background: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
          >
            <RefreshCw size={14} className={loadingHistory ? styles.spin : ''} />
            <span>Refresh Status</span>
          </button>
        </div>

        {/* ── Current Subscription Status Summary Card ── */}
        {user && (
          <div className={styles.card} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Crown size={22} color="#F59E0B" />
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: '#0F172A' }}>
                    {liveSub.planName || (isSubscribed ? 'Premium Plan' : 'Free Account')}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>
                    {liveSub.price != null ? `Plan Price: ₹${liveSub.price}` : `Standard: ₹${config.defaultPrice} / ${config.defaultValidityDays} days`}
                  </div>
                </div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 999, fontSize: 11, fontWeight: 900, background: statusBadge.bg, color: statusBadge.color }}>
                {statusBadge.label}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
              <div style={{ padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>START DATE</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                  {displayStart ? new Date(displayStart).toLocaleDateString('en-IN') : '—'}
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>EXPIRY DATE</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', marginTop: 2 }}>
                  {displayEnd ? new Date(displayEnd).toLocaleDateString('en-IN') : '—'}
                </div>
              </div>
              <div style={{ padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>REMAINING DAYS</div>
                <div style={{ fontSize: 13.5, fontWeight: 800, color: liveSub.isActive ? '#059669' : '#DC2626', marginTop: 2 }}>
                  {liveSub.isActive ? `${liveSub.remainingDays} days left` : '0 days'}
                </div>
              </div>
            </div>

            {subStatusKey === 'PAYMENT_VERIFICATION' && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: '#FFFBEB', border: '1px solid #FDE68A', fontSize: 12.5, fontWeight: 700, color: '#92400E', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Clock size={16} />
                <span>Your payment is currently under verification. Premium access unlocks automatically once verified by an admin.</span>
              </div>
            )}

            {subStatusKey === 'REJECTED' && liveSub.reason && (
              <div style={{ marginTop: 12, padding: '10px 14px', borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', fontSize: 12.5, fontWeight: 700, color: '#991B1B', display: 'flex', alignItems: 'center', gap: 8 }}>
                <XCircle size={16} />
                <span>Latest payment rejected: {liveSub.reason}. You may create a new order below.</span>
              </div>
            )}
          </div>
        )}

        {/* ── Dynamic Plans Selector (Admin-Managed Prices & Days) ── */}
        <div className={styles.card}>
          <div className={styles.cardLabel}>
            ✦ {isSubscribed ? 'RENEW OR EXTEND SUBSCRIPTION' : 'CHOOSE YOUR SUBSCRIPTION PLAN'}
          </div>

          {loadingConfig ? (
            <div style={{ textAlign: 'center', padding: 20, color: '#64748B', fontSize: 13 }}>Loading plans...</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 16 }}>
              {activePlans.map((plan) => {
                const isSelected = selectedPlan?.id === plan.id;
                return (
                  <button
                    key={plan.id}
                    type="button"
                    onClick={() => setSelectedPlanId(plan.id)}
                    style={{
                      textAlign: 'left', padding: 16, borderRadius: 16, cursor: 'pointer', position: 'relative',
                      border: isSelected ? '2px solid #2563EB' : '1.5px solid #E2E8F0',
                      background: isSelected ? '#EFF6FF' : '#FFFFFF',
                      transition: 'all 0.15s',
                    }}
                  >
                    {plan.isPopular && (
                      <span style={{ position: 'absolute', top: -10, right: 12, background: '#F59E0B', color: '#fff', fontSize: 10, fontWeight: 900, padding: '2px 8px', borderRadius: 999 }}>
                        POPULAR
                      </span>
                    )}
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A' }}>{plan.name}</div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                      <span style={{ fontSize: 26, fontWeight: 900, color: '#1D4ED8' }}>₹{plan.price}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#475569' }}>/ {plan.days} Days</span>
                    </div>
                    {plan.description && (
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 6, lineHeight: 1.4 }}>{plan.description}</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {orderError && (
            <div className={styles.couponErrorBox} style={{ marginBottom: 12 }}>
              <AlertCircle size={16} />
              <span>{orderError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className={styles.couponSuccessBox} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, color: '#065F46', fontSize: 13 }}>
                <CheckCircle size={18} />
                <span>{submitSuccess}</span>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, paddingTop: 6 }}>
            <div style={{ fontSize: 12.5, color: '#475569', fontWeight: 600 }}>
              Payment Method: <strong>Direct UPI ({config.upiId})</strong> · {isSubscribed ? 'Extends from current expiry' : `${selectedPlan?.days} Days Validity`}
            </div>
            <button
              type="button"
              disabled={creatingOrder || !selectedPlan}
              onClick={() => handleCreateOrder(Boolean(activeOrder))}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 22px',
                borderRadius: 14, border: 'none', background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer', boxShadow: '0 4px 14px rgba(37,99,235,0.28)'
              }}
            >
              {creatingOrder ? <Loader2 size={16} className={styles.spin} /> : <QrCode size={17} />}
              <span>
                {activeOrder ? 'Generate New UPI Order' : `${isSubscribed ? 'Renew' : 'Pay'} ₹${selectedPlan?.price} via UPI`}
              </span>
            </button>
          </div>
        </div>

        {/* ── Active Payment Order: Step 2 (QR + UPI Details) & Step 3 (Submit UTR/Screenshot) ── */}
        {activeOrder && (
          <div className={styles.card} style={{ border: '2px solid #93C5FD', background: '#F8FAFF' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <div style={{ fontSize: 15, fontWeight: 900, color: '#1E3A8A', display: 'flex', alignItems: 'center', gap: 8 }}>
                <CreditCard size={18} />
                <span>Complete Direct UPI Payment</span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: '#DBEAFE', color: '#1E40AF', padding: '3px 10px', borderRadius: 999 }}>
                Order: {activeOrder.orderId}
              </span>
            </div>

            {/* Honest disclaimer */}
            <div style={{ padding: '10px 14px', borderRadius: 12, background: '#FEF3C7', border: '1px solid #FDE68A', fontSize: 12, fontWeight: 700, color: '#92400E', marginBottom: 16 }}>
              ⚠️ Scanning the QR or paying in your UPI app does NOT immediately unlock access. After paying, submit your UTR / Transaction ID below for verification.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 18, alignItems: 'center', marginBottom: 18 }}>
              <div style={{ textAlign: 'center', padding: 16, background: '#fff', borderRadius: 16, border: '1px solid #E2E8F0' }}>
                {qrDataUrl ? (
                  <img src={qrDataUrl} alt="UPI Payment QR Code" style={{ width: 196, height: 196, margin: '0 auto', display: 'block' }} />
                ) : (
                  <div style={{ height: 196, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94A3B8' }}>Generating QR...</div>
                )}
                <div style={{ fontSize: 11.5, fontWeight: 700, color: '#475569', marginTop: 8 }}>
                  Scan with GPay, PhonePe, Paytm, or any UPI app
                </div>
                {activeOrder.upiUri && (
                  <a
                    href={activeOrder.upiUri}
                    style={{ display: 'inline-block', marginTop: 8, padding: '7px 14px', borderRadius: 10, background: '#EFF6FF', color: '#1D4ED8', fontSize: 12, fontWeight: 800, textDecoration: 'none' }}
                  >
                    Open UPI App (₹{activeOrder.amount}) →
                  </a>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>PAYABLE AMOUNT</div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>
                    ₹{activeOrder.amount} <span style={{ fontSize: 12, color: '#64748B', fontWeight: 600 }}>({activeOrder.validityDays} Days)</span>
                  </div>
                </div>

                <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>UPI ID</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#0F172A', fontFamily: 'monospace' }}>{activeOrder.upiId || config.upiId}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeOrder.upiId || config.upiId, 'upi')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedUpi ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copiedUpi ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div style={{ padding: 12, borderRadius: 12, background: '#fff', border: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B' }}>PAYMENT REFERENCE</div>
                    <div style={{ fontSize: 13, fontWeight: 900, color: '#1E40AF', fontFamily: 'monospace' }}>
                      {activeOrder.paymentReference || activeOrder.payment_reference}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(activeOrder.paymentReference || activeOrder.payment_reference, 'ref')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                  >
                    {copiedRef ? <Check size={14} color="#059669" /> : <Copy size={14} />}
                    <span>{copiedRef ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Step 3: Submit Payment Verification Form */}
            <form onSubmit={handleSubmitPayment} style={{ paddingTop: 14, borderTop: '1px solid #DBEAFE', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 900, color: '#0F172A' }}>
                Step 3: Submit UPI Transaction Details
              </div>

              {submitError && (
                <div className={styles.couponErrorBox}>
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    UPI Transaction ID / UTR *
                  </label>
                  <input
                    type="text"
                    required
                    value={utr}
                    onChange={(e) => setUtr(e.target.value.toUpperCase())}
                    placeholder="e.g. 432918472910"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontFamily: 'monospace' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Payer Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={payerName}
                    onChange={(e) => setPayerName(e.target.value)}
                    placeholder="Account holder name"
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Payment Date &amp; Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={paymentDateTime}
                    onChange={(e) => setPaymentDateTime(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13 }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 4 }}>
                    Payment Screenshot (Optional, max 5MB)
                  </label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(e) => setScreenshotFile(e.target.files?.[0] || null)}
                    style={{ width: '100%', padding: '7px 10px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 12, background: '#fff' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPayment}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '13px', borderRadius: 12, border: 'none',
                  background: '#059669', color: '#fff', fontWeight: 900, fontSize: 14, cursor: 'pointer'
                }}
              >
                {submittingPayment ? <Loader2 size={16} className={styles.spin} /> : <Upload size={16} />}
                <span>{submittingPayment ? 'Submitting for Verification...' : 'Submit Payment for Verification'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ── Coupon Code Box ── */}
        <div className={styles.couponCard}>
          <div className={styles.couponTop}>
            <div className={styles.couponIconBox}><Ticket size={24} color="#0284C7" /></div>
            <div>
              <h3 className={styles.couponTitle}>Have a Coupon or Promo Code?</h3>
              <p className={styles.couponSub}>Enter code for instant free days access or a subscription discount.</p>
            </div>
          </div>

          <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="e.g. TRH100, TRH20..."
              className={styles.couponInput}
            />
            <button type="submit" disabled={couponLoading || !couponCode.trim()} className={styles.couponApplyBtn}>
              {couponLoading ? <Loader2 size={16} className={styles.spin} /> : <Sparkles size={16} />}
              <span>{couponLoading ? 'Checking...' : 'Redeem Coupon'}</span>
            </button>
          </form>

          {couponError && (
            <div className={styles.couponErrorBox}><AlertCircle size={16} /><span>{couponError}</span></div>
          )}

          {couponResult && (
            <div className={couponResult.type === 'free' ? styles.couponSuccessBox : styles.couponDiscountBox}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {couponResult.type === 'free' ? <Gift size={22} color="#059669" /> : <Percent size={22} color="#1D4ED8" />}
                <div>
                  <h4 style={{ fontSize: 14.5, fontWeight: 900, margin: 0 }}>{couponResult.title}</h4>
                  <p style={{ fontSize: 13, margin: '4px 0 0', fontWeight: 600 }}>{couponResult.message}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Student Payment History ── */}
        {user && (
          <div className={styles.card}>
            <div className={styles.cardLabel}>✦ YOUR PAYMENT HISTORY</div>
            {history.length === 0 ? (
              <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>No payment transactions yet.</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {history.map((h) => {
                  const badge =
                    h.status === 'approved' ? { bg: '#DCFCE7', color: '#166534', text: 'APPROVED' }
                    : h.status === 'rejected' ? { bg: '#FEE2E2', color: '#991B1B', text: 'REJECTED' }
                    : h.transactionId ? { bg: '#FEF3C7', color: '#92400E', text: 'UNDER VERIFICATION' }
                    : { bg: '#DBEAFE', color: '#1E40AF', text: 'PENDING PAYMENT' };

                  return (
                    <div key={h.id} style={{ padding: 14, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12.5 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                        <strong style={{ color: '#0F172A' }}>{h.orderId} · {h.planName} ({h.validityDays}d)</strong>
                        <span style={{ padding: '2px 10px', borderRadius: 999, fontSize: 10.5, fontWeight: 900, background: badge.bg, color: badge.color }}>
                          {badge.text}
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, color: '#475569', marginTop: 6 }}>
                        <span>Amount: <strong>₹{h.amount}</strong></span>
                        <span>Ref: <code>{h.paymentReference}</code></span>
                        {h.transactionId && <span>UTR: <code>{h.transactionId}</code></span>}
                        <span>Date: {new Date(h.transactionDate || h.createdAt).toLocaleDateString()}</span>
                        {h.verifiedAt && <span>Reviewed: {new Date(h.verifiedAt).toLocaleDateString()}</span>}
                      </div>
                      {h.rejectionReason && (
                        <div style={{ marginTop: 6, color: '#B91C1C', fontWeight: 700 }}>
                          Rejection Reason: {h.rejectionReason}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Features Included ── */}
        {!isSubscribed && (
          <div className={styles.card}>
            <div className={styles.cardLabel}>✦ WHAT'S INCLUDED</div>
            <div className={styles.featuresList}>
              {FEATURES.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <div className={styles.featureIcon} style={{ background: f.bg }}><f.icon size={16} color={f.color} /></div>
                  <span className={styles.featureText}>{f.text}</span>
                  <CheckCircle size={16} color="#10B981" fill="#10B981" style={{ flexShrink: 0 }} />
                </div>
              ))}
            </div>
          </div>
        )}

        <p className={styles.footNote}>
          Need help with payment? Contact <a href="https://t.me/mrx4u" target="_blank" rel="noopener noreferrer">@mrx4u on Telegram</a>.
        </p>
      </div>
    </div>
  );
}
