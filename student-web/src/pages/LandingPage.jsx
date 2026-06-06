import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  BookOpen, Zap, Trophy, Users, ArrowRight, CheckCircle, Star, Brain,
  Flame, Shield, ChevronDown, ChevronUp, MessageCircle, Clock, Target,
  BarChart2, Award, Layers, BookMarked, Cpu, HeartPulse, Microscope, Stethoscope
} from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './LandingPage.module.css';

const FEATURES = [
  { icon: Brain, color: '#8B5CF6', bg: '#F5F3FF', title: 'Smart MCQ Practice', desc: 'Thousands of questions across all 6 medical courses — organized by topic, subject, and clinical difficulty.' },
  { icon: Zap, color: '#F59E0B', bg: '#FFFBEB', title: 'Situational Case Tasks', desc: 'Real clinical scenario-based questions designed to sharpen your diagnostic reasoning and decision-making.' },
  { icon: Trophy, color: '#10B981', bg: '#F0FDF4', title: 'Instant Feedback', desc: 'See your score, review correct answers with detailed explanations, and learn from your mistakes immediately.' },
  { icon: Flame, color: '#EF4444', bg: '#FFF1F2', title: 'Daily Study Streaks', desc: 'Build consistency with daily practice goals. Track your streak and maintain momentum all semester.' },
  { icon: BarChart2, color: '#3B82F6', bg: '#EFF6FF', title: 'Performance Analytics', desc: 'Detailed statistics on your accuracy, time spent, and progress across every subject and topic.' },
  { icon: Cpu, color: '#06B6D4', bg: '#ECFEFF', title: 'AI Study Assistant', desc: 'Ask medical questions and get instant AI-powered answers in English, Hinglish, or Malayalam.' },
  { icon: Award, color: '#F97316', bg: '#FFF7ED', title: 'Battle Mode', desc: 'Challenge your peers in real-time MCQ battles. Compete, rank, and learn under exam pressure.' },
  { icon: BookMarked, color: '#6366F1', bg: '#EEF2FF', title: 'Smart Bookmarks', desc: 'Save tricky questions and create your own custom revision decks to revisit before exams.' },
  { icon: Layers, color: '#059669', bg: '#F0FDF4', title: 'Master Topic Reviews', desc: 'Each subject includes a Master Topic — a comprehensive 50-MCQ review of the entire subject.' },
];

const COURSES = [
  { num: '1', title: '1st Course', color: '#3B82F6', subjects: 21, icon: BookOpen, highlight: 'Biology, Chemistry, Physics' },
  { num: '2', title: '2nd Course', color: '#8B5CF6', subjects: 24, icon: Microscope, highlight: 'Anatomy, Physiology, Biochemistry' },
  { num: '3', title: '3rd Course', color: '#10B981', subjects: 25, icon: HeartPulse, highlight: 'Pathology, Pharmacology, Microbiology' },
  { num: '4', title: '4th Course', color: '#F59E0B', subjects: 23, icon: Stethoscope, highlight: 'Internal Medicine, Surgery, Pediatrics' },
  { num: '5', title: '5th Course', color: '#EF4444', subjects: 24, icon: Target, highlight: 'Clinical Disciplines & Specialties' },
  { num: '6', title: '6th Course', color: '#06B6D4', subjects: 14, icon: Award, highlight: 'Final Internship & CBT Preparation' },
];

const TESTIMONIALS = [
  { name: 'Aarzoo Sipai', course: '2nd Course Student', avatar: 'A', color: '#8B5CF6', rating: 5, text: 'SAMU MCQs completely changed how I prepare for exams. The topic-by-topic structure matches our syllabus perfectly and the situational tasks are incredibly realistic.' },
  { name: 'Abdul Azeez', course: '3rd Course Student', avatar: 'AA', color: '#10B981', rating: 5, text: 'I scored 78 in Biochemistry CBT after using this platform for just 2 weeks. The instant feedback after every question helped me identify my weak areas quickly.' },
  { name: 'Mohammad K.', course: '4th Course Student', avatar: 'M', color: '#F59E0B', rating: 5, text: 'The AI assistant is a game changer. I can ask any medical question during practice and get an explanation in Hinglish which makes it so much easier to understand.' },
  { name: 'Fatima R.', course: '1st Course Student', avatar: 'F', color: '#EF4444', rating: 5, text: 'Daily streaks kept me consistent for 40 days straight. I never studied this regularly before! The battle mode with classmates makes revision actually fun.' },
];

const STATS = [
  { val: '6', label: 'Medical Courses', sub: 'All years covered', icon: BookOpen, color: '#3B82F6' },
  { val: '131+', label: 'Subjects', sub: 'Every department', icon: Layers, color: '#8B5CF6' },
  { val: '8,000+', label: 'MCQs Available', sub: 'Test & situational', icon: Brain, color: '#10B981' },
  { val: '1,200+', label: 'Active Students', sub: 'Using platform daily', icon: Users, color: '#F59E0B' },
  { val: '94%', label: 'Exam Pass Rate', sub: 'Among subscribers', icon: Trophy, color: '#EF4444' },
  { val: '4.9★', label: 'Student Rating', sub: 'Based on reviews', icon: Star, color: '#F97316' },
];

const FAQS = [
  { q: 'Is SAMU MCQs free to use?', a: 'Yes! You can sign up and access a limited set of questions for free. For full access to all 8,000+ MCQs across all 6 courses, you can subscribe to our premium plan.' },
  { q: 'What subjects are available?', a: 'We cover all 6 years of SAMU medical education — from first-year sciences (Biology, Chemistry, Physics) through to clinical specialties in 5th and 6th course. Each course has 14–25 subjects.' },
  { q: 'What is the difference between Test Questions and Case Tasks?', a: 'Test Questions are standard MCQs for factual knowledge. Case Tasks (situational questions) present real clinical scenarios — a patient case followed by diagnostic or management questions — simulating the actual CBT exam format.' },
  { q: 'How does Battle Mode work?', a: 'Battle Mode lets you challenge another student in a real-time MCQ duel. Both students answer the same questions simultaneously, and whoever scores higher wins. It\'s a fun and competitive way to review material.' },
  { q: 'Can I use this on my phone?', a: 'Absolutely. SAMU MCQs is fully responsive and works perfectly on mobile browsers. We also have a dedicated Android app available for download via our Telegram channel.' },
  { q: 'How is the AI assistant useful?', a: 'The AI Study Assistant is powered by advanced language models (Groq/Llama 3.3 70B). You can ask it to explain a medical concept, clarify a tricky MCQ, or summarize a topic — all in English, Hinglish, or Malayalam.' },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Free Account', desc: 'Sign up in 30 seconds. No credit card required.', color: '#3B82F6' },
  { step: '02', title: 'Choose Your Course & Subject', desc: 'Navigate to your year, pick a subject, and select any topic.', color: '#8B5CF6' },
  { step: '03', title: 'Practice MCQs', desc: 'Answer test questions or clinical case tasks with instant feedback.', color: '#10B981' },
  { step: '04', title: 'Track & Improve', desc: 'Review your analytics, bookmark hard questions, and repeat.', color: '#F59E0B' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqItem} onClick={() => setOpen(!open)}>
      <div className={styles.faqHeader}>
        <span className={styles.faqQ}>{q}</span>
        {open ? <ChevronUp size={18} color="#6366f1" /> : <ChevronDown size={18} color="#9ca3af" />}
      </div>
      {open && <p className={styles.faqA}>{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
          <div className={styles.glow3} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <span>Trusted by SAMU Medical Students · 1,200+ Active Learners</span>
          </div>
          <h1 className={styles.heroTitle}>
            Master Medical MCQs<br />
            <span className="text-gradient">One Topic at a Time</span>
          </h1>
          <p className={styles.heroSub}>
            Comprehensive MCQ practice for all 6 years of SAMU medical education.<br />
            Test questions, situational case tasks, AI assistant & instant feedback — all in one place.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '15px 36px' }}>
              Start Practicing Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: 16, padding: '15px 36px' }}>
              Sign In
            </Link>
          </div>
          <div className={styles.heroChecks}>
            {['No credit card required', 'All 6 medical courses', 'AI-powered study help'].map(t => (
              <span key={t} className={styles.heroCheck}>
                <CheckCircle size={14} color="#10B981" fill="#10B981" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* floating stats ribbon */}
        <div className={styles.heroStatsRibbon}>
          <div className={styles.ribbonStat}><strong>6</strong><span>Courses</span></div>
          <div className={styles.ribbonDiv} />
          <div className={styles.ribbonStat}><strong>131+</strong><span>Subjects</span></div>
          <div className={styles.ribbonDiv} />
          <div className={styles.ribbonStat}><strong>8,000+</strong><span>MCQs</span></div>
          <div className={styles.ribbonDiv} />
          <div className={styles.ribbonStat}><strong>94%</strong><span>Pass Rate</span></div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>HOW IT WORKS</span>
            <h2 className={styles.sectionTitle}>Start in 4 Simple Steps</h2>
            <p className={styles.sectionSub}>Get from zero to exam-ready faster than you think</p>
          </div>
          <div className={styles.stepsGrid}>
            {HOW_IT_WORKS.map((s, i) => (
              <div key={s.step} className={styles.stepCard}>
                <div className={styles.stepNum} style={{ color: s.color, borderColor: s.color + '44', background: s.color + '11' }}>{s.step}</div>
                {i < HOW_IT_WORKS.length - 1 && <div className={styles.stepArrow}><ArrowRight size={16} color="#d1d5db" /></div>}
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepDesc}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ── */}
      <section className={styles.statsSection}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel} style={{ color: '#fff' }}>BY THE NUMBERS</span>
            <h2 className={styles.sectionTitle} style={{ color: '#fff' }}>Built for SAMU Students</h2>
          </div>
          <div className={styles.statsGrid}>
            {STATS.map(s => (
              <div key={s.label} className={styles.statCard}>
                <div className={styles.statIcon} style={{ background: s.color + '22' }}>
                  <s.icon size={24} color={s.color} />
                </div>
                <div className={styles.statVal}>{s.val}</div>
                <div className={styles.statLabel}>{s.label}</div>
                <div className={styles.statSub}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COURSES GRID ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>ACADEMIC CURRICULUM</span>
            <h2 className={styles.sectionTitle}>All 6 Years of Medical Education</h2>
            <p className={styles.sectionSub}>Browse subjects and topics from each course year — organized exactly like your syllabus</p>
          </div>
          <div className={styles.coursesGrid}>
            {COURSES.map((c) => (
              <div key={c.num} className={styles.courseCard} style={{ '--accent': c.color }}>
                <div className={styles.courseNumBadge} style={{ background: c.color }}>
                  <c.icon size={18} color="#fff" />
                </div>
                <div className={styles.courseInfo}>
                  <h3 className={styles.courseTitle}>{c.title}</h3>
                  <p className={styles.courseHighlight}>{c.highlight}</p>
                  <p className={styles.courseMeta}>{c.subjects} subjects available</p>
                </div>
                <div className={styles.courseArrow}>
                  <ArrowRight size={16} color={c.color} />
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 40 }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '15px 40px', fontSize: 15 }}>
              Access All Courses Free
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className={styles.section} style={{ background: 'rgba(248,250,252,0.8)' }}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>FEATURES</span>
            <h2 className={styles.sectionTitle}>Everything You Need to Succeed</h2>
            <p className={styles.sectionSub}>Tools designed specifically for SAMU medical students</p>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={styles.featureCard}>
                <div className={styles.featureIcon} style={{ background: f.bg, border: `1px solid ${f.color}33` }}>
                  <f.icon size={26} color={f.color} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>STUDENT REVIEWS</span>
            <h2 className={styles.sectionTitle}>What Students Are Saying</h2>
            <p className={styles.sectionSub}>Real feedback from SAMU medical students who use the platform</p>
          </div>
          <div className={styles.testimonialsGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={styles.testimonialCard}>
                <div className={styles.testimonialStars}>
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} color="#F59E0B" fill="#F59E0B" />
                  ))}
                </div>
                <p className={styles.testimonialText}>"{t.text}"</p>
                <div className={styles.testimonialAuthor}>
                  <div className={styles.testimonialAvatar} style={{ background: t.color }}>{t.avatar}</div>
                  <div>
                    <div className={styles.testimonialName}>{t.name}</div>
                    <div className={styles.testimonialCourse}>{t.course}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className={styles.section} style={{ background: 'rgba(248,250,252,0.8)' }}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>FAQ</span>
            <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
          </div>
          <div className={styles.faqList}>
            {FAQS.map((f) => <FAQ key={f.q} {...f} />)}
          </div>
          <div style={{ textAlign: 'center', marginTop: 36 }}>
            <p style={{ color: 'var(--text-muted)', marginBottom: 16, fontSize: 15 }}>Still have questions?</p>
            <a href="https://t.me/samu_mcqs" target="_blank" rel="noopener noreferrer" className="btn btn-ghost" style={{ gap: 8 }}>
              <MessageCircle size={18} />
              Join our Telegram
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div className={styles.ctaBadge}><Flame size={16} color="#F59E0B" /> 1,200+ students already practicing</div>
          <h2 className={styles.ctaTitle}>Ready to Ace Your Medical Exams?</h2>
          <p className={styles.ctaSub}>Join your classmates on SAMU MCQs. Free to start, no credit card needed.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}>
              Get Started for Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: 16, padding: '16px 32px' }}>
              Sign In
            </Link>
          </div>
          <div className={styles.ctaChecks}>
            {['Free forever plan', 'No setup required', 'All 6 courses', 'AI assistant included'].map(t => (
              <span key={t} className={styles.ctaCheck}><CheckCircle size={14} color="#10B981" /> {t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerTop}>
            <div className={styles.footerBrand}>
              <div className={styles.footerLogo}>
                <BookOpen size={18} color="#fff" />
              </div>
              <div>
                <span className={styles.footerLogoText}>SAMU MCQs</span>
                <p className={styles.footerLogoSub}>Medical education made smart</p>
              </div>
            </div>
            <div className={styles.footerLinks}>
              <div className={styles.footerCol}>
                <h4>Platform</h4>
                <Link to="/register">Get Started</Link>
                <Link to="/login">Sign In</Link>
                <Link to="/results">Exam Results</Link>
              </div>
              <div className={styles.footerCol}>
                <h4>Support</h4>
                <a href="https://t.me/samu_mcqs" target="_blank" rel="noopener noreferrer">Telegram</a>
                <Link to="/help">Help Desk</Link>
                <Link to="/subscribe">Pricing</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>© 2025 SAMU MCQs. All rights reserved. Built for SAMU Medical Students.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
