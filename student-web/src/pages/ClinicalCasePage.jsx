import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { getCaseOfTheDay } from '../data/clinicalCases';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Stethoscope, Clock, ShieldAlert, Award, ChevronRight, Activity, Beaker, CheckCircle2 } from 'lucide-react';
import styles from './ClinicalCasePage.module.css';

export default function ClinicalCasePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [dailyCase, setDailyCase] = useState(null);
  const [step, setStep] = useState('presentation'); // presentation -> questions -> answer
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    const data = getCaseOfTheDay();
    setDailyCase(data);
    
    // Check if already completed today
    if (user && data) {
      const storageKey = `samu_case_${user.id}_${data.id}`;
      if (localStorage.getItem(storageKey)) {
        setCompleted(true);
        setStep('answer');
      }
    }
  }, [user]);

  const handleComplete = async () => {
    if (completed || !user || !dailyCase) return;
    
    // Mark as completed locally
    const storageKey = `samu_case_${user.id}_${dailyCase.id}`;
    localStorage.setItem(storageKey, 'true');
    setCompleted(true);
    setStep('answer');

    // Add coins (optimistic local state logic, plus db call if possible)
    try {
      // Fetch current
      const { data } = await supabase.from('leaderboard_monthly').select('total_points').eq('user_id', user.id).single();
      if (data) {
        await supabase.from('leaderboard_monthly')
          .update({ total_points: (data.total_points || 0) + dailyCase.answer.coins })
          .eq('user_id', user.id);
      }
    } catch(e) {
      console.log('Case completion sync error', e);
    }
  };

  if (!dailyCase) return <div className={styles.page}><Navbar /><div className={styles.loading}>Loading case...</div></div>;

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}><Stethoscope size={24} color="#fff" /></div>
          <div>
            <h1 className={styles.title}>Case of the Day</h1>
            <p className={styles.subtitle}>Test your clinical reasoning</p>
          </div>
        </div>

        {/* Status Banner */}
        {completed && (
          <div className={styles.completedBanner}>
            <CheckCircle2 size={20} color="#10B981" />
            <div>
              <div style={{ fontWeight: 800 }}>Case Completed!</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>You earned +{dailyCase.answer.coins} Coins</div>
            </div>
          </div>
        )}

        {/* Case Info Card */}
        <div className={styles.caseCard}>
          <div className={styles.caseMetaRow}>
            <span className={styles.badge}>{dailyCase.speciality}</span>
            <span className={styles.badgeDark}>{dailyCase.difficulty}</span>
          </div>
          <h2 className={styles.caseTitle}>{dailyCase.title}</h2>
          
          <div className={styles.patientBox}>
            <div className={styles.pItem}><span>Age</span> {dailyCase.patient.age}</div>
            <div className={styles.pItem}><span>Sex</span> {dailyCase.patient.gender}</div>
            <div className={styles.pItem}><span>Occ</span> {dailyCase.patient.occupation}</div>
          </div>
        </div>

        {/* Flow Content */}
        <div className={styles.flowContent}>
          {/* STEP 1: PRESENTATION */}
          {step === 'presentation' && (
            <div className={styles.stepContainer}>
              <Section title="Presentation" icon={<Clock size={18} color="#3B82F6" />}>
                <p className={styles.text}>{dailyCase.presentation}</p>
              </Section>
              
              <Section title="Vitals" icon={<Activity size={18} color="#EF4444" />}>
                <div className={styles.grid2}>
                  {Object.entries(dailyCase.vitals).map(([k,v]) => (
                    <div key={k} className={styles.vitalBox}>
                      <span className={styles.vLabel}>{k}</span>
                      <span className={styles.vValue}>{v}</span>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Key Findings" icon={<ShieldAlert size={18} color="#F59E0B" />}>
                <ul className={styles.listStyle}>
                  {dailyCase.physicalFindings.slice(0,3).map((f,i) => <li key={i}>{f}</li>)}
                </ul>
              </Section>

              <button className="btn btn-primary" style={{ width: '100%', marginTop: 10 }} onClick={() => setStep('questions')}>
                Review Investigations <ChevronRight size={16} />
              </button>
            </div>
          )}

          {/* STEP 2: QUESTIONS / INVESTIGATIONS */}
          {step === 'questions' && (
            <div className={styles.stepContainer}>
              <Section title="Lab Findings" icon={<Beaker size={18} color="#8B5CF6" />}>
                <ul className={styles.listStyle}>
                  {dailyCase.labFindings.map((f,i) => <li key={i}>{f}</li>)}
                </ul>
              </Section>
              
              <Section title="Imaging" icon={<Activity size={18} color="#06B6D4" />}>
                <ul className={styles.listStyle}>
                  {dailyCase.imagingFindings.map((f,i) => <li key={i}>{f}</li>)}
                </ul>
              </Section>

              <div className={styles.questionsBox}>
                <h3>Clinical Questions</h3>
                <p>1. {dailyCase.questions.diagnosis}</p>
                <p>2. {dailyCase.questions.investigation}</p>
                <p>3. {dailyCase.questions.treatment}</p>
              </div>

              <div className={styles.actionsRow}>
                <button className="btn btn-ghost" onClick={() => setStep('presentation')}>Back</button>
                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleComplete}>
                  Reveal Answer
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: ANSWER */}
          {step === 'answer' && (
            <div className={styles.stepContainer}>
              <div className={styles.answerHeader}>
                <Award size={24} color="#FBBF24" />
                <h3>Diagnosis Revealed</h3>
              </div>
              
              <div className={styles.answerBox}>
                <div className={styles.ansGroup}>
                  <div className={styles.ansLabel}>Diagnosis</div>
                  <div className={styles.ansText} style={{ color: '#10B981', fontWeight: 800 }}>{dailyCase.answer.diagnosis}</div>
                </div>
                <div className={styles.ansGroup}>
                  <div className={styles.ansLabel}>Gold Standard Investigation</div>
                  <div className={styles.ansText}>{dailyCase.answer.investigation}</div>
                </div>
                <div className={styles.ansGroup}>
                  <div className={styles.ansLabel}>Treatment Plan</div>
                  <div className={styles.ansText}>{dailyCase.answer.treatment}</div>
                </div>
              </div>

              <Section title="Explanation" icon={<Stethoscope size={18} color="#3B82F6" />}>
                <p className={styles.text}>{dailyCase.answer.explanation}</p>
              </Section>

              <Section title="High Yield Exam Points" icon={<Award size={18} color="#F59E0B" />}>
                <ul className={styles.examList}>
                  {dailyCase.answer.highYieldPoints.map((ep, i) => (
                    <li key={i}>
                      <div className={styles.examBullet}></div>
                      {ep}
                    </li>
                  ))}
                </ul>
              </Section>
              
              <Section title="Differentials" icon={<ShieldAlert size={18} color="#EF4444" />}>
                <ul className={styles.listStyle}>
                  {dailyCase.answer.differentials.map((d,i) => <li key={i}>{d}</li>)}
                </ul>
              </Section>

            </div>
          )}
        </div>

        <div style={{ height: 'calc(var(--nav-h) + 16px)' }} />
      </div>
      <BottomNav />
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        {icon}
        <h3 className={styles.sectionTitle}>{title}</h3>
      </div>
      <div className={styles.sectionBody}>
        {children}
      </div>
    </div>
  );
}
