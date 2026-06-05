import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import BottomNav from '../components/BottomNav';
import { getStats, getRevisionQueue, getForgetRisk, getWeakSubjects } from '../lib/revisionEngine';
import { Brain, TrendingDown, Target, Zap, ChevronRight, Activity, AlertTriangle } from 'lucide-react';
import styles from './RevisionEnginePage.module.css';

export default function RevisionEnginePage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ total:0, correct:0, wrong:0, accuracy:0, questionCount:0 });
  const [queue, setQueue] = useState([]);
  const [riskCount, setRiskCount] = useState(0);
  const [weakSubjects, setWeakSubjects] = useState([]);

  useEffect(() => {
    setStats(getStats());
    setQueue(getRevisionQueue());
    setRiskCount(getForgetRisk());
    setWeakSubjects(getWeakSubjects());
  }, []);

  const startRevision = () => {
    // Collect up to 20 questions that are due
    const toRevise = queue.filter(q => q.isDue).slice(0, 20);
    if (toRevise.length === 0) {
      alert("You are all caught up! Practice new questions to build your revision queue.");
      return;
    }
    
    // Convert to format QuizPage expects or just navigate to a custom quiz mode
    // Because QuizPage relies on topicId, we could pass an array of topicIds, 
    // or we'd need to modify QuizPage to accept an array of raw question IDs.
    // For now, we'll navigate to the first weak topic if available, otherwise just home
    if (weakSubjects.length > 0 && weakSubjects[0].weakTopics.length > 0) {
      const targetTopic = weakSubjects[0].weakTopics[0].id;
      navigate('/quiz', { state: { topicId: targetTopic, title: 'Smart Revision', mode: 'test' } });
    } else {
      navigate('/home');
    }
  };

  const handleTopicClick = (topicId) => {
    navigate('/quiz', { state: { topicId, title: 'Weak Area Revision', mode: 'test' } });
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerIcon}><Brain size={24} color="#fff" /></div>
          <div>
            <h1 className={styles.title}>Smart Revision</h1>
            <p className={styles.subtitle}>AI-powered spaced repetition</p>
          </div>
        </div>

        {/* Hero Alert */}
        <div className={styles.heroAlert}>
          <div className={styles.heroLeft}>
            <Zap size={24} color="#FBBF24" />
            <div>
              <div className={styles.heroAlertTitle}>
                {riskCount > 0 ? `You are likely to forget ${riskCount} questions` : "Your memory is fresh!"}
              </div>
              <div className={styles.heroAlertSub}>
                {riskCount > 0 ? "Review them now to solidify your memory." : "Keep practicing new topics."}
              </div>
            </div>
          </div>
          <button className={`btn btn-primary ${styles.heroBtn}`} onClick={startRevision}>
            Start Revision
          </button>
        </div>

        {/* Stats Grid */}
        <div className={styles.statsGrid}>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>TRACKED Qs</div>
            <div className={styles.statVal}>{stats.questionCount}</div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>AVG ACCURACY</div>
            <div className={styles.statVal} style={{ color: stats.accuracy < 60 ? '#EF4444' : '#10B981' }}>
              {stats.accuracy}%
            </div>
          </div>
          <div className={styles.statBox}>
            <div className={styles.statLabel}>NEEDS REVIEW</div>
            <div className={styles.statVal} style={{ color: '#FBBF24' }}>{queue.filter(q => q.isDue).length}</div>
          </div>
        </div>

        {/* Weak Subject Detector */}
        <div className={styles.sectionHeader}>
          <span className="section-label">📉 WEAK SUBJECT DETECTOR</span>
        </div>
        
        {weakSubjects.length === 0 ? (
          <div className={styles.emptyState}>
            <Activity size={32} color="var(--text-muted)" />
            <p>Practice more questions to generate your weakness report.</p>
          </div>
        ) : (
          <div className={styles.weaknessList}>
            {weakSubjects.slice(0, 3).map((sub, i) => (
              <div key={sub.id} className={styles.weakSubjectCard}>
                <div className={styles.wsTop}>
                  <div className={styles.wsInfo}>
                    {i === 0 && <span className={styles.wsAlert}><AlertTriangle size={14} /> Top Weakness</span>}
                    <h3 className={styles.wsName}>{sub.name}</h3>
                  </div>
                  <div className={styles.wsAcc} style={{ color: sub.accuracy < 50 ? '#EF4444' : '#F59E0B' }}>
                    {sub.accuracy}%
                  </div>
                </div>
                
                {sub.weakTopics.length > 0 && (
                  <div className={styles.wsTopics}>
                    <div className={styles.wsTopicsLabel}>Topics to revise:</div>
                    {sub.weakTopics.map(t => (
                      <button key={t.id} className={styles.wsTopicBtn} onClick={() => handleTopicClick(t.id)}>
                        <span>{t.id.replace(/-/g, ' ')}</span>
                        <div className={styles.wsTopicRight}>
                          <span className={styles.wsTopicAcc}>{t.accuracy}%</span>
                          <ChevronRight size={14} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Memory Queue Preview */}
        <div className={styles.sectionHeader} style={{ marginTop: 24 }}>
          <span className="section-label">🧠 MEMORY QUEUE</span>
        </div>
        
        <div className={styles.queueList}>
          {queue.slice(0, 5).map(q => (
            <div key={q.questionId} className={styles.queueItem}>
              <div className={styles.queueTop}>
                <span className={styles.queueSub}>{q.subjectName}</span>
                <span className={`${styles.memBadge} ${q.memLevel === 1 ? styles.mem1 : q.memLevel === 2 ? styles.mem2 : styles.mem3}`}>
                  {q.memLabel}
                </span>
              </div>
              <p className={styles.queueText}>{q.questionText.length > 80 ? q.questionText.substring(0,80) + '...' : q.questionText}</p>
              <div className={styles.queueMeta}>
                <span style={{ color: q.isDue ? '#EF4444' : 'var(--text-muted)' }}>
                  {q.isDue ? 'Due now' : `Due in ${Math.abs(Math.floor(q.daysSince - q.interval))} days`}
                </span>
                <span>•</span>
                <span>{q.wrong} mistakes</span>
              </div>
            </div>
          ))}
          {queue.length === 0 && (
            <div className={styles.emptyState}>No items in your memory queue yet.</div>
          )}
        </div>

        <div style={{ height: 'calc(var(--nav-h) + 16px)' }} />
      </div>
      <BottomNav />
    </div>
  );
}
