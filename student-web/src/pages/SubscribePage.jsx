import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  Crown, ChevronLeft, CheckCircle, MessageCircle, Star, Zap,
  BookOpen, Brain, Trophy, Target, Flame, Shield, ArrowRight
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
  const { isSubscribed } = useAuth();

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        <Link to="/home" className={styles.backBtn}>
          <ChevronLeft size={18} /> Back
        </Link>

        {isSubscribed ? (
          <div className={styles.alreadyCard}>
            <div className={styles.alreadyIcon}><CheckCircle size={48} color="#10B981" /></div>
            <h2 className={styles.alreadyTitle}>You're All Set! 🎉</h2>
            <p className={styles.alreadySub}>You have full premium access to all SAMU MCQs content. Keep practicing!</p>
            <Link to="/home" className="btn btn-primary" style={{ marginTop: 20, gap: 8 }}>
              Go to Dashboard <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
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
