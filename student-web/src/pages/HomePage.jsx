import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import {
  Flame, Trophy, Target, BookOpen, Brain, Swords, BarChart2,
  Stethoscope, Bell, Gift, Bookmark, Globe, ChevronRight,
  Zap, Star, TrendingUp, Clock, Lock, Unlock, Sparkles, Crown,
  MessageCircle, Search, Mic, Users, Award, ChevronLeft, ArrowRight,
  Send, X, Bot
} from 'lucide-react';
import styles from './HomePage.module.css';

/* ── Constants ───────────────────────────────────────── */
const COURSE_THEMES = [
  {
    num: '1',
    year: 'YEAR 1',
    subtitle: 'Pre-Clinical & Anatomy',
    icon: '🫀',
    gradient: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
    bgGradient: 'linear-gradient(135deg, #F0F7FF 0%, #FFFFFF 100%)',
    borderColor: '#BFDBFE',
    hoverBorder: '#2563EB',
    glowColor: 'rgba(37, 99, 235, 0.25)',
    accent: '#2563EB',
    pillBg: '#DBEAFE',
    pillText: '#1E40AF',
  },
  {
    num: '2',
    year: 'YEAR 2',
    subtitle: 'Physiology & Histology',
    icon: '🔬',
    gradient: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #38BDF8 100%)',
    bgGradient: 'linear-gradient(135deg, #F0F9FF 0%, #FFFFFF 100%)',
    borderColor: '#BAE6FD',
    hoverBorder: '#0284C7',
    glowColor: 'rgba(2, 132, 199, 0.25)',
    accent: '#0284C7',
    pillBg: '#E0F2FE',
    pillText: '#0369A1',
  },
  {
    num: '3',
    year: 'YEAR 3',
    subtitle: 'Pathology & Pharmacology',
    icon: '🦴',
    gradient: 'linear-gradient(135deg, #047857 0%, #059669 50%, #10B981 100%)',
    bgGradient: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 100%)',
    borderColor: '#BBF7D0',
    hoverBorder: '#059669',
    glowColor: 'rgba(5, 150, 105, 0.25)',
    accent: '#059669',
    pillBg: '#DCFCE7',
    pillText: '#166534',
  },
  {
    num: '4',
    year: 'YEAR 4',
    subtitle: 'Internal Medicine & Surgery I',
    icon: '💊',
    gradient: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #F59E0B 100%)',
    bgGradient: 'linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)',
    borderColor: '#FDE68A',
    hoverBorder: '#D97706',
    glowColor: 'rgba(217, 119, 6, 0.25)',
    accent: '#D97706',
    pillBg: '#FEF3C7',
    pillText: '#92400E',
  },
  {
    num: '5',
    year: 'YEAR 5',
    subtitle: 'Specialties, Pediatrics & OB-GYN',
    icon: '🧠',
    gradient: 'linear-gradient(135deg, #BE123C 0%, #E11D48 50%, #F43F5E 100%)',
    bgGradient: 'linear-gradient(135deg, #FFF1F2 0%, #FFFFFF 100%)',
    borderColor: '#FECDD3',
    hoverBorder: '#E11D48',
    glowColor: 'rgba(225, 29, 72, 0.25)',
    accent: '#E11D48',
    pillBg: '#FFE4E6',
    pillText: '#9F1239',
  },
  {
    num: '6',
    year: 'YEAR 6',
    subtitle: 'Clinical Practice & State Licensing',
    icon: '🦠',
    gradient: 'linear-gradient(135deg, #6D28D9 0%, #7C3AED 50%, #8B5CF6 100%)',
    bgGradient: 'linear-gradient(135deg, #F5F3FF 0%, #FFFFFF 100%)',
    borderColor: '#DDD6FE',
    hoverBorder: '#7C3AED',
    glowColor: 'rgba(124, 58, 237, 0.25)',
    accent: '#7C3AED',
    pillBg: '#EDE9FE',
    pillText: '#5B21B6',
  },
];
const COURSE_COLORS = COURSE_THEMES.map(t => t.gradient);
const COURSE_ICONS = COURSE_THEMES.map(t => t.icon);
const DEFAULT_COURSES = [
  { id:'1', title:'1st Course', num:'1', subjectCount:21 },
  { id:'2', title:'2nd Course', num:'2', subjectCount:24 },
  { id:'3', title:'3rd Course', num:'3', subjectCount:25 },
  { id:'4', title:'4th Course', num:'4', subjectCount:23 },
  { id:'5', title:'5th Course', num:'5', subjectCount:24 },
  { id:'6', title:'6th Course', num:'6', subjectCount:14 },
];

const HUB_ITEMS = [
  { icon:'🧠', label:'Ask AI',        to:'/ask-ai',      grad:'linear-gradient(135deg,#0F4C75,#0284C7)' },
  { icon:'⚔️', label:'Quiz Battle',   to:'/battle',      grad:'linear-gradient(135deg,#B45309,#F59E0B)' },
  { icon:'🏆', label:'Leaderboard',   to:'/leaderboard', grad:'linear-gradient(135deg,#047857,#10B981)' },
  { icon:'📊', label:'CBT Results',   to:'/results',     grad:'linear-gradient(135deg,#0E7490,#06B6D4)' },
  { icon:'🩺', label:'Diagnostics',   to:'/ask-ai',      grad:'linear-gradient(135deg,#0284C7,#38BDF8)' },
  { icon:'⭐', label:'Bookmarks',     to:'/profile',     grad:'linear-gradient(135deg,#B45309,#FBBF24)' },
  { icon:'🎁', label:'Rewards',       to:'/subscribe',   grad:'linear-gradient(135deg,#0284C7,#10B981)' },
  { icon:'📚', label:'Notes',         to:'/guidance',    grad:'linear-gradient(135deg,#065F46,#10B981)' },
  { icon:'🌐', label:'SSMU Website',  href:'https://ssmu.org', grad:'linear-gradient(135deg,#0F4C75,#1A6FA8)' },
  { icon:'💬', label:'Telegram',      href:'https://t.me/mrx4u', grad:'linear-gradient(135deg,#0284C7,#0EA5E9)' },
];

const BANNERS = [
  { emoji:'🔥', title:'FREE THIS MONTH', sub:'Use coupon TRH100 for 100% discount', grad:'linear-gradient(135deg,#0F4C75,#1A6FA8,#0284C7)' },
  { emoji:'📚', title:'New Questions Added', sub:'Microbiology & Pharmacology updated', grad:'linear-gradient(135deg,#0369A1,#0284C7,#38BDF8)' },
  { emoji:'🏆', title:'Monthly Winner Gets ₹49', sub:'Top ranker earns cashback reward', grad:'linear-gradient(135deg,#B45309,#D97706,#F59E0B)' },
  { emoji:'⚔️', title:'Quiz Battle Live Now', sub:'Challenge friends and climb the ranks', grad:'linear-gradient(135deg,#1E40AF,#2563EB,#38BDF8)' },
];

const UPDATES = [
  { icon:'🔬', text:'New Microbiology questions added', time:'2h ago' },
  { icon:'⚔️', text:'Quiz Battle: New room available', time:'5h ago' },
  { icon:'📊', text:'New CBT uploaded — Pharmacology', time:'1d ago' },
  { icon:'🏆', text:'Monthly leaderboard reset!', time:'2d ago' },
];

const WEEK_DAYS = ['S','M','T','W','T','F','S'];

/* ── Animated counter hook ───────────────────────────── */
function useCounter(target, duration = 1200) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!target) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) ref.current = requestAnimationFrame(tick);
    };
    ref.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
}

/* ── Main Component ──────────────────────────────────── */
export default function HomePage() {
  const { user, profile, isSubscribed, subscription } = useAuth();
  const navigate = useNavigate();

  /* State */
  const [courses, setCourses]   = useState(DEFAULT_COURSES);
  const [streak, setStreak]     = useState(0);
  const [rank, setRank]         = useState(null);
  const [points, setPoints]     = useState(0);
  const [topThree, setTopThree] = useState([]);
  const [bannerIdx, setBannerIdx] = useState(0);
  const [dailyGoal]             = useState({ done: 35, target: 50 });
  const [studyTime]             = useState({ done: 42, target: 60 });

  // Coupons, Promo Running Line & Pop-up Modal State
  const [activeCoupons, setActiveCoupons] = useState([]);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showLoginNotification, setShowLoginNotification] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your SAMU AI study assistant. Ask me anything about your medical courses!' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatMessagesEndRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

  const scrollToChatBottom = () => {
    chatMessagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isChatOpen) {
      scrollToChatBottom();
    }
  }, [chatMessages, isChatOpen]);

  const handleSendChatMessage = async (textToSend) => {
    const text = textToSend || chatInput;
    if (!text.trim() || chatLoading) return;

    setChatMessages(prev => [...prev, { role: 'user', content: text }]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: text,
          language: 'English'
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response || data.reply || data.answer || "I'm sorry, I couldn't get a response."
      }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Make sure your backend server is running.`
      }]);
    } finally {
      setChatLoading(false);
    }
  };

  /* Animated counters */
  const animPoints  = useCounter(points);
  const animStreak  = useCounter(streak);

  /* Time-based greeting */
  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Good Night' : hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const greetEmoji = hour < 12 ? '☀️' : hour < 17 ? '🌤️' : '🌙';
  const name = profile?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Scholar';

  /* Subscription days left */
  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000))
    : 0;

  /* Accuracy derived from points (demo) */
  const accuracy = points > 0 ? Math.min(98, Math.round(72 + (points / 1000))) : 0;

  /* Course click */
  function handleCourseClick(course) {
    if (!isSubscribed) { navigate('/subscribe'); return; }
    navigate(`/course/${course.id}`, { state: { title: course.title, num: course.num } });
  }

  /* Data fetching */
  useEffect(() => {
    // Courses
    fetch('https://samu-mcqs.onrender.com/api/courses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data.slice(0, 6).map((c, i) => ({
            id: c._id, title: c.title, num: String(i + 1), subjectCount: c.subjectCount || 0,
          })));
        }
      }).catch(() => {});

    if (user) {
      // Streak
      supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setStreak(data.current_streak || 0); });

      // Rank + Points from leaderboard
      supabase.from('leaderboard_monthly').select('rank,total_points').eq('user_id', user.id).maybeSingle()
        .then(({ data }) => {
          if (data) { setRank(data.rank); setPoints(data.total_points || 0); }
        });
    }

    // Top 3 leaderboard
    supabase.from('leaderboard_monthly')
      .select('rank,total_points,profiles(full_name)')
      .order('rank', { ascending: true }).limit(3)
      .then(({ data }) => { if (data) setTopThree(data); });
  }, [user]);

  /* Banner auto-rotate */
  useEffect(() => {
    const t = setInterval(() => setBannerIdx(i => (i + 1) % BANNERS.length), 4000);
    return () => clearInterval(t);
  }, []);

  /* Load active coupons for running line & pop-up modal */
  useEffect(() => {
    async function loadActiveCoupons() {
      try {
        const { data, error } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          const formatted = data.map(c => {
            const val = parseFloat(c.discount_percentage) || 0;
            const isDays = val < 0;
            const days = isDays ? Math.round(Math.abs(val)) : null;
            const is100 = val === 100;
            const benefit = isDays 
              ? `${days} Days Free Full Access` 
              : (is100 ? '100% Free Full Access' : `${val}% Discount`);
            return { ...c, benefit, isDays, days, is100, val };
          });
          setActiveCoupons(formatted);

          const newest = formatted[0];
          // Check if user dismissed pop-up modal for this coupon
          const dismissedModal = localStorage.getItem('samu_dismissed_coupon_' + newest.code);
          if (!dismissedModal) {
            setShowPromoModal(true);
          }

          // Check if user dismissed notification toast
          const dismissedToast = localStorage.getItem('samu_toast_dismissed_' + newest.code);
          if (user && !dismissedToast) {
            setShowLoginNotification(true);
          }
        }
      } catch (err) {
        console.error('Error fetching promo codes on HomePage:', err);
      }
    }
    loadActiveCoupons();
  }, [user]);

  const handleCopyCouponCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleDismissPromoModal = () => {
    if (activeCoupons[0]?.code) {
      localStorage.setItem('samu_dismissed_coupon_' + activeCoupons[0].code, 'true');
    }
    setShowPromoModal(false);
  };

  const latestCoupon = activeCoupons[0] || null;

  /* Streak calendar — last 7 days */
  const today = new Date();
  const weekDots = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (6 - i));
    return { day: WEEK_DAYS[d.getDay()], active: i < streak && streak > 0 };
  });

  /* Level system */
  const level = points < 500 ? { num:1, title:'Intern', next:500 }
    : points < 1500 ? { num:2, title:'Resident', next:1500 }
    : points < 3000 ? { num:3, title:'Specialist', next:3000 }
    : points < 6000 ? { num:4, title:'Consultant', next:6000 }
    : { num:5, title:'Professor', next:null };

  const levelPct = level.next ? Math.min(100, Math.round((points / level.next) * 100)) : 100;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        {/* ═══ PROMO TICKER (RUNNING LINE) ═══════════════ */}
        {activeCoupons.length > 0 && (
          <div 
            className={styles.runningTickerWrap}
            onClick={() => navigate(`/subscribe?code=${activeCoupons[0].code}`)}
            title="Click to redeem coupon code"
          >
            <div className={styles.tickerBadge}>
              <Flame size={14} className={styles.tickerFlame} />
              <span>LIVE OFFER</span>
            </div>
            <div className={styles.tickerTrack}>
              <div className={styles.tickerContent}>
                {activeCoupons.map((c, i) => (
                  <span key={i} className={styles.tickerItem}>
                    🎉 SPECIAL PROMO: Use code <span className={styles.tickerCode}>{c.code}</span> for <strong>{c.benefit}</strong>! (1-time use/account) • Click to Claim Now → &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))}
              </div>
              <div className={styles.tickerContent} aria-hidden="true">
                {activeCoupons.map((c, i) => (
                  <span key={`dup-${i}`} className={styles.tickerItem}>
                    🎉 SPECIAL PROMO: Use code <span className={styles.tickerCode}>{c.code}</span> for <strong>{c.benefit}</strong>! (1-time use/account) • Click to Claim Now → &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ═══ SECTION 1 — HERO ══════════════════════════ */}
        <div className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroOrb1} />
          <div className={styles.heroOrb2} />

          <div className={styles.heroContent}>
            <p className={styles.heroGreeting}>{greetEmoji} {greeting}, {name}!</p>
            <h1 className={styles.heroTitle}>Your Medical Journey</h1>
            <p className={styles.heroSub}>Keep practicing — every MCQ brings you closer to excellence.</p>
          </div>

          <div className={styles.heroBadges}>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeIcon}>🔥</span>
              <div>
                <div className={styles.heroBadgeVal}>{animStreak}</div>
                <div className={styles.heroBadgeLabel}>Day Streak</div>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeIcon}>🏆</span>
              <div>
                <div className={styles.heroBadgeVal}>{rank ? `#${rank}` : '—'}</div>
                <div className={styles.heroBadgeLabel}>Global Rank</div>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeIcon}>📚</span>
              <div>
                <div className={styles.heroBadgeVal}>{animPoints.toLocaleString()}</div>
                <div className={styles.heroBadgeLabel}>Points</div>
              </div>
            </div>
            <div className={styles.heroBadge}>
              <span className={styles.heroBadgeIcon}>🎯</span>
              <div>
                <div className={styles.heroBadgeVal}>{accuracy}%</div>
                <div className={styles.heroBadgeLabel}>Accuracy</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ BANNER CAROUSEL ═══════════════════════════ */}
        <div className={styles.bannerWrap}>
          {BANNERS.map((b, i) => (
            <div
              key={i}
              className={`${styles.banner} ${i === bannerIdx ? styles.bannerActive : ''}`}
              style={{ background: b.grad }}
            >
              <span className={styles.bannerEmoji}>{b.emoji}</span>
              <div className={styles.bannerText}>
                <div className={styles.bannerTitle}>{b.title}</div>
                <div className={styles.bannerSub}>{b.sub}</div>
              </div>
              {i === 0 && <span className={styles.couponBadge}>TRH100</span>}
            </div>
          ))}
          <div className={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <button key={i} className={`${styles.bannerDot} ${i === bannerIdx ? styles.bannerDotActive : ''}`}
                onClick={() => setBannerIdx(i)} />
            ))}
          </div>
        </div>

        {/* ═══ SECTION 2 — QUICK STATS GRID ══════════════ */}
        <div className={styles.statsGrid}>
          {[
            { icon:'📚', label:'Points',    val: animPoints.toLocaleString(), col:'#3B82F6', glow:'rgba(59,130,246,0.2)' },
            { icon:'🎯', label:'Accuracy',  val: `${accuracy}%`,              col:'#10B981', glow:'rgba(16,185,129,0.2)' },
            { icon:'🏆', label:'Rank',      val: rank ? `#${rank}` : '—',    col:'#FBBF24', glow:'rgba(251,191,36,0.2)' },
            { icon:'🔥', label:'Streak',    val: `${animStreak}d`,            col:'#F43F5E', glow:'rgba(244,63,94,0.2)'  },
          ].map(s => (
            <div key={s.label} className={styles.statCard} style={{ '--glow':s.glow }}>
              <div className={styles.statIcon}>{s.icon}</div>
              <div className={styles.statVal} style={{ color: s.col }}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ═══ SECTION 3 — LEVEL PROGRESS ════════════════ */}
        <div className={styles.levelCard}>
          <div className={styles.levelLeft}>
            <div className={styles.levelBadge}>Lv.{level.num}</div>
            <div>
              <div className={styles.levelTitle}>{level.title}</div>
              <div className={styles.levelSub}>
                {level.next ? `${points} / ${level.next} pts to next level` : 'Max Level Reached!'}
              </div>
            </div>
          </div>
          <div className={styles.levelBarWrap}>
            <div className={styles.levelBar}>
              <div className={styles.levelBarFill} style={{ width: `${levelPct}%` }} />
            </div>
            <div className={styles.levelPct}>{levelPct}%</div>
          </div>
        </div>

        {/* ═══ SECTION 4 — DAILY GOAL ═════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">TODAY'S TARGETS</span>
        </div>
        <div className={styles.goalsRow}>
          <div className={styles.goalCard}>
            <div className={styles.goalTop}>
              <Target size={18} color="#0284C7" />
              <span className={styles.goalTitle}>Questions Goal</span>
            </div>
            <div className={styles.goalNums}>
              <span className={styles.goalDone}>{dailyGoal.done}</span>
              <span className={styles.goalSep}>/ {dailyGoal.target}</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${(dailyGoal.done / dailyGoal.target) * 100}%`, background: 'linear-gradient(90deg, #0284C7, #38BDF8)' }} />
            </div>
          </div>
          <div className={styles.goalCard}>
            <div className={styles.goalTop}>
              <Clock size={18} color="#10B981" />
              <span className={styles.goalTitle}>Study Time</span>
            </div>
            <div className={styles.goalNums}>
              <span className={styles.goalDone}>{studyTime.done}</span>
              <span className={styles.goalSep}>/ {studyTime.target} min</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${(studyTime.done / studyTime.target) * 100}%`, background:'linear-gradient(90deg,#047857,#10B981)' }} />
            </div>
          </div>
        </div>

        {/* ═══ SECTION 5 — SEARCH BAR ══════════════════════ */}
        <div className={styles.searchWrap}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search subjects, topics, MCQs, lab tests…"
            onClick={() => navigate('/ask-ai')}
            readOnly
          />
          <button className={styles.micBtn}><Mic size={16} /></button>
        </div>

        {/* ═══ COURSES ════════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">COURSES</span>
          <span className={styles.sectionSub}>{isSubscribed ? '✓ Full Access' : '🔒 Subscribe to Unlock'}</span>
        </div>
        {!isSubscribed && (
          <div className={styles.subBanner}>
            <div className={styles.subBannerLeft}>
              <Crown size={20} color="#FBBF24" />
              <div>
                <div className={styles.subBannerTitle}>Unlock All 6 Courses</div>
                <div className={styles.subBannerSub}>Thousands of MCQs, situational tasks & more</div>
              </div>
            </div>
            <Link to="/subscribe" className="btn btn-primary" style={{ fontSize:13, padding:'10px 18px', flexShrink:0 }}>Subscribe</Link>
          </div>
        )}
        {isSubscribed && daysLeft > 0 && daysLeft <= 7 && (
          <div className={styles.warnBanner}>⚠️ Subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong></div>
        )}
        <div className={styles.coursesGrid}>
          {courses.map((c, i) => {
            const theme = COURSE_THEMES[i % COURSE_THEMES.length];
            return (
              <button
                key={c.id}
                className={styles.courseCard}
                onClick={() => handleCourseClick(c)}
                style={{
                  '--course-accent': theme.accent,
                  '--course-border': theme.borderColor,
                  '--course-border-hover': theme.hoverBorder,
                  '--course-glow': theme.glowColor,
                  '--course-bg': theme.bgGradient,
                }}
              >
                <div className={styles.courseCardShine} />
                
                <div className={styles.courseIconBox} style={{ background: theme.gradient, boxShadow: `0 8px 20px -3px ${theme.glowColor}` }}>
                  <span className={styles.courseEmoji}>{theme.icon}</span>
                  <div className={styles.courseLockBadge}>
                    {isSubscribed
                      ? <Unlock size={10} color="#FFFFFF" strokeWidth={2.8} />
                      : <Lock size={10} color="rgba(255,255,255,0.9)" strokeWidth={2.8} />}
                  </div>
                </div>

                <div className={styles.courseInfo}>
                  <div className={styles.courseHeaderRow}>
                    <span className={styles.courseYearTag} style={{ background: theme.pillBg, color: theme.pillText }}>
                      {theme.year}
                    </span>
                    <span className={styles.courseAccessBadge} style={{ color: isSubscribed ? '#059669' : '#64748B' }}>
                      {isSubscribed ? '✓ Full Access' : '🔒 Locked'}
                    </span>
                  </div>
                  <div className={styles.courseTitle}>{c.title}</div>
                  <div className={styles.courseMetaRow}>
                    <span className={styles.courseMetaCount}>
                      <BookOpen size={13} strokeWidth={2.2} />
                      {c.subjectCount} Subjects
                    </span>
                    <span className={styles.courseDot}>•</span>
                    <span className={styles.courseSubtitle}>{theme.subtitle}</span>
                  </div>
                </div>

                <div className={styles.courseActionWrap}>
                  <div className={styles.courseActionBtn}>
                    <ChevronRight size={17} strokeWidth={2.4} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* ═══ AI INSIGHTS ════════════════════════════════ */}
        <div className={styles.aiInsightCard}>
          <div className={styles.aiIconWrap}>
            <Brain size={24} color="#fff" />
          </div>
          <div className={styles.aiContent}>
            <div className={styles.aiTitle}>
              <Sparkles size={14} color="#0284C7" /> AI Study Insight
            </div>
            <div className={styles.aiText}>
              You're doing great in Anatomy (85% accuracy), but Pharmacology scores have dropped recently. Consider focusing your next session on "Autonomic Nervous System Drugs".
            </div>
            <div className={styles.aiAction} onClick={() => navigate('/ask-ai')}>
              Generate Custom Quiz <ArrowRight size={14} />
            </div>
          </div>
        </div>

        {/* ═══ SUBJECT MASTERY ════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">SUBJECT MASTERY</span>
        </div>
        <div className={styles.masteryCard}>
          {[
            { label: 'Anatomy', pct: 85, color: '#10B981' },
            { label: 'Microbiology', pct: 65, color: '#0284C7' },
            { label: 'Pharmacology', pct: 40, color: '#EF4444' }
          ].map(m => (
            <div key={m.label} className={styles.masteryItem}>
              <div className={styles.masteryHeader}>
                <span className={styles.masteryLabel}>{m.label}</span>
                <span className={styles.masteryVal} style={{ color: m.color }}>{m.pct}%</span>
              </div>
              <div className={styles.masteryBarWrap}>
                <div className={styles.masteryBarFill} style={{ width: `${m.pct}%`, background: m.color }} />
              </div>
            </div>
          ))}
        </div>

        {/* ═══ RECENT ACTIVITY & UPCOMING ═════════════════ */}
        <div className={styles.goalsRow} style={{ gridTemplateColumns: '1fr', gap: '0' }}>
          <div>
            <div className={styles.sectionHeader}>
              <span className="section-label">UPCOMING</span>
            </div>
            <div className={styles.tasksGrid}>
              <div className={styles.taskItem}>
                <div className={styles.taskLeft}>
                  <div className={styles.taskIcon} style={{ background: '#fef3c7' }}><Clock size={18} color="#d97706" /></div>
                  <div>
                    <div className={styles.taskTitle}>Physiology CBT Mock</div>
                    <div className={styles.taskTime}>Tomorrow, 10:00 AM</div>
                  </div>
                </div>
                <button className={styles.taskBtn}>Join</button>
              </div>
              <div className={styles.taskItem}>
                <div className={styles.taskLeft}>
                  <div className={styles.taskIcon} style={{ background: '#E0F2FE' }}><Target size={18} color="#0284C7" /></div>
                  <div>
                    <div className={styles.taskTitle}>Daily Goal: 50 MCQs</div>
                    <div className={styles.taskTime}>15 remaining</div>
                  </div>
                </div>
                <button className={styles.taskBtn}>Resume</button>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 8 }}>
            <div className={styles.sectionHeader}>
              <span className="section-label">RECENT ACTIVITY</span>
            </div>
            <div className={styles.activityCard}>
              <div className={styles.activityItem}>
                <div className={styles.actIcon}><Trophy size={14} /></div>
                <div className={styles.actContent}>
                  <div className={styles.actTitle}>Quiz Battle won!</div>
                  <div className={styles.actMeta}>vs. JohnDoe • 2h ago</div>
                </div>
                <div className={styles.actScore}>+15 pts</div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.actIcon}><BookOpen size={14} /></div>
                <div className={styles.actContent}>
                  <div className={styles.actTitle}>Completed "Heart Failure"</div>
                  <div className={styles.actMeta}>Cardiology • Yesterday</div>
                </div>
                <div className={styles.actScore} style={{ color: '#0284C7' }}>88%</div>
              </div>
              <div className={styles.activityItem}>
                <div className={styles.actIcon}><Target size={14} /></div>
                <div className={styles.actContent}>
                  <div className={styles.actTitle}>Daily Streak 5 Days!</div>
                  <div className={styles.actMeta}>Bonus awarded • 2d ago</div>
                </div>
                <div className={styles.actScore} style={{ color: '#f59e0b' }}>+50 pts</div>
              </div>
            </div>
          </div>
        </div>

        {/* ═══ FEATURE HUB ════════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">FEATURE HUB</span>
        </div>
        <div className={styles.hubGrid}>
          {HUB_ITEMS.map(item => item.href ? (
            <a key={item.label} href={item.href} target="_blank" rel="noopener noreferrer" className={styles.hubItem}>
              <div className={styles.hubIcon} style={{ background: item.grad }}>{item.icon}</div>
              <span className={styles.hubLabel}>{item.label}</span>
            </a>
          ) : (
            <button key={item.label} className={styles.hubItem} onClick={() => navigate(item.to)}>
              <div className={styles.hubIcon} style={{ background: item.grad }}>{item.icon}</div>
              <span className={styles.hubLabel}>{item.label}</span>
            </button>
          ))}
        </div>

        {/* ═══ LEADERBOARD PREVIEW ═══════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">TOP PERFORMERS</span>
          <Link to="/leaderboard" className={styles.seeAll}>See All →</Link>
        </div>
        <div className={styles.lbCard}>
          <div className={styles.podium}>
            {topThree.length === 0 ? (
              <div className={styles.lbEmpty}>Loading rankings…</div>
            ) : (
              topThree.map((u, i) => {
                const medals = ['🥇','🥈','🥉'];
                const colors = ['#FBBF24','#94A3B8','#CD7F32'];
                const uname = u.profiles?.full_name || `Player ${i+1}`;
                return (
                  <div key={i} className={`${styles.podiumItem} ${i===0 ? styles.podiumFirst : ''}`}>
                    <div className={styles.podiumMedal}>{medals[i]}</div>
                    <div className={styles.podiumAvatar} style={{ background:`${colors[i]}22`, border:`2px solid ${colors[i]}` }}>
                      {uname[0]?.toUpperCase()}
                    </div>
                    <div className={styles.podiumName}>{uname.split(' ')[0]}</div>
                    <div className={styles.podiumPts} style={{ color: colors[i] }}>{u.total_points || 0}</div>
                  </div>
                );
              })
            )}
          </div>
          <Link to="/leaderboard" className={`btn btn-ghost ${styles.lbBtn}`}>
            <Trophy size={16} /> View Full Rankings
          </Link>
        </div>

        {/* ═══ STREAK TRACKER ════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">STUDY STREAK</span>
        </div>
        <div className={styles.streakCard}>
          <div className={styles.streakTop}>
            <div className={styles.streakFire}>🔥</div>
            <div>
              <div className={styles.streakNum}>{streak} Day{streak !== 1 ? 's' : ''}</div>
              <div className={styles.streakSub}>{streak > 0 ? 'Keep it going!' : 'Start your streak today!'}</div>
            </div>
          </div>
          <div className={styles.weekRow}>
            {weekDots.map((d, i) => (
              <div key={i} className={styles.weekItem}>
                <div className={`${styles.weekDot} ${d.active ? styles.weekDotActive : ''}`}>
                  {d.active ? '🔥' : ''}
                </div>
                <span className={styles.weekLabel}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ REWARDS CARD ═══════════════════════════════ */}
        <div className={styles.rewardsCard}>
          <div className={styles.rewardsLeft}>
            <div className={styles.rewardsTitle}>🪙 Rewards</div>
            <div className={styles.rewardsSub}>Monthly winner gets <strong>₹49 cashback</strong></div>
            <div className={styles.rewardsBadges}>
              <span className={styles.coinBadge}>🪙 {points} Coins</span>
              {rank && <span className={styles.rankBadge}>🏆 Rank #{rank}</span>}
            </div>
          </div>
          <div className={styles.rewardsTrophy}>🏆</div>
        </div>

        {/* ═══ UPDATES FEED ═══════════════════════════════ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">LATEST UPDATES</span>
        </div>
        <div className={styles.updatesCard}>
          {UPDATES.map((u, i) => (
            <div key={i} className={`${styles.updateRow} ${i < UPDATES.length - 1 ? styles.updateDivider : ''}`}>
              <span className={styles.updateIcon}>{u.icon}</span>
              <div className={styles.updateText}>{u.text}</div>
              <span className={styles.updateTime}>{u.time}</span>
            </div>
          ))}
        </div>

        {/* ═══ OFFER BANNER ════════════════════════════════ */}
        <div className={styles.offerBanner}>
          <div className={styles.offerLeft}>
            <div className={styles.offerTitle}>🎉 FREE THIS MONTH</div>
            <div className={styles.offerSub}>Use coupon at checkout</div>
            <div className={styles.couponBox}>TRH100</div>
          </div>
          <Link to="/subscribe" className={styles.offerBtn}>Claim Now →</Link>
        </div>

        <div style={{ height: 'calc(var(--nav-h) + 16px)' }} />
      </div>

      {/* ── Chatbot FAB & Panel ── */}
      <button className={styles.chatFab} onClick={() => setIsChatOpen(!isChatOpen)}>
        <MessageCircle size={24} />
      </button>

      {isChatOpen && (
        <div className={styles.chatPanel}>
          <div className={styles.chatHeader}>
            <div className={styles.chatHeaderLeft}>
              <Brain size={18} color="#fbbf24" />
              <div>
                <div className={styles.chatHeaderTitle}>SAMU AI Tutor</div>
                <div className={styles.chatHeaderSub}>Ask me anything</div>
              </div>
            </div>
            <button className={styles.chatClose} onClick={() => setIsChatOpen(false)}>
              <X size={16} />
            </button>
          </div>

          <div className={styles.chatMessages}>
            {chatMessages.map((msg, idx) => (
              <div key={idx} className={msg.role === 'user' ? styles.chatMsgUser : styles.chatMsgAI}>
                {msg.content}
              </div>
            ))}
            {chatLoading && (
              <div className={styles.chatTyping}>
                <div className={styles.chatDot} />
                <div className={styles.chatDot} />
                <div className={styles.chatDot} />
              </div>
            )}
            <div ref={chatMessagesEndRef} />
          </div>

          <div className={styles.chatPrompts}>
            {['Explain HOCM', 'Amoxicillin MOA', 'Dose of paracetamol', 'What is COPD?'].map(prompt => (
              <button 
                key={prompt} 
                className={styles.chatPromptChip}
                onClick={() => handleSendChatMessage(prompt)}
                disabled={chatLoading}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form 
            onSubmit={(e) => { e.preventDefault(); handleSendChatMessage(); }} 
            className={styles.chatInputArea}
          >
            <input
              type="text"
              className={styles.chatInput}
              placeholder="Type medical question..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              disabled={chatLoading}
            />
            <button 
              type="submit" 
              className={styles.chatSendBtn}
              disabled={chatLoading || !chatInput.trim()}
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}

      {/* ═══ PROMO POP-UP MODAL ══════════════════════ */}
      {showPromoModal && latestCoupon && (
        <div className={styles.modalOverlay} onClick={handleDismissPromoModal}>
          <div className={styles.promoModalCard} onClick={e => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={handleDismissPromoModal} title="Close">
              <X size={20} />
            </button>

            <div className={styles.promoModalIconBox}>
              <Gift size={36} color="#0284C7" />
            </div>

            <span className={styles.promoModalTag}>🎉 SPECIAL PROMO OFFER</span>
            <h2 className={styles.promoModalTitle}>Claim Your {latestCoupon.benefit}!</h2>
            <p className={styles.promoModalSub}>
              Special promotional offer for medical students! Unlock all 6 years curriculum, 8,000+ MCQs, clinical case tasks, and AI tutor.
            </p>

            <div className={styles.promoCodeBox}>
              <span className={styles.promoCodeText}>{latestCoupon.code}</span>
              <button 
                type="button"
                className={styles.promoCopyBtn}
                onClick={() => handleCopyCouponCode(latestCoupon.code)}
              >
                {copiedCode === latestCoupon.code ? '✓ Copied!' : 'Copy Code'}
              </button>
            </div>
            <div className={styles.promoRuleText}>
              🔒 Valid for 1-time redemption per student account.
            </div>

            <div className={styles.promoModalActions}>
              <button 
                className={styles.promoClaimBtn}
                onClick={() => {
                  setShowPromoModal(false);
                  navigate(`/subscribe?code=${latestCoupon.code}`);
                }}
              >
                Redeem Coupon Now →
              </button>
              <button 
                className={styles.promoDismissBtn}
                onClick={handleDismissPromoModal}
              >
                Don't show again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ FLOATING NOTIFICATION TOAST (LOGGED-IN USERS) ════════ */}
      {user && showLoginNotification && latestCoupon && (
        <div className={styles.floatingNotification}>
          <div className={styles.floatingNotifIcon}>
            <Gift size={20} color="#0284C7" />
          </div>
          <div className={styles.floatingNotifContent}>
            <div className={styles.floatingNotifTitle}>🎉 New Coupon Available!</div>
            <div className={styles.floatingNotifDesc}>
              Use code <strong>{latestCoupon.code}</strong> for {latestCoupon.benefit}! (1 use/account)
            </div>
            <div className={styles.floatingNotifBtns}>
              <button 
                className={styles.floatingNotifClaim}
                onClick={() => {
                  setShowLoginNotification(false);
                  navigate(`/subscribe?code=${latestCoupon.code}`);
                }}
              >
                Claim Now →
              </button>
            </div>
          </div>
          <button 
            className={styles.floatingNotifClose}
            onClick={() => {
              setShowLoginNotification(false);
              localStorage.setItem('samu_toast_dismissed_' + latestCoupon.code, 'true');
            }}
            title="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
