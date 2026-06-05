import { Link } from 'react-router-dom';
import { BookOpen, Zap, Trophy, Users, ArrowRight, CheckCircle, Star, Brain, Flame, Shield } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './LandingPage.module.css';

const FEATURES = [
  { icon: Brain, color: '#8B5CF6', title: 'Smart MCQ Practice', desc: 'Thousands of questions across all 6 medical courses, topic by topic.' },
  { icon: Zap, color: '#F59E0B', title: 'Situational Tasks', desc: 'Real clinical scenario-based questions to sharpen your reasoning.' },
  { icon: Trophy, color: '#10B981', title: 'Instant Results', desc: 'See your score, review correct answers, and learn from mistakes.' },
  { icon: Flame, color: '#EF4444', title: 'Daily Streaks', desc: 'Stay consistent with daily practice and track your progress.' },
  { icon: Shield, color: '#3B82F6', title: 'Exam Ready', desc: 'Structured by course, subject, and topic — just like your syllabus.' },
  { icon: Star, color: '#06B6D4', title: 'Premium Content', desc: 'High-quality, curated questions trusted by SAMU medical students.' },
];

const COURSES = [
  { num: '1', title: '1st Course', color: '#3B82F6', subjects: 21 },
  { num: '2', title: '2nd Course', color: '#8B5CF6', subjects: 24 },
  { num: '3', title: '3rd Course', color: '#10B981', subjects: 25 },
  { num: '4', title: '4th Course', color: '#F59E0B', subjects: 23 },
  { num: '5', title: '5th Course', color: '#EF4444', subjects: 24 },
  { num: '6', title: '6th Course', color: '#06B6D4', subjects: 14 },
];

export default function LandingPage() {
  return (
    <div className={styles.page}>
      <Navbar />

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBg}>
          <div className={styles.glow1} />
          <div className={styles.glow2} />
        </div>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <Star size={14} color="#F59E0B" fill="#F59E0B" />
            <span>Trusted by SAMU Medical Students</span>
          </div>
          <h1 className={styles.heroTitle}>
            Master Medical MCQs<br />
            <span className="text-gradient">One Topic at a Time</span>
          </h1>
          <p className={styles.heroSub}>
            Comprehensive MCQ practice for all 6 years of SAMU medical education. Test questions, situational tasks, instant feedback — all in one place.
          </p>
          <div className={styles.heroCtas}>
            <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>
              Start Practicing Free
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-ghost" style={{ fontSize: 16, padding: '14px 32px' }}>
              Sign In
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>6</strong><span>Courses</span></div>
            <div className={styles.statDiv} />
            <div className={styles.stat}><strong>100+</strong><span>Subjects</span></div>
            <div className={styles.statDiv} />
            <div className={styles.stat}><strong>5000+</strong><span>MCQs</span></div>
          </div>
        </div>
      </section>

      {/* Courses Grid */}
      <section className={styles.section}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>ACADEMIC COURSES</span>
            <h2 className={styles.sectionTitle}>All 6 Years of Medical Education</h2>
            <p className={styles.sectionSub}>Browse subjects and topics from each course year</p>
          </div>
          <div className={styles.coursesGrid}>
            {COURSES.map((c) => (
              <div key={c.num} className={styles.courseCard} style={{ '--accent': c.color }}>
                <div className={styles.courseNum} style={{ background: c.color }}>{c.num}</div>
                <div className={styles.courseInfo}>
                  <h3>{c.title}</h3>
                  <p>{c.subjects} subjects</p>
                </div>
                <div className={styles.courseArrow}><ArrowRight size={16} color={c.color} /></div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
              Access All Courses
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className={styles.section} style={{ background: 'rgba(255,255,255,0.02)' }}>
        <div className={styles.sectionInner}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>FEATURES</span>
            <h2 className={styles.sectionTitle}>Everything You Need to Succeed</h2>
          </div>
          <div className={styles.featuresGrid}>
            {FEATURES.map((f) => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon} style={{ background: f.color + '22', border: `1px solid ${f.color}44` }}>
                  <f.icon size={24} color={f.color} />
                </div>
                <h3 className={styles.featureTitle}>{f.title}</h3>
                <p className={styles.featureDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <h2 className={styles.ctaTitle}>Ready to Ace Your Medical Exams?</h2>
          <p className={styles.ctaSub}>Join thousands of SAMU students already practicing smarter.</p>
          <Link to="/register" className="btn btn-primary" style={{ fontSize: 16, padding: '16px 40px' }}>
            Get Started Today
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #1D4ED8, #8B5CF6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen size={16} color="#fff" />
            </div>
            <span style={{ fontWeight: 900, fontSize: 16, color: 'var(--text-primary)' }}>SAMU MCQs</span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>© 2025 SAMU MCQs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
