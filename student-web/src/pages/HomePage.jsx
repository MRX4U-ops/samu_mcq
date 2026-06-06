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
  MessageCircle, Search, Mic, Users, Award, ChevronLeft, ArrowRight
} from 'lucide-react';
import styles from './HomePage.module.css';

/* ── Constants ───────────────────────────────────────── */
const COURSE_COLORS = [
  'linear-gradient(135deg,#1D4ED8,#3B82F6)',
  'linear-gradient(135deg,#6D28D9,#8B5CF6)',
  'linear-gradient(135deg,#047857,#10B981)',
  'linear-gradient(135deg,#B45309,#F59E0B)',
  'linear-gradient(135deg,#BE123C,#F43F5E)',
  'linear-gradient(135deg,#0E7490,#06B6D4)',
];
const COURSE_ICONS = ['🫀','🔬','🦴','💊','🧠','🦠'];
const DEFAULT_COURSES = [
  { id:'1', title:'1st Course', num:'1', subjectCount:21 },
  { id:'2', title:'2nd Course', num:'2', subjectCount:24 },
  { id:'3', title:'3rd Course', num:'3', subjectCount:25 },
  { id:'4', title:'4th Course', num:'4', subjectCount:23 },
  { id:'5', title:'5th Course', num:'5', subjectCount:24 },
  { id:'6', title:'6th Course', num:'6', subjectCount:14 },
];

const HUB_ITEMS = [
  { icon:'🧠', label:'Ask AI',        to:'/ask-ai',      grad:'linear-gradient(135deg,#4338CA,#7C3AED)' },
  { icon:'⚔️', label:'Quiz Battle',   to:'/battle',      grad:'linear-gradient(135deg,#B45309,#F59E0B)' },
  { icon:'🏆', label:'Leaderboard',   to:'/leaderboard', grad:'linear-gradient(135deg,#047857,#10B981)' },
  { icon:'📊', label:'CBT Results',   to:'/results',     grad:'linear-gradient(135deg,#0E7490,#06B6D4)' },
  { icon:'🩺', label:'Diagnostics',   to:'/ask-ai',      grad:'linear-gradient(135deg,#BE123C,#F43F5E)' },
  { icon:'⭐', label:'Bookmarks',     to:'/profile',     grad:'linear-gradient(135deg,#B45309,#FBBF24)' },
  { icon:'🎁', label:'Rewards',       to:'/subscribe',   grad:'linear-gradient(135deg,#6D28D9,#EC4899)' },
  { icon:'📚', label:'Notes',         to:'/guidance',    grad:'linear-gradient(135deg,#065F46,#10B981)' },
  { icon:'🌐', label:'SSMU Website',  href:'https://ssmu.org', grad:'linear-gradient(135deg,#1E3A8A,#3B82F6)' },
  { icon:'💬', label:'Telegram',      href:'https://t.me/mrx4u', grad:'linear-gradient(135deg,#0077B6,#00B4D8)' },
];

const BANNERS = [
  { emoji:'🔥', title:'FREE THIS MONTH', sub:'Use coupon TRH100 for 100% discount', grad:'linear-gradient(135deg,rgba(124,45,18,0.85),rgba(220,38,38,0.85),rgba(239,68,68,0.85)), url("/banner_1_bg.png") center/cover no-repeat' },
  { emoji:'📚', title:'New Questions Added', sub:'Microbiology & Pharmacology updated', grad:'linear-gradient(135deg,rgba(30,58,138,0.85),rgba(29,78,216,0.85),rgba(59,130,246,0.85)), url("/banner_2_bg.png") center/cover no-repeat' },
  { emoji:'🏆', title:'Monthly Winner Gets ₹49', sub:'Top ranker earns cashback reward', grad:'linear-gradient(135deg,rgba(120,53,15,0.85),rgba(180,83,9,0.85),rgba(245,158,11,0.85)), url("/banner_3_bg.png") center/cover no-repeat' },
  { emoji:'⚔️', title:'Quiz Battle Live Now', sub:'Challenge friends and climb the ranks', grad:'linear-gradient(135deg,rgba(76,29,149,0.85),rgba(109,40,217,0.85),rgba(139,92,246,0.85)), url("/banner_4_bg.png") center/cover no-repeat' },
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
              <Target size={18} color="#6366F1" />
              <span className={styles.goalTitle}>Questions Goal</span>
            </div>
            <div className={styles.goalNums}>
              <span className={styles.goalDone}>{dailyGoal.done}</span>
              <span className={styles.goalSep}>/ {dailyGoal.target}</span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div className="progress-fill" style={{ width: `${(dailyGoal.done / dailyGoal.target) * 100}%` }} />
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
              <div className="progress-fill" style={{ width: `${(studyTime.done / studyTime.target) * 100}%`, background:'linear-gradient(135deg,#047857,#10B981)' }} />
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
          {courses.map((c, i) => (
            <button key={c.id} className={styles.courseCard} onClick={() => handleCourseClick(c)}>
              <div className={styles.courseGrad} style={{ background: COURSE_COLORS[i % COURSE_COLORS.length] }}>
                <span className={styles.courseEmoji}>{COURSE_ICONS[i]}</span>
                {isSubscribed
                  ? <Unlock size={14} color="rgba(255,255,255,0.7)" />
                  : <Lock size={14} color="rgba(255,255,255,0.5)" />}
              </div>
              <div className={styles.courseInfo}>
                <div className={styles.courseTitle}>{c.title}</div>
                <div className={styles.courseMeta}>{c.subjectCount} subjects</div>
              </div>
              <ChevronRight size={16} className={styles.courseChev} />
            </button>
          ))}
        </div>

        {/* ═══ AI INSIGHTS ════════════════════════════════ */}
        <div className={styles.aiInsightCard}>
          <div className={styles.aiIconWrap}>
            <Brain size={24} color="#fff" />
          </div>
          <div className={styles.aiContent}>
            <div className={styles.aiTitle}>
              <Sparkles size={14} color="#6366f1" /> AI Study Insight
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
            { label: 'Microbiology', pct: 65, color: '#F59E0B' },
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
                  <div className={styles.taskIcon} style={{ background: '#e0e7ff' }}><Target size={18} color="#4f46e5" /></div>
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
                <div className={styles.actScore} style={{ color: '#4f46e5' }}>88%</div>
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
      <BottomNav />
    </div>
  );
}
