import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  BookOpen, Zap, Trophy, Users, ArrowRight, CheckCircle, Star, Brain,
  Flame, Shield, ChevronDown, ChevronUp, MessageCircle, Clock, Target,
  BarChart2, Award, Layers, BookMarked, Cpu, HeartPulse, Microscope, Stethoscope,
  Check, X, FileText, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './LandingPage.module.css';

const DEMO_MCQ = {
  question: "A 45-year-old male presents to the emergency department with severe, crushing chest pain radiating to his left arm. The pain started 30 minutes ago during rest. ECG shows ST-segment elevation in leads V1-V4 (acute anterior MI). What is the most crucial drug of choice to chew immediately?",
  options: [
    "a. Aspirin (325 mg)",
    "b. Clopidogrel (300 mg)",
    "c. Metoprolol (50 mg)",
    "d. Atorvastatin (80 mg)"
  ],
  correctIndex: 0,
  explanation: "Correct! Chewing a loading dose of Aspirin (300-325 mg) immediately is the first-line therapy for acute myocardial infarction (STEMI) to inhibit thromboxane A2 synthesis, stopping platelet aggregation. It reduces mortality significantly and is chewed for rapid mucosal absorption.",
  incorrectExplanation: "Incorrect. While other options like Clopidogrel and Atorvastatin are part of acute MI management, Aspirin is the absolute first-line immediate chewable drug. Beta-blockers (Metoprolol) are avoided in acute decompensation or cardiogenic shock risk."
};

const HOW_IT_WORKS = [
  { step: '01', title: 'Create Free Account', desc: 'Sign up in 30 seconds. No credit card required.' },
  { step: '02', title: 'Choose Your Course & Subject', desc: 'Navigate to your year, pick a subject, and select any topic.' },
  { step: '03', title: 'Practice MCQs', desc: 'Answer test questions or clinical case tasks with instant feedback.' },
  { step: '04', title: 'Track & Improve', desc: 'Review your analytics, bookmark hard questions, and repeat.' },
];

const STATS = [
  { val: '6', label: 'Medical Courses', sub: 'All years covered', icon: BookOpen, color: '#3B82F6' },
  { val: '131+', label: 'Subjects', sub: 'Every department', icon: Layers, color: '#8B5CF6' },
  { val: '8,000+', label: 'MCQs Available', sub: 'Test & situational', icon: Brain, color: '#10B981' },
  { val: '1,200+', label: 'Active Students', sub: 'Using platform daily', icon: Users, color: '#F59E0B' },
  { val: '94%', label: 'Exam Pass Rate', sub: 'Among subscribers', icon: Trophy, color: '#EF4444' },
  { val: '4.9★', label: 'Student Rating', sub: 'Based on reviews', icon: Star, color: '#F97316' },
];

const COURSES = [
  { num: '1', title: '1st Course', subjects: '21 subjects available', icon: BookOpen, color: '#3B82F6', highlight: 'Biology, Chemistry, Physics' },
  { num: '2', title: '2nd Course', subjects: '24 subjects available', icon: Microscope, color: '#8B5CF6', highlight: 'Anatomy, Physiology, Biochemistry' },
  { num: '3', title: '3rd Course', subjects: '25 subjects available', icon: HeartPulse, color: '#10B981', highlight: 'Pathology, Pharmacology, Microbiology' },
  { num: '4', title: '4th Course', subjects: '23 subjects available', icon: Stethoscope, color: '#F59E0B', highlight: 'Internal Medicine, Surgery, Pediatrics' },
  { num: '5', title: '5th Course', subjects: '24 subjects available', icon: Target, color: '#EF4444', highlight: 'Clinical Disciplines & Specialties' },
  { num: '6', title: '6th Course', subjects: '14 subjects available', icon: Award, color: '#06B6D4', highlight: 'Final Internship & CBT Preparation' },
];

const PRACTICE_SUITE = [
  {
    badge: 'REAL-TIME 1v1',
    badgeSub: '450+ Daily Battles • Live Matchmaking',
    title: 'Medical Battle Arena',
    desc: 'Challenge classmates in live 60-second rapid-fire clinical duels. Climb university ranks under exam pressure.',
    btnText: 'Enter Arena',
    btnTo: '/battle'
  },
  {
    badge: 'AI POWERED',
    badgeSub: 'Llama 3.3 70B • Multilingual Support',
    title: 'Clinical AI Study Tutor',
    desc: 'Get instant step-by-step diagnostic reasoning, differential diagnoses, and exam mnemonics whenever you are stuck.',
    btnText: 'Consult AI',
    btnTo: '/ask-ai'
  },
  {
    badge: 'SITUATIONAL CBT',
    badgeSub: '650+ Clinical Scenarios • Full Rationales',
    title: 'Case Task Simulator',
    desc: 'Real patient admissions with vitals, lab panels, ECG/imaging, and step-by-step clinical management protocols.',
    btnText: 'Solve Cases',
    btnTo: '/clinical-case'
  },
  {
    badge: 'HIGH YIELD',
    badgeSub: '800+ Drugs • Exam Mnemonics',
    title: 'Pharmacology & Drug Index',
    desc: 'Quick-reference formulary with mechanisms of action, clinical indications, adverse effects, and black-box warnings.',
    btnText: 'Explore Drugs',
    btnTo: '/drugs'
  },
  {
    badge: 'ANKI ALGORITHM',
    badgeSub: 'Daily Queue • Memory Booster',
    title: 'Smart Spaced Repetition',
    desc: 'Target your weak spots before you forget. Memory retention curves automatically prioritize questions you missed.',
    btnText: 'Start Recall',
    btnTo: '/home'
  },
  {
    badge: 'OFFICIAL SEAL',
    badgeSub: 'Public Verification • Portfolio Ready',
    title: 'Achievement Certificates',
    desc: 'Earn verifiable digital course completion certificates with unique cryptographic IDs and QR verification.',
    btnText: 'View Certificate',
    btnTo: '/register'
  }
];

const CLINICAL_DISCIPLINES = [
  { mcqs: '640 MCQs', yieldRate: '98% Yield', title: 'Cardiology & ECG Mastery', desc: 'STEMI, Arrhythmias, Heart Failure, Valvular Murmurs & Pharmacology', course: '4th & 5th Course' },
  { mcqs: '520 MCQs', yieldRate: '96% Yield', title: 'Neurology & Stroke Protocols', desc: 'Ischemic Strokes, Cranial Nerves, Epilepsy Syndromes & Meningitis', course: '4th Course' },
  { mcqs: '780 MCQs', yieldRate: '99% Yield', title: 'Clinical Pharmacology', desc: 'Antibiotics, Anti-arrhythmics, Autonomic Drugs & Toxicology Antidotes', course: '3rd Course' },
  { mcqs: '710 MCQs', yieldRate: '95% Yield', title: 'Pathology & Pathophysiology', desc: 'Cellular Injury, Neoplasia, Granulomatous Disease & Organ Systems', course: '3rd Course' },
  { mcqs: '490 MCQs', yieldRate: '94% Yield', title: 'Pediatric Emergencies', desc: 'Congenital Anomalies, Neonatal Resuscitation & Exanthems', course: '5th Course' },
  { mcqs: '530 MCQs', yieldRate: '97% Yield', title: 'Surgical Emergencies & ATLS', desc: 'Acute Abdomen, Hemorrhage Control, Shock Types & Trauma Protocols', course: '5th & 6th Course' }
];

const PLATFORM_CAPABILITIES = [
  { icon: Flame, title: 'Daily Study Streaks', desc: 'Build consistency with daily practice goals. Track your streak and maintain momentum all semester.' },
  { icon: BarChart2, title: 'Performance Analytics', desc: 'Detailed statistics on your accuracy, time spent, and progress across every subject and topic.' },
  { icon: Cpu, title: 'AI Study Assistant', desc: 'Ask medical questions and get instant AI-powered answers in English, Hinglish, or Malayalam.' },
  { icon: Award, title: 'Battle Mode', desc: 'Challenge your peers in real-time MCQ battles. Compete, rank, and learn under exam pressure.' },
  { icon: BookMarked, title: 'Smart Bookmarks', desc: 'Save tricky questions and create your own custom revision decks to revisit before exams.' },
  { icon: Layers, title: 'Master Topic Reviews', desc: 'Each subject includes a Master Topic — a comprehensive 50-MCQ review of the entire subject.' }
];

const COMPARISON_ROWS = [
  {
    feature: 'Question Explanations',
    traditional: 'None or simple letter answer key',
    samu: 'Comprehensive rationale + AI Tutor clarification'
  },
  {
    feature: 'Curriculum Alignment',
    traditional: 'Scattered questions from outdated files',
    samu: '100% mapped to official SAMU year syllabus'
  },
  {
    feature: 'Retention & Weak Area Tracking',
    traditional: 'Manual messy notes, easily lost',
    samu: 'Automated spaced repetition & accuracy analytics'
  },
  {
    feature: 'Real Exam Simulation',
    traditional: 'Static PDF scrolling with no timer',
    samu: 'Timed CBT interface matching real exam screens'
  },
  {
    feature: 'Multi-Device Sync',
    traditional: 'Only on laptop or heavy paper printouts',
    samu: 'Seamless cloud sync on mobile, tablet & PC'
  }
];

const FAQS = [
  { q: 'Is SAMU MCQs free to use?', a: 'Yes! You can sign up and access a limited set of questions for free. For full access to all 8,000+ MCQs across all 6 courses, you can subscribe to our premium plan.' },
  { q: 'What subjects are available?', a: 'We cover all 6 years of SAMU medical education — from first-year sciences (Biology, Chemistry, Physics) through to clinical specialties in 5th and 6th course. Each course has 14–25 subjects.' },
  { q: 'What is the difference between Test Questions and Case Tasks?', a: 'Test Questions are standard MCQs for factual knowledge. Case Tasks (situational questions) present real clinical scenarios — a patient case followed by diagnostic or management questions — simulating the actual CBT exam format.' },
  { q: 'How does Battle Mode work?', a: 'Battle Mode lets you challenge another student in a real-time MCQ duel. Both students answer the same questions simultaneously, and whoever scores higher wins. It\'s a fun and competitive way to review material.' },
  { q: 'Can I use this on my phone?', a: 'Absolutely. SAMU MCQs is fully responsive and works perfectly on mobile browsers. We also have a dedicated Android app available for download via our Telegram channel.' },
  { q: 'How is the AI assistant useful?', a: 'The AI Study Assistant is powered by advanced language models (Groq/Llama 3.3 70B). You can ask it to explain a medical concept, clarify a tricky MCQ, or summarize a topic — all in English, Hinglish, or Malayalam.' },
];

function FAQ({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={styles.faqCard} onClick={() => setOpen(!open)}>
      <div className={styles.faqHeader}>
        <span className={styles.faqQ}>{q}</span>
        {open ? <ChevronUp size={18} color="#4338CA" /> : <ChevronDown size={18} color="#9ca3af" />}
      </div>
      {open && <p className={styles.faqA}>{a}</p>}
    </div>
  );
}

export default function LandingPage() {
  const [demoSelected, setDemoSelected] = useState(null);
  const [demoAnswered, setDemoAnswered] = useState(false);

  const handleDemoSelect = (idx) => {
    if (demoAnswered) return;
    setDemoSelected(idx);
    setDemoAnswered(true);
  };

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── HERO ── */}
      <section className={styles.hero}>
        <div className={styles.heroContainer}>
          <div className={styles.heroLeft}>
            <div className={styles.pillBadge}>
              <Star size={13} color="#F59E0B" fill="#F59E0B" />
              <span>SAMU MEDICAL MCQ PLATFORM • ALL 6 YEARS</span>
            </div>
            <h1 className={styles.heroTitle}>
              Master Medical MCQs<br />
              <span className={styles.gradientText}>One Topic at a Time</span>
            </h1>
            <p className={styles.heroSub}>
              Comprehensive MCQ practice for all 6 years of SAMU medical education.<br />
              Test questions, situational case tasks, AI tutor, and instant clinical feedback — all in one place.
            </p>
            <div className={styles.heroCtas}>
              <Link to="/register" className={styles.primaryBtn}>
                Start Practicing Free &rarr;
              </Link>
              <Link to="/login" className={styles.secondaryBtn}>
                Student Sign In
              </Link>
            </div>
            <div className={styles.heroChecks}>
              {['No credit card required', 'All 6 medical courses', 'AI-powered study help', 'Live 1v1 battle arena'].map(t => (
                <span key={t} className={styles.heroCheck}>
                  <span className={styles.greenDot} /> {t}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.demoCard}>
              <div className={styles.demoHeader}>
                <span className={styles.demoBadge}>INTERACTIVE CASE DEMO</span>
                <span className={styles.demoCoins}>🪙 +50 Coins</span>
              </div>
              <p className={styles.demoQuestion}>{DEMO_MCQ.question}</p>
              <div className={styles.demoOptions}>
                {DEMO_MCQ.options.map((opt, idx) => {
                  let optStyle = styles.demoOption;
                  if (demoAnswered) {
                    if (idx === DEMO_MCQ.correctIndex) optStyle += ` ${styles.demoOptionCorrect}`;
                    else if (idx === demoSelected) optStyle += ` ${styles.demoOptionIncorrect}`;
                  } else if (demoSelected === idx) {
                    optStyle += ` ${styles.demoOptionSelected}`;
                  }
                  return (
                    <button
                      key={idx}
                      className={optStyle}
                      onClick={() => handleDemoSelect(idx)}
                      disabled={demoAnswered}
                    >
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>

              {demoAnswered && (
                <div className={styles.demoExplanation}>
                  <strong>{demoSelected === DEMO_MCQ.correctIndex ? '🎉 Correct!' : '❌ Incorrect'}</strong>
                  <p>{demoSelected === DEMO_MCQ.correctIndex ? DEMO_MCQ.explanation : DEMO_MCQ.incorrectExplanation}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Floating Mini Ribbon */}
        <div className={styles.miniRibbon}>
          <div className={styles.ribbonItem}><strong>6</strong><span>Courses</span></div>
          <div className={styles.ribbonDivider} />
          <div className={styles.ribbonItem}><strong>131+</strong><span>Subjects</span></div>
          <div className={styles.ribbonDivider} />
          <div className={styles.ribbonItem}><strong>8,000+</strong><span>Verified MCQs</span></div>
          <div className={styles.ribbonDivider} />
          <div className={styles.ribbonItem}><strong>94%</strong><span>Pass Rate</span></div>
          <div className={styles.ribbonDivider} />
          <div className={styles.ribbonItem}><strong>1,200+</strong><span>Active Students</span></div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>HOW IT WORKS</span>
          <h2 className={styles.sectionTitleBold}>Start in 4 Simple Steps</h2>
          <p className={styles.sectionSubtitle}>Get from zero to exam-ready faster with structured medical practice</p>
        </div>
        <div className={styles.stepsGrid}>
          {HOW_IT_WORKS.map((s) => (
            <div key={s.step} className={styles.stepCard}>
              <div className={styles.stepNum}>{s.step}</div>
              <h3 className={styles.stepTitle}>{s.title}</h3>
              <p className={styles.stepDesc}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BY THE NUMBERS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>BY THE NUMBERS</span>
          <h2 className={styles.sectionTitleBold}>Built for SAMU Students</h2>
          <p className={styles.sectionSubtitle}>Designed specifically around the SAMU medical university syllabus & exam standards</p>
        </div>
        <div className={styles.statsGrid}>
          {STATS.map(s => (
            <div key={s.label} className={styles.statCard}>
              <div className={styles.statIconWrapper} style={{ background: s.color + '15' }}>
                <s.icon size={22} color={s.color} />
              </div>
              <div className={styles.statVal}>{s.val}</div>
              <div className={styles.statLabel}>{s.label}</div>
              <div className={styles.statSub}>{s.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── ACADEMIC CURRICULUM ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>ACADEMIC CURRICULUM</span>
          <h2 className={styles.sectionTitleBold}>All 6 Years of Medical Education</h2>
          <p className={styles.sectionSubtitle}>Browse subjects and topics from each course year — organized exactly like your syllabus</p>
        </div>
        <div className={styles.coursesGrid}>
          {COURSES.map((c) => (
            <div key={c.num} className={styles.curriculumCard} style={{ borderLeft: `4px solid ${c.color}` }}>
              <div className={styles.curriculumIcon} style={{ background: c.color }}>
                <c.icon size={18} color="#fff" />
              </div>
              <div className={styles.curriculumDetails}>
                <h3 className={styles.curriculumTitle}>{c.title}</h3>
                <p className={styles.curriculumHighlight}>{c.highlight}</p>
                <p className={styles.curriculumMeta}>{c.subjects}</p>
              </div>
              <div className={styles.curriculumArrow}>
                <ArrowRight size={16} color={c.color} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <Link to="/register" className={styles.primaryBtn}>
            Access All Courses Free &rarr;
          </Link>
        </div>
      </section>

      {/* ── PRACTICE SUITE ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>PRACTICE SUITE</span>
          <h2 className={styles.sectionTitleBold}>High-Yield Exam Preparation Tools</h2>
          <p className={styles.sectionSubtitle}>Every tool engineered to help you conquer high-stakes medical examinations</p>
        </div>
        <div className={styles.suiteGrid}>
          {PRACTICE_SUITE.map((tool) => (
            <div key={tool.title} className={styles.suiteCard}>
              <div className={styles.suiteTop}>
                <span className={styles.suiteBadge}>{tool.badge}</span>
                <span className={styles.suiteBadgeSub}>{tool.badgeSub}</span>
              </div>
              <h3 className={styles.suiteTitle}>{tool.title}</h3>
              <p className={styles.suiteDesc}>{tool.desc}</p>
              <div className={styles.suiteAction}>
                <Link to={tool.btnTo} className={styles.suiteBtn}>
                  {tool.btnText} &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SUBJECT DIRECTORY ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>SUBJECT DIRECTORY</span>
          <h2 className={styles.sectionTitleBold}>Most Tested Clinical Disciplines</h2>
          <p className={styles.sectionSubtitle}>Target your prep on the high-yield topics that appear most frequently on final exams</p>
        </div>
        <div className={styles.disciplinesGrid}>
          {CLINICAL_DISCIPLINES.map((d) => (
            <div key={d.title} className={styles.disciplineCard}>
              <div className={styles.disciplineTop}>
                <span className={styles.discBadge}>{d.mcqs}</span>
                <span className={styles.yieldBadge}>{d.yieldRate}</span>
              </div>
              <h3 className={styles.discTitle}>{d.title}</h3>
              <p className={styles.discDesc}>{d.desc}</p>
              <div className={styles.discFooter}>
                <span className={styles.discCourse}>{d.course}</span>
                <Link to="/register" className={styles.discAction}>Practice &rarr;</Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PLATFORM CAPABILITIES ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>PLATFORM CAPABILITIES</span>
          <h2 className={styles.sectionTitleBold}>Everything You Need to Excel</h2>
          <p className={styles.sectionSubtitle}>Built exclusively for SAMU medical students with smart tech & clinical insights</p>
        </div>
        <div className={styles.capabilitiesGrid}>
          {PLATFORM_CAPABILITIES.map((cap) => (
            <div key={cap.title} className={styles.capCard}>
              <div className={styles.capIconWrapper}>
                <cap.icon size={20} color="#4338CA" />
              </div>
              <h3 className={styles.capTitle}>{cap.title}</h3>
              <p className={styles.capDesc}>{cap.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE ADVANTAGE (Old Study Files vs. SAMU MCQs) ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <span className={styles.sectionPill}>THE ADVANTAGE</span>
          <h2 className={styles.sectionTitleBold}>Old Study Files vs. SAMU MCQs</h2>
          <p className={styles.sectionSubtitle}>See why thousands of students switched from PDF files to the interactive platform</p>
        </div>
        <div className={styles.tableContainer}>
          <table className={styles.advantageTable}>
            <thead>
              <tr>
                <th>Feature</th>
                <th>Traditional PDFs & Telegram Files</th>
                <th className={styles.samuTh}>✨ SAMU MCQs Platform</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.feature}>
                  <td className={styles.featureCell}>{row.feature}</td>
                  <td className={styles.tradCell}>
                    <span className={styles.crossIcon}>✕</span> {row.traditional}
                  </td>
                  <td className={styles.samuCell}>
                    <span className={styles.checkIcon}>✓</span> {row.samu}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FREQUENTLY ASKED QUESTIONS ── */}
      <section className={styles.section}>
        <div className={styles.sectionHeaderCenter}>
          <h2 className={styles.sectionTitleBold}>Common Questions & Answers</h2>
        </div>
        <div className={styles.faqList}>
          {FAQS.map((f) => <FAQ key={f.q} {...f} />)}
        </div>
        <div style={{ textAlign: 'center', marginTop: 36 }}>
          <p style={{ color: '#64748B', fontSize: 14, marginBottom: 14 }}>Still have questions about your subjects or exam prep?</p>
          <a href="https://t.me/samu_mcqs" target="_blank" rel="noopener noreferrer" className={styles.telegramBtn}>
            <MessageCircle size={16} />
            Join our Official Telegram Channel
          </a>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className={styles.ctaWrapper}>
        <div className={styles.ctaBox}>
          <div className={styles.ctaBadge}>⚡ 1,200+ students actively practicing</div>
          <h2 className={styles.ctaTitle}>Ready to Pass Your Exams with Distinction?</h2>
          <p className={styles.ctaSub}>Join your classmates today. Free registration, instant access to test questions, and full mobile support.</p>
          <div className={styles.ctaBtns}>
            <Link to="/register" className={styles.ctaPrimaryBtn}>
              Get Started Free Today &rarr;
            </Link>
            <Link to="/login" className={styles.ctaSecondaryBtn}>
              Student Sign In
            </Link>
          </div>
          <div className={styles.ctaFeatures}>
            {['Free forever plan', 'Zero setup required', 'Covers all 6 course years', 'AI medical tutor included'].map((item) => (
              <span key={item} className={styles.ctaCheck}>
                <CheckCircle2 size={14} color="#10B981" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <div className={styles.footerLogo}>
              <BookOpen size={18} color="#fff" />
            </div>
            <div>
              <span className={styles.footerLogoText}>SAMU MCQs</span>
              <p className={styles.footerLogoSub}>Medical education made smart & accessible</p>
            </div>
          </div>

          <div className={styles.footerColumns}>
            <div className={styles.footerCol}>
              <h4>PRACTICE & EXAMS</h4>
              <Link to="/home">All Courses & Subjects</Link>
              <Link to="/clinical-case">Situational Tasks</Link>
              <Link to="/clinical-case">Clinical Case Studies</Link>
              <Link to="/results">Exam Score Reports</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>SMART TOOLS</h4>
              <Link to="/battle">1v1 Battle Arena</Link>
              <Link to="/ask-ai">AI Medical Tutor</Link>
              <Link to="/drugs">Drug Database Index</Link>
              <Link to="/leaderboard">Rankings & Streak</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>SUPPORT & HELP</h4>
              <Link to="/help">Student Help Desk</Link>
              <Link to="/guidance">Study Guidance & FAQs</Link>
              <a href="https://t.me/samu_mcqs" target="_blank" rel="noopener noreferrer">Telegram Community</a>
              <Link to="/verify/demo">Verify Certificate</Link>
            </div>
            <div className={styles.footerCol}>
              <h4>ACCOUNT & PLANS</h4>
              <Link to="/subscribe">Subscription Plans</Link>
              <Link to="/register">Create Student Account</Link>
              <Link to="/login">Sign In to Portal</Link>
              <Link to="/profile">Student Profile</Link>
            </div>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>© 2026 SAMU MCQs. All rights reserved. Built for SAMU Medical Students.</p>
        </div>
      </footer>
    </div>
  );
}
