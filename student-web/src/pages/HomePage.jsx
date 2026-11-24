import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS } from '../data/index';
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

const NEW_HUB_ITEMS = [
  {
    id: 'ask-ai',
    label: 'Ask AI',
    sub: 'Medical AI Tutor',
    tag: 'LLAMA 3.3',
    to: '/ask-ai',
    icon: Bot,
    iconBg: 'linear-gradient(135deg, #4338CA 0%, #6366F1 50%, #06B6D4 100%)',
    glowColor: 'rgba(99, 102, 241, 0.45)',
    border: '#C7D2FE',
    hoverBorder: '#6366F1',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F5F7FF 100%)',
    tagBg: '#EEF2FF',
    tagColor: '#4338CA',
  },
  {
    id: 'battle',
    label: 'Quiz Battle',
    sub: 'Live 1v1 Arena',
    tag: 'PVP',
    to: '/battle',
    icon: Swords,
    iconBg: 'linear-gradient(135deg, #C2410C 0%, #EA580C 50%, #F59E0B 100%)',
    glowColor: 'rgba(234, 88, 12, 0.45)',
    border: '#FED7AA',
    hoverBorder: '#F97316',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF9F5 100%)',
    tagBg: '#FFF7ED',
    tagColor: '#C2410C',
  },
  {
    id: 'leaderboard',
    label: 'Leaderboard',
    sub: 'Top Students',
    tag: 'RANK #1',
    to: '/leaderboard',
    icon: Trophy,
    iconBg: 'linear-gradient(135deg, #047857 0%, #10B981 50%, #FBBF24 100%)',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    border: '#A7F3D0',
    hoverBorder: '#10B981',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F2FDF8 100%)',
    tagBg: '#ECFDF5',
    tagColor: '#047857',
  },
  {
    id: 'results',
    label: 'CBT Results',
    sub: 'Score & Analysis',
    tag: 'REPORTS',
    to: '/results',
    icon: BarChart2,
    iconBg: 'linear-gradient(135deg, #0369A1 0%, #0284C7 50%, #38BDF8 100%)',
    glowColor: 'rgba(2, 132, 199, 0.45)',
    border: '#BAE6FD',
    hoverBorder: '#0284C7',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
    tagBg: '#E0F2FE',
    tagColor: '#0369A1',
  },
  {
    id: 'diagnostics',
    label: 'Diagnostics',
    sub: 'Clinical Cases',
    tag: 'CLINICAL',
    to: '/clinical-case',
    icon: Stethoscope,
    iconBg: 'linear-gradient(135deg, #0F766E 0%, #14B8A6 50%, #2DD4BF 100%)',
    glowColor: 'rgba(20, 184, 166, 0.45)',
    border: '#99F6E4',
    hoverBorder: '#14B8A6',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0FDFA 100%)',
    tagBg: '#CCFBF1',
    tagColor: '#0F766E',
  },
  {
    id: 'bookmarks',
    label: 'Bookmarks',
    sub: 'Saved Vault',
    tag: 'SAVED',
    to: '/profile',
    icon: Star,
    iconBg: 'linear-gradient(135deg, #B45309 0%, #D97706 50%, #FBBF24 100%)',
    glowColor: 'rgba(217, 119, 6, 0.45)',
    border: '#FDE68A',
    hoverBorder: '#F59E0B',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)',
    tagBg: '#FEF3C7',
    tagColor: '#B45309',
  },
  {
    id: 'rewards',
    label: 'Rewards',
    sub: 'Coupons & Cash',
    tag: 'SPECIAL',
    to: '/subscribe',
    icon: Gift,
    iconBg: 'linear-gradient(135deg, #BE123C 0%, #E11D48 50%, #FB7185 100%)',
    glowColor: 'rgba(225, 29, 72, 0.45)',
    border: '#FECDD3',
    hoverBorder: '#F43F5E',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #FFF5F7 100%)',
    tagBg: '#FFE4E6',
    tagColor: '#BE123C',
  },
  {
    id: 'notes',
    label: 'Study Notes',
    sub: 'High-Yield Guides',
    tag: 'GUIDES',
    to: '/guidance',
    icon: BookOpen,
    iconBg: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 50%, #60A5FA 100%)',
    glowColor: 'rgba(37, 99, 235, 0.45)',
    border: '#BFDBFE',
    hoverBorder: '#3B82F6',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F4F8FF 100%)',
    tagBg: '#DBEAFE',
    tagColor: '#1D4ED8',
  },
  {
    id: 'ssmu',
    label: 'SSMU Portal',
    sub: 'University Site',
    tag: 'CAMPUS',
    href: 'https://ssmu.org',
    icon: Globe,
    iconBg: 'linear-gradient(135deg, #0F4C75 0%, #1A6FA8 50%, #1E40AF 100%)',
    glowColor: 'rgba(15, 76, 117, 0.45)',
    border: '#CBD5E1',
    hoverBorder: '#0F4C75',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%)',
    tagBg: '#E2E8F0',
    tagColor: '#0F4C75',
  },
  {
    id: 'telegram',
    label: 'Telegram',
    sub: 'Community Group',
    tag: 'CHANNEL',
    href: 'https://t.me/mrx4u',
    icon: Send,
    iconBg: 'linear-gradient(135deg, #0077B5 0%, #0088CC 50%, #38BDF8 100%)',
    glowColor: 'rgba(0, 136, 204, 0.45)',
    border: '#BAE6FD',
    hoverBorder: '#0088CC',
    cardBg: 'linear-gradient(180deg, #FFFFFF 0%, #F0F9FF 100%)',
    tagBg: '#E0F2FE',
    tagColor: '#0077B5',
  },
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

  // Live Subject Search & Speech Recognition State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [allSubjectsList, setAllSubjectsList] = useState(ALL_SUBJECTS);
  const searchWrapRef = useRef(null);

  // Load live curriculum subjects from Supabase to merge with static list
  useEffect(() => {
    supabase
      .from('subjects')
      .select('id, title, course_id, courses(id, title)')
      .not('title', 'ilike', '[BIN]%')
      .then(({ data }) => {
        if (data && data.length > 0) {
          const supaList = data.map(s => {
            const courseTitle = s.courses?.title || 'Course';
            const courseNum = courseTitle.match(/\d/)?.[0] || '1';
            return {
              id: s.id,
              title: s.title,
              course: courseTitle,
              courseId: s.course_id,
              courseNum,
            };
          });
          setAllSubjectsList(prev => {
            const map = new Map();
            prev.forEach(item => map.set(item.title.toLowerCase().trim(), item));
            supaList.forEach(item => map.set(item.title.toLowerCase().trim(), item));
            return Array.from(map.values());
          });
        }
      })
      .catch(() => {});
  }, []);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Voice Search Handler
  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser. Please type to search.");
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      setIsListening(true);
      recognition.onresult = (e) => {
        const text = e.results[0][0].transcript;
        setSearchQuery(text);
        setIsSearchFocused(true);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  // Filtered search results
  const searchResults = searchQuery.trim().length > 0
    ? allSubjectsList.filter(s =>
        s.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
        s.course.toLowerCase().includes(searchQuery.toLowerCase().trim())
      ).slice(0, 8)
    : [];

  const handleSelectSubject = (s) => {
    setIsSearchFocused(false);
    setSearchQuery('');
    navigate(`/subject/${s.id}`, {
      state: {
        title: s.title,
        courseId: s.courseId || s.courseNum || '1',
        courseNum: s.courseNum || s.courseId || '1',
      }
    });
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      if (searchResults.length > 0) {
        handleSelectSubject(searchResults[0]);
      } else if (searchQuery.trim()) {
        navigate('/ask-ai', { state: { initialPrompt: searchQuery } });
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
    }
  };

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

        
        {/* ═══ FUNCTIONAL SEARCH BAR WITH LIVE SUBJECT AUTOCOMPLETE ═══ */}
        <div className={styles.searchWrap} ref={searchWrapRef}>
          <Search size={18} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search subjects, topics, or MCQs (e.g. Anatomy, Pharmacology)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {searchQuery && (
            <button
              type="button"
              className={styles.clearSearchBtn}
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              title="Clear search"
            >
              <X size={15} />
            </button>
          )}
          <button
            type="button"
            className={`${styles.micBtn} ${isListening ? styles.micBtnActive : ''}`}
            onClick={handleVoiceSearch}
            title={isListening ? "Listening..." : "Voice Search"}
          >
            <Mic size={17} />
          </button>

          {/* Instant Search Results Dropdown */}
          {isSearchFocused && searchQuery.trim().length > 0 && (
            <div className={styles.searchDropdown}>
              <div className={styles.searchDropdownHeader}>
                <span>Matching Subjects ({searchResults.length})</span>
                <span style={{ fontSize: 10, color: '#94A3B8' }}>Press Enter to Open</span>
              </div>

              {searchResults.length > 0 ? (
                <div className={styles.searchResultsList}>
                  {searchResults.map((s, idx) => {
                    const cNum = s.courseNum || s.course?.match(/\d/)?.[0] || '1';
                    const theme = COURSE_THEMES[(parseInt(cNum) - 1) % COURSE_THEMES.length];
                    return (
                      <div
                        key={s.id || idx}
                        className={styles.searchResultItem}
                        onClick={() => handleSelectSubject(s)}
                      >
                        <div
                          className={styles.searchResultIconBox}
                          style={{ background: theme?.gradient || 'linear-gradient(135deg, #1E40AF, #3B82F6)' }}
                        >
                          <BookOpen size={16} color="#FFFFFF" strokeWidth={2.2} />
                        </div>
                        <div className={styles.searchResultInfo}>
                          <div className={styles.searchResultTitle}>{s.title}</div>
                          <div className={styles.searchResultSub}>
                            <span
                              className={styles.searchResultCourseTag}
                              style={{ background: theme?.pillBg || '#DBEAFE', color: theme?.pillText || '#1E40AF' }}
                            >
                              {s.course || `${cNum} Course`}
                            </span>
                            <span> • Tap to open subject & MCQs</span>
                          </div>
                        </div>
                        <ChevronRight size={16} color="#94A3B8" />
                      </div>
                    );
                  })}

                  <div
                    className={styles.searchAskAiFooter}
                    onClick={() => {
                      setIsSearchFocused(false);
                      navigate('/ask-ai', { state: { initialPrompt: searchQuery } });
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Brain size={16} color="#4F46E5" />
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: '#312E81' }}>
                        Ask SAMU AI about "{searchQuery}"
                      </span>
                    </div>
                    <ArrowRight size={14} color="#4F46E5" />
                  </div>
                </div>
              ) : (
                <div className={styles.searchEmptyState}>
                  <p style={{ margin: '0 0 10px', fontSize: 13, color: '#64748B' }}>
                    No subjects directly matching <strong>"{searchQuery}"</strong>
                  </p>
                  <button
                    type="button"
                    className="btn btn-primary"
                    style={{ fontSize: 12.5, padding: '7px 14px', borderRadius: 10, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    onClick={() => {
                      setIsSearchFocused(false);
                      navigate('/ask-ai', { state: { initialPrompt: searchQuery } });
                    }}
                  >
                    <Brain size={14} /> Ask SAMU AI Medical Tutor
                  </button>
                </div>
              )}
            </div>
          )}
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

        {/* ═══ FEATURE HUB (JUST BELOW COURSES TABS • ENLARGED BANANA AI STYLE) ═══ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">FEATURE HUB</span>
          <span className={styles.sectionSub}>Quick Clinical Access</span>
        </div>
        <div className={styles.newHubGrid}>
          {NEW_HUB_ITEMS.map(item => {
            const IconComp = item.icon;
            const cardContent = (
              <>
                <div className={styles.newHubCardShine} />
                <div className={styles.newHubTopRow}>
                  <span className={styles.newHubTag} style={{ background: item.tagBg, color: item.tagColor }}>
                    {item.tag}
                  </span>
                </div>
                
                <div
                  className={styles.newHubIconBox}
                  style={{
                    background: item.iconBg,
                    boxShadow: `0 10px 22px -3px ${item.glowColor}`,
                  }}
                >
                  <div className={styles.newHubIconGloss} />
                  <IconComp size={28} color="#FFFFFF" strokeWidth={2.4} />
                </div>

                <div className={styles.newHubInfo}>
                  <div className={styles.newHubTitle}>{item.label}</div>
                  <div className={styles.newHubSubtitle}>{item.sub}</div>
                </div>
              </>
            );

            return item.href ? (
              <a
                key={item.id}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.newHubCard}
                style={{
                  '--hub-border': item.border,
                  '--hub-hover-border': item.hoverBorder,
                  '--hub-glow': item.glowColor,
                  '--hub-bg': item.cardBg,
                }}
              >
                {cardContent}
              </a>
            ) : (
              <button
                key={item.id}
                type="button"
                className={styles.newHubCard}
                onClick={() => navigate(item.to)}
                style={{
                  '--hub-border': item.border,
                  '--hub-hover-border': item.hoverBorder,
                  '--hub-glow': item.glowColor,
                  '--hub-bg': item.cardBg,
                }}
              >
                {cardContent}
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

        {/* ═══ SHIFTED TO BOTTOM: TODAY'S TARGETS & PERFORMANCE ANALYTICS (RESTYLED THEME) ═══ */}
        <div className={styles.sectionHeader}>
          <span className="section-label">TODAY'S TARGETS & STUDY METRICS</span>
          <span className={styles.sectionSub}>Daily Progress</span>
        </div>

        {/* 1. Today's Targets with vibrant medical theme */}
        <div className={styles.newTargetsGrid}>
          {/* Questions Goal */}
          <div className={styles.newTargetCardBlue}>
            <div className={styles.newTargetTop}>
              <div className={styles.newTargetIconBoxBlue}>
                <Target size={22} color="#FFFFFF" />
              </div>
              <div className={styles.newTargetInfo}>
                <span className={styles.newTargetLabel}>QUESTIONS GOAL</span>
                <div className={styles.newTargetNumbers}>
                  <span className={styles.newTargetDone}>{dailyGoal.done}</span>
                  <span className={styles.newTargetTotal}>/ {dailyGoal.target} MCQs</span>
                </div>
              </div>
              <span className={styles.newTargetPillBlue}>
                {Math.round((dailyGoal.done / dailyGoal.target) * 100)}% Done
              </span>
            </div>
            <div className={styles.newProgressTrack}>
              <div 
                className={styles.newProgressFillBlue} 
                style={{ width: `${Math.min(100, (dailyGoal.done / dailyGoal.target) * 100)}%` }} 
              />
            </div>
          </div>

          {/* Study Time */}
          <div className={styles.newTargetCardEmerald}>
            <div className={styles.newTargetTop}>
              <div className={styles.newTargetIconBoxEmerald}>
                <Clock size={22} color="#FFFFFF" />
              </div>
              <div className={styles.newTargetInfo}>
                <span className={styles.newTargetLabel}>STUDY DURATION</span>
                <div className={styles.newTargetNumbers}>
                  <span className={styles.newTargetDone}>{studyTime.done}</span>
                  <span className={styles.newTargetTotal}>/ {studyTime.target} mins</span>
                </div>
              </div>
              <span className={styles.newTargetPillEmerald}>
                {Math.round((studyTime.done / studyTime.target) * 100)}% On Track
              </span>
            </div>
            <div className={styles.newProgressTrack}>
              <div 
                className={styles.newProgressFillEmerald} 
                style={{ width: `${Math.min(100, (studyTime.done / studyTime.target) * 100)}%` }} 
              />
            </div>
          </div>
        </div>

        {/* 2. Redesigned Level & Experience Card with Royal Theme */}
        <div className={styles.newLevelCard}>
          <div className={styles.newLevelLeft}>
            <div className={styles.newLevelBadge}>
              <span className={styles.newLevelNum}>Lv.{level.num}</span>
            </div>
            <div>
              <div className={styles.newLevelTitle}>{level.title} • Medical Resident</div>
              <div className={styles.newLevelSub}>
                {level.next ? `${points} / ${level.next} XP to next milestone` : '🏆 Max Academic Level Reached!'}
              </div>
            </div>
          </div>
          <div className={styles.newLevelRight}>
            <div className={styles.newLevelBarTrack}>
              <div className={styles.newLevelBarFill} style={{ width: `${levelPct}%` }} />
            </div>
            <span className={styles.newLevelPct}>{levelPct}% Complete</span>
          </div>
        </div>

        {/* 3. Redesigned Performance Analytics Strip */}
        <div className={styles.newStatsGrid}>
          {[
            { icon:'📚', label:'Total Points', val: animPoints.toLocaleString(), col:'#0284C7', bg:'#F0F9FF', border:'#BAE6FD' },
            { icon:'🎯', label:'MCQ Accuracy', val: `${accuracy}%`, col:'#059669', bg:'#F0FDF4', border:'#A7F3D0' },
            { icon:'🏆', label:'Global Rank', val: rank ? `#${rank}` : 'Top 10%', col:'#D97706', bg:'#FFFBEB', border:'#FDE68A' },
            { icon:'🔥', label:'Study Streak', val: `${animStreak} Days`, col:'#E11D48', bg:'#FFF1F2', border:'#FECDD3' },
          ].map(s => (
            <div key={s.label} className={styles.newStatCard} style={{ background: s.bg, borderColor: s.border }}>
              <div className={styles.newStatIcon}>{s.icon}</div>
              <div className={styles.newStatVal} style={{ color: s.col }}>{s.val}</div>
              <div className={styles.newStatLabel}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* 4. Promotional Banner Carousel shifted to bottom */}
        <div className={styles.newBannerWrap}>
          {BANNERS.map((b, i) => (
            <div
              key={i}
              className={`${styles.newBanner} ${i === bannerIdx ? styles.newBannerActive : ''}`}
              style={{ background: b.grad }}
            >
              <span className={styles.newBannerEmoji}>{b.emoji}</span>
              <div className={styles.newBannerText}>
                <div className={styles.newBannerTitle}>{b.title}</div>
                <div className={styles.newBannerSub}>{b.sub}</div>
              </div>
              {i === 0 && <span className={styles.newCouponBadge}>TRH100</span>}
            </div>
          ))}
          <div className={styles.newBannerDots}>
            {BANNERS.map((_, i) => (
              <button 
                key={i} 
                className={`${styles.newBannerDot} ${i === bannerIdx ? styles.newBannerDotActive : ''}`}
                onClick={() => setBannerIdx(i)} 
              />
            ))}
          </div>
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
