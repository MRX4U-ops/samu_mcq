import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { MCQ_REPOSITORY } from '../data/index.js';
import { recordAttempt } from '../lib/revisionEngine';
import Navbar from '../components/Navbar';
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle, Trophy, RotateCcw, Home } from 'lucide-react';
import styles from './QuizPage.module.css';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const cleanOption = (opt) => {
  if (typeof opt !== 'string') return opt;
  let cleaned = opt.replace(/^[\*\s\\"'`\/]+/, '');
  cleaned = cleaned.replace(/^[a-zA-Z][\.\)\-]\s*/, '');
  cleaned = cleaned.replace(/^[\*\s\\"'`\/]+/, '');
  cleaned = cleaned.replace(/[\*\s\\"'`\/]+$/, '');
  return cleaned || opt;
};

export default function QuizPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { topicId, subjectId, title = 'Quiz', mode = 'test' } = state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizDone, setQuizDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const timerRef = useRef(null);

  // Load questions
  useEffect(() => {
    if (!state) { navigate('/home'); return; }
    loadQuestions();
  }, []);

  // Timer
  useEffect(() => {
    if (loading || quizDone) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); finishQuiz(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [loading, quizDone]);

  function loadQuestions() {
    setLoading(true);

    // 1. Try local MCQ_REPOSITORY
    let localData = null;

    // CHECK IF MASTER TOPIC
    const isMaster = topicId && typeof topicId === 'string' && topicId.startsWith('master-');
    if (isMaster) {
      const sId = topicId.replace('master-', '');
      let pool = [];
      if (MCQ_REPOSITORY[sId]) {
        Object.keys(MCQ_REPOSITORY[sId]).forEach(tKey => {
          const tData = MCQ_REPOSITORY[sId][tKey];
          if (Array.isArray(tData)) {
            pool = [...pool, ...tData];
          } else if (tData && typeof tData === 'object') {
            const reqMode = mode === 'situational' ? 'situational' : 'test';
            if (Array.isArray(tData[reqMode])) pool = [...pool, ...tData[reqMode]];
          }
        });
      }

      if (pool.length > 0) {
        // Shuffle and limit to 50
        const shuffledPool = shuffle(pool).slice(0, 50);
        const mapped = shuffledPool.map((q, idx) => {
          const rawOpts = q.options || [];
          const cleanedOpts = rawOpts.map(cleanOption);
          const correctValue = cleanedOpts[q.correctIndex !== undefined ? q.correctIndex : 0];
          const shuffledOpts = shuffle([...cleanedOpts]);
          return {
            _id: `master-${idx}`,
            question: q.question || '',
            options: shuffledOpts,
            correctIndex: shuffledOpts.indexOf(correctValue),
          };
        });
        setQuestions(mapped);
        setLoading(false);
        return;
      }
    }

    if (subjectId && MCQ_REPOSITORY[subjectId]) {
      // Try with topicId key
      localData = MCQ_REPOSITORY[subjectId][topicId];
    }
    if (!localData) {
      // Scan all subjects
      for (const sKey of Object.keys(MCQ_REPOSITORY)) {
        if (MCQ_REPOSITORY[sKey][topicId]) {
          localData = MCQ_REPOSITORY[sKey][topicId];
          break;
        }
      }
    }

    if (localData) {
      let rawQuestions = [];
      if (Array.isArray(localData)) {
        rawQuestions = localData;
      } else {
        rawQuestions = localData[mode] || localData.test || [];
      }

      if (rawQuestions.length > 0) {
        const mapped = rawQuestions.map((q, idx) => {
          const rawOpts = q.options || [];
          const cleanedOpts = rawOpts.map(cleanOption);
          const correctValue = cleanedOpts[q.correctIndex !== undefined ? q.correctIndex : 0];
          const shuffled = shuffle([...cleanedOpts]);
          return {
            _id: `local-${idx}`,
            question: q.question || '',
            options: shuffled,
            correctIndex: shuffled.indexOf(correctValue),
          };
        });
        setQuestions(mapped);
        setLoading(false);
        return;
      }
    }

    // 2. Fallback to Supabase
    loadFromSupabase();
  }

  async function loadFromSupabase() {
    try {
      const taskType = mode === 'situational' ? 'situational_task' : 'test_question';
      const { data, error: err } = await supabase
        .from('mcqs')
        .select('id, question, options, correct_index')
        .eq('topic_id', state?.topicDbId || topicId)
        .eq('task_type', taskType);

      if (err || !data || data.length === 0) {
        setError('No questions found for this topic.');
        setLoading(false);
        return;
      }

      const mapped = data.map(q => {
        const rawOpts = q.options || [];
        const cleanedOpts = rawOpts.map(cleanOption);
        const correctValue = cleanedOpts[q.correct_index || 0];
        const shuffled = shuffle(cleanedOpts);
        return {
          _id: q.id,
          question: q.question,
          options: shuffled,
          correctIndex: shuffled.indexOf(correctValue),
        };
      });
      setQuestions(mapped);
    } catch (e) {
      setError('Failed to load questions. Please try again.');
    }
    setLoading(false);
  }

  function handleSelect(optionIdx) {
    if (submitted) return;
    setSelected(optionIdx);
    
    const isCorrect = optionIdx === questions[currentIdx]?.correctIndex;
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = { selected: optionIdx, isCorrect };
    setUserAnswers(newAnswers);
    setSubmitted(true);

    // Record in Revision Engine
    recordAttempt({
      questionId: questions[currentIdx]?._id,
      isCorrect,
      subjectId: subjectId,
      topicId: topicId,
      subjectName: title,
      questionText: questions[currentIdx]?.question
    });
  }

  function handleSkip() {
    const newAnswers = [...userAnswers];
    newAnswers[currentIdx] = { selected: null, isCorrect: false, skipped: true };
    setUserAnswers(newAnswers);
    
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      const nextAns = newAnswers[currentIdx + 1];
      setSelected(nextAns?.selected ?? null);
      setSubmitted(nextAns !== undefined && !nextAns.skipped);
    } else {
      finishQuiz();
    }
  }

  function handleNext() {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      const existingAns = userAnswers[currentIdx + 1];
      setSelected(existingAns?.selected ?? null);
      setSubmitted(existingAns !== undefined && !existingAns.skipped);
    } else {
      finishQuiz();
    }
  }

  function handlePrev() {
    if (currentIdx > 0) {
      setCurrentIdx(i => i - 1);
      const existingAns = userAnswers[currentIdx - 1];
      setSelected(existingAns?.selected ?? null);
      setSubmitted(existingAns !== undefined && !existingAns.skipped);
    }
  }

  function finishQuiz() {
    clearInterval(timerRef.current);
    setQuizDone(true);
  }

  function formatTime(s) {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, '0')}`;
  }

  const score = userAnswers.filter(a => a?.isCorrect).length;
  const pct = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;
  const modeLabel = mode === 'situational' ? 'Situational Task' : 'Test Questions';

  // ─── LOADING ──────────────────────────────────
  if (loading) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.loadingCenter}>
        <div className="spinner" />
        <p>Loading questions...</p>
      </div>
    </div>
  );

  // ─── ERROR ────────────────────────────────────
  if (error) return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.loadingCenter}>
        <XCircle size={40} color="var(--accent-red)" />
        <p style={{ color: 'var(--text-secondary)' }}>{error}</p>
        <button className="btn btn-ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    </div>
  );

  // ─── RESULTS ──────────────────────────────────
  if (quizDone) {
    const grade = pct >= 75 ? 'Excellent' : pct >= 50 ? 'Good' : 'Needs Work';
    const gradeColor = pct >= 75 ? 'var(--color-accent)' : pct >= 50 ? 'var(--color-warning)' : 'var(--color-danger)';

    return (
      <div className={styles.page}>
        <Navbar />
        <div className={styles.resultsContainer}>
          <div className={styles.resultsCard}>
            <div className={styles.trophyWrap}><Trophy size={40} color="var(--color-warning)" /></div>
            <h1 className={styles.resultsTitle}>Quiz Complete!</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>{title} · {modeLabel}</p>

            <div className={styles.scoreCircle} style={{ borderColor: gradeColor }}>
              <span className={styles.scoreNum} style={{ color: gradeColor }}>{pct}%</span>
              <span className={styles.scoreLabel}>{grade}</span>
            </div>

            <div className={styles.statsRow}>
              <div className={styles.statBox}>
                <span style={{ color: 'var(--color-accent)', fontSize: 22, fontWeight: 900 }}>{score}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>CORRECT</span>
              </div>
              <div className={styles.statBox}>
                <span style={{ color: 'var(--color-danger)', fontSize: 22, fontWeight: 900 }}>{questions.length - score}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>WRONG</span>
              </div>
              <div className={styles.statBox}>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)' }}>{questions.length}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: 12, fontWeight: 700 }}>TOTAL</span>
              </div>
            </div>

            {/* Answer Review */}
            <div className={styles.reviewSection}>
              <h3 className={styles.reviewTitle}>Review Answers</h3>
              {questions.map((q, qi) => {
                const ans = userAnswers[qi];
                const correct = q.correctIndex;
                const userSel = ans?.selected;
                return (
                  <div key={q._id} className={styles.reviewItem}>
                    <div className={styles.reviewQ}>
                      <span className={styles.reviewNum}>Q{qi + 1}</span>
                      <p className={styles.reviewQText}>{q.question}</p>
                      {ans?.isCorrect
                        ? <CheckCircle2 size={18} color="var(--color-accent)" style={{ flexShrink: 0 }} />
                        : <XCircle size={18} color="var(--color-danger)" style={{ flexShrink: 0 }} />}
                    </div>
                    <div className={styles.reviewOptions}>
                      {q.options.map((opt, oi) => {
                        const isCorrectOpt = oi === correct;
                        const isUserOpt = oi === userSel;
                        let optClass = styles.reviewOpt;
                        if (isCorrectOpt) optClass += ' ' + styles.correctOpt;
                        else if (isUserOpt && !ans?.isCorrect) optClass += ' ' + styles.wrongOpt;
                        return (
                          <div key={oi} className={optClass}>
                            {opt}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className={styles.resultActions}>
              <button className="btn btn-ghost" onClick={() => { setQuizDone(false); setCurrentIdx(0); setSelected(null); setSubmitted(false); setUserAnswers([]); setTimeLeft(30*60); }}>
                <RotateCcw size={16} /> Retry
              </button>
              <button className="btn btn-primary" onClick={() => navigate('/home')}>
                <Home size={16} /> Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── QUIZ ─────────────────────────────────────
  const q = questions[currentIdx];
  const progress = ((currentIdx + 1) / questions.length) * 100;
  const timerColor = timeLeft < 60 ? '#EF4444' : timeLeft < 300 ? '#F59E0B' : 'var(--text-secondary)';

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.quizContainer}>
        {/* Header */}
        <div className={styles.quizHeader}>
          <button className={styles.qBackBtn} onClick={() => navigate(-1)}>
            <ArrowLeft size={18} />
          </button>
          <div className={styles.quizMeta}>
            <span className={styles.quizTitle}>{title}</span>
            <span className={styles.quizMode}>{modeLabel}</span>
          </div>
          <div className={styles.timer} style={{ color: timerColor }}>
            <Clock size={15} />
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div className={styles.progressWrap}>
          <div className="progress-bar" style={{ flex: 1 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className={styles.qCounter}>{currentIdx + 1}/{questions.length}</span>
        </div>

        {/* Question */}
        <div className={styles.questionCard}>
          <p className={styles.questionText}>{q?.question}</p>
        </div>

        <div className={styles.optionsList}>
          {q?.options?.map((opt, i) => {
            let cls = styles.option;
            if (submitted) {
              if (i === q.correctIndex) cls += ' ' + styles.optionCorrect;
              else if (i === selected) cls += ' ' + styles.optionWrong;
              else cls += ' ' + styles.optionDimmed;
            } else if (i === selected) {
              cls += ' ' + styles.optionSelected;
            }
            return (
              <button key={i} className={cls} onClick={() => handleSelect(i)} disabled={submitted}>
                <span className={styles.optionLetter}>{String.fromCharCode(65 + i)}</span>
                <span className={styles.optionText}>{opt}</span>
                {submitted && i === q.correctIndex && <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />}
                {submitted && i === selected && i !== q.correctIndex && <XCircle size={18} color="#EF4444" style={{ flexShrink: 0 }} />}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className={styles.quizActions}>
          <button className="btn btn-ghost" onClick={handlePrev} disabled={currentIdx === 0}>
            <ArrowLeft size={16} /> Prev
          </button>

          {!submitted ? (
            <button className="btn btn-ghost" onClick={handleSkip} style={{ color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)' }}>
              Skip Question <ArrowRight size={16} />
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleNext}>
              {currentIdx < questions.length - 1 ? 'Next' : 'Finish'} <ArrowRight size={16} />
            </button>
          )}
        </div>

        {/* Finish early */}
        {!submitted && (
          <div style={{ textAlign: 'center', marginTop: 12 }}>
            <button className="btn btn-ghost" style={{ fontSize: 13, padding: '8px 16px' }} onClick={finishQuiz}>
              Finish Quiz Early
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
