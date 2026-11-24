import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import {
  Crown, ChevronLeft, CheckCircle, MessageCircle, Star, Zap,
  BookOpen, Brain, Trophy, Target, Flame, Shield, ArrowRight,
  Ticket, Gift, Percent, Sparkles, Loader2, AlertCircle, Clock
} from 'lucide-react';
import styles from './SubscribePage.module.css';

const FEATURES = [
  { icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF', text: 'All 6 SAMU Medical Courses (Year 1–6)' },
  { icon: Brain,    color: '#8B5CF6', bg: '#F5F3FF', text: '8,000+ MCQs & Clinical Case Tasks' },
  { icon: Zap,      color: '#F59E0B', bg: '#FFFBEB', text: 'AI-Powered Study Assistant (Hinglish / Malayalam)' },
  { icon: Trophy,   color: '#10B981', bg: '#F0FDF4', text: 'Real-time Battle Mode & Global Leaderboard' },
  { icon: Target,   color: '#EF4444', bg: '#FFF1F2', text: 'Master Topic Reviews (50-MCQ Comprehensive Sets)' },
  { icon: Flame,    color: '#F97316', bg: '#FFF7ED', text: 'Daily Streaks, Progress Analytics & Bookmarks' },
  { icon: Shield,   color: '#06B6D4', bg: '#ECFEFF', text: 'Exam Results Tracking & Performance History' },
  { icon: Star,     color: '#6366F1', bg: '#EEF2FF', text: 'Revision Engine with Spaced Repetition' },
];

const TESTIMONIALS = [
  { name: 'Abdul A.', course: '3rd Year', text: 'Scored 78 in Biochemistry CBT. Worth every penny!', rating: 5 },
  { name: 'Fatima R.', course: '2nd Year', text: 'Best investment for SAMU exam prep. AI assistant is 🔥', rating: 5 },
  { name: 'Mohammad K.', course: '4th Year', text: 'Battle mode with friends made revision actually fun!', rating: 5 },
];

export default function SubscribePage() {
  const { user, isSubscribed, subscription, refreshSubscription } = useAuth();
  const [searchParams] = useSearchParams();
  const urlCode = (searchParams.get('code') || '').trim();

  const [couponCode, setCouponCode] = useState(urlCode);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponResult, setCouponResult] = useState(null); // { type: 'free' | 'discount', message, details }
  const [couponError, setCouponError] = useState(null);

  useEffect(() => {
    if (urlCode) {
      setCouponCode(urlCode.toUpperCase());
    }
  }, [urlCode]);

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
      // 1. Check if user already used this coupon on this account (1 use per account)
      if (user?.id) {
        const { data: alreadyUsed } = await supabase
          .from('payment_requests')
          .select('id')
          .eq('user_id', user.id)
          .or(`payment_reference.ilike.%${cleanCode}%,transaction_id.ilike.%${cleanCode}%`)
          .limit(1);

        if (alreadyUsed && alreadyUsed.length > 0) {
          throw new Error(`You have already redeemed coupon '${cleanCode}' on this account. Each coupon can only be used once per account!`);
        }
      }

      // 2. Validate via Supabase RPC directly
      const { data: promoData, error: promoErr } = await supabase.rpc('validate_promo', { promo_code: cleanCode });
      if (promoErr) throw promoErr;

      if (!promoData || !promoData.valid) {
        throw new Error(promoData?.message || 'Invalid or expired coupon code.');
      }

      // Double-check with promoData.id if user already redeemed
      if (user?.id && promoData.id) {
        const { data: usedWithId } = await supabase
          .from('payment_requests')
          .select('id')
          .eq('user_id', user.id)
          .eq('promo_code_id', promoData.id)
          .limit(1);

        if (usedWithId && usedWithId.length > 0) {
          throw new Error(`You have already redeemed coupon '${cleanCode}' on this account. Each coupon can only be used once per account!`);
        }
      }

      const discountVal = parseFloat(promoData.discount_percentage);
      const isFreeDays = discountVal < 0;
      const is100Percent = discountVal === 100.00;

      if (isFreeDays || is100Percent) {
        // Free Access coupon → activate via backend claim-free-promo
        const session = (await supabase.auth.getSession())?.data?.session;
        const token = session?.access_token;

        const res = await fetch('https://samu-mcqs.onrender.com/api/payments/claim-free-promo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({ promoCode: cleanCode })
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || 'Failed to activate coupon.');
        }

        const freeDays = resData.free_days || (isFreeDays ? Math.round(Math.abs(discountVal)) : 90);
        if (refreshSubscription) {
          await refreshSubscription();
        }

        setCouponResult({
          type: 'free',
          title: '🎉 Coupon Activated Successfully!',
          message: isFreeDays 
            ? `Granted ${freeDays} Days of 100% Free Full Premium Access!` 
            : `Granted 100% Free Full Access for ${freeDays} Days!`,
          endDate: resData.end_date ? new Date(resData.end_date).toLocaleDateString() : 'Extended',
          code: cleanCode
        });
        setCouponCode('');
      } else {
        // Percentage discount coupon
        const originalPrice = 49;
        const discountAmount = Math.round((originalPrice * discountVal) / 100);
        const finalPrice = originalPrice - discountAmount;

        setCouponResult({
          type: 'discount',
          title: `🏷️ ${discountVal}% Discount Coupon Applied!`,
          message: `Coupon '${cleanCode}' is valid! Standard Price: ₹${originalPrice} → Discounted Price: ₹${finalPrice}.`,
          discount: discountVal,
          finalPrice,
          code: cleanCode
        });
      }
    } catch (err) {
      setCouponError(err.message || 'Failed to validate coupon code.');
    } finally {
      setCouponLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        <Link to="/home" className={styles.backBtn}>
          <ChevronLeft size={18} /> Back
        </Link>

        {isSubscribed && (
          <div className={styles.alreadyCard} style={{ marginBottom: 24 }}>
            <div className={styles.alreadyIcon}><CheckCircle size={44} color="#10B981" /></div>
            <h2 className={styles.alreadyTitle}>You're All Set! 🎉</h2>
            <p className={styles.alreadySub}>
              You currently have full premium access to all SAMU MCQs content.
              {subscription?.end_date && (
                <span style={{ display: 'block', marginTop: 4, fontWeight: 700, color: '#0F4C75' }}>
                  Valid until: {new Date(subscription.end_date).toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
        )}

        {/* ── Coupon Code Box (Available to both new and extending students) ── */}
        <div className={styles.couponCard}>
          <div className={styles.couponTop}>
            <div className={styles.couponIconBox}>
              <Ticket size={24} color="#0284C7" />
            </div>
            <div>
              <h3 className={styles.couponTitle}>Have a Coupon or Promo Code?</h3>
              <p className={styles.couponSub}>
                Enter code for instant free days premium access or a special subscription discount.
              </p>
            </div>
          </div>

          <form onSubmit={handleApplyCoupon} className={styles.couponForm}>
            <input
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
              placeholder="e.g. TRH100, SUMMER30, FREE7D..."
              className={styles.couponInput}
            />
            <button
              type="submit"
              disabled={couponLoading || !couponCode.trim()}
              className={styles.couponApplyBtn}
            >
              {couponLoading ? (
                <>
                  <Loader2 size={16} className={styles.spin} />
                  <span>Checking...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Redeem Coupon</span>
                </>
              )}
            </button>
          </form>
          <div style={{ marginTop: 8, fontSize: 12, color: '#64748B', fontWeight: 600 }}>
            🔒 Note: Each coupon code can only be used once per account.
          </div>

          {couponError && (
            <div className={styles.couponErrorBox}>
              <AlertCircle size={16} />
              <span>{couponError}</span>
            </div>
          )}

          {couponResult && (
            <div className={couponResult.type === 'free' ? styles.couponSuccessBox : styles.couponDiscountBox}>
              {couponResult.type === 'free' ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Gift size={24} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 900, color: '#065F46', margin: 0 }}>
                      {couponResult.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#047857', margin: '4px 0 0', fontWeight: 600 }}>
                      {couponResult.message}
                    </p>
                    <div style={{ marginTop: 6, fontSize: 12, fontWeight: 700, color: '#065F46' }}>
                      📅 Subscription Valid Until: {couponResult.endDate}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <Percent size={24} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <h4 style={{ fontSize: 15, fontWeight: 900, color: '#1E40AF', margin: 0 }}>
                      {couponResult.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#1E3A8A', margin: '4px 0 0', fontWeight: 600 }}>
                      {couponResult.message}
                    </p>
                    <a
                      href={`https://t.me/mrx4u?text=Hi%2C%20I%20have%20coupon%20${couponResult.code}%20for%20${couponResult.discount}%25%20discount.%20Please%20activate%20my%20subscription.`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.discountTelegramBtn}
                    >
                      <MessageCircle size={15} />
                      Complete at ₹{couponResult.finalPrice} on Telegram →
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isSubscribed && (
          <>
            {/* ── Hero ── */}
            <div className={styles.hero}>
              <div className={styles.heroBg} />
              <div className={styles.heroBadge}><Star size={13} color="#F59E0B" fill="#F59E0B" /> Trusted by 1,200+ SAMU Students</div>
              <div className={styles.crownWrap}><Crown size={52} color="#FBBF24" /></div>
              <h1 className={styles.heroTitle}>Unlock Premium Access</h1>
              <p className={styles.heroSub}>
                Get unlimited access to all SAMU MCQ content — every course, every subject, every topic.
              </p>
            </div>

            {/* ── Features ── */}
            <div className={styles.card}>
              <div className={styles.cardLabel}>✦ WHAT'S INCLUDED</div>
              <div className={styles.featuresList}>
                {FEATURES.map((f, i) => (
                  <div key={i} className={styles.featureRow}>
                    <div className={styles.featureIcon} style={{ background: f.bg }}>
                      <f.icon size={16} color={f.color} />
                    </div>
                    <span className={styles.featureText}>{f.text}</span>
                    <CheckCircle size={16} color="#10B981" fill="#10B981" style={{ flexShrink: 0 }} />
                  </div>
                ))}
              </div>
            </div>

            {/* ── Testimonials ── */}
            <div className={styles.testimonialsRow}>
              {TESTIMONIALS.map(t => (
                <div key={t.name} className={styles.testimonialCard}>
                  <div className={styles.testimonialStars}>
                    {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={12} color="#F59E0B" fill="#F59E0B" />)}
                  </div>
                  <p className={styles.testimonialText}>"{t.text}"</p>
                  <div className={styles.testimonialAuthor}><strong>{t.name}</strong> · {t.course}</div>
                </div>
              ))}
            </div>

            {/* ── CTA ── */}
            <div className={styles.ctaCard}>
              <div className={styles.ctaLeft}>
                <div className={styles.ctaIcon}><MessageCircle size={32} color="#0088cc" /></div>
                <div>
                  <h3 className={styles.ctaTitle}>How to Subscribe</h3>
                  <p className={styles.ctaDesc}>
                    Contact us on Telegram — we'll activate your subscription instantly. Affordable pricing for SAMU students.
                  </p>
                  <div className={styles.ctaTags}>
                    <span className={styles.ctaTag}>⚡ Instant Activation</span>
                    <span className={styles.ctaTag}>🔒 Secure</span>
                    <span className={styles.ctaTag}>💬 24/7 Support</span>
                  </div>
                </div>
              </div>
              <a
                href="https://t.me/mrx4u"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.telegramBtn}
              >
                <MessageCircle size={20} />
                Contact on Telegram
                <ArrowRight size={16} />
              </a>
            </div>

            <p className={styles.footNote}>
              Have questions? Join our <a href="https://t.me/samu_mcqs" target="_blank" rel="noopener noreferrer">Telegram community</a> with 1,200+ students.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
