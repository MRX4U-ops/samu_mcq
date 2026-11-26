import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ArrowLeft, BookOpen, FileText, Lock, Star, Eye, History, X, CheckCircle2, XCircle, Clock, Trophy, RotateCcw } from 'lucide-react';
import styles from './CoursePage.module.css';
import { MCQ_REPOSITORY, ALL_SUBJECTS } from '../data';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

// Subject local ID mapping (matching mobile app ACADEMIC_CURRICULUM and local repository keys)
const CURRICULUM_MAPPING = [
  { match: 'clinic anatomy', key: 's-2-2' },
  { match: 'clinical anatomy', key: 's-2-2' },
  { match: 'biochemistry module 1', key: 's-2-0' },
  { match: 'biochemistry mod.1', key: 's-2-0' },
  { match: 'biochemistry module 2', key: 's-2-1' },
  { match: 'biochemistry mod.2', key: 's-2-1' },
  { match: 'biochemistry', key: 's-2-0' },
  { match: 'histology, cytology and embryology module 1', key: 's-2-8' },
  { match: 'histology', key: 's-2-8' },
  { match: 'microbiology, virology, parasitology and immunology-1', key: 's-2-9' },
  { match: 'microbiology, virology, parasitology and immunology-2', key: 's-2-10' },
  { match: 'microbiology', key: 's-2-9' },
  { match: 'pathology', key: 's-2-10' },
  { match: 'medical radiology', key: 's-3-8' },
  { match: 'radiology', key: 's-3-8' },
  { match: 'medical biology with elements of ecology', key: 's-1-8' },
  { match: 'medical biology', key: 's-1-8' },
  { match: 'medical chemistry', key: 's-1-9' },
  { match: 'chemistry', key: 's-1-9' },
  { match: 'medical and biological physics', key: 's-1-10' },
  { match: 'physics', key: 's-1-10' },
];

const COURSE_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4'];

export default function SubjectPage() {
  const { subjectId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isSubscribed } = useAuth();
  
  const [subjectTitle, setSubjectTitle] = useState(state?.title || 'Subject');
  const courseNum = state?.courseNum || '1';
  const courseId = state?.courseId;
  const color = COURSE_COLORS[(parseInt(courseNum) - 1) % COURSE_COLORS.length];

  // Past 3 Attempts History (merged from localStorage + backend)
  const [attemptsHistory, setAttemptsHistory] = useState({});
  const [selectedAttempt, setSelectedAttempt] = useState(null); // { attempt, topic, mode, explicitTopicId }

  useEffect(() => {
    const storageKey = `samu_mcq_attempts_history_${user?.id || 'guest'}`;
    let localHist = {};
    try {
      localHist = JSON.parse(localStorage.getItem(storageKey) || '{}');
      setAttemptsHistory(localHist);
    } catch {}

    if (!user?.id) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/api/users/topic-attempts`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const json = await res.json();
        const remote = json?.history || {};
        if (cancelled) return;

        const merged = { ...localHist };
        for (const [k, list] of Object.entries(remote)) {
          const combined = [...(Array.isArray(list) ? list : []), ...(Array.isArray(merged[k]) ? merged[k] : [])];
          const seen = new Set();
          const unique = [];
          for (const item of combined.sort((a, b) => (b.date || 0) - (a.date || 0))) {
            const uid = item.id || `${item.date}_${item.correct}_${item.total}`;
            if (!seen.has(uid)) {
              seen.add(uid);
              unique.push(item);
            }
          }
          merged[k] = unique.slice(0, 3);
        }
        setAttemptsHistory(merged);
        try { localStorage.setItem(storageKey, JSON.stringify(merged)); } catch {}
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [user?.id]);

  useEffect(() => {
    if ((!state?.title || subjectTitle === 'Subject') && subjectId) {
      const match = ALL_SUBJECTS.find(s => s.id === subjectId);
      if (match) setSubjectTitle(match.title);
    }
  }, [subjectId, state?.title]);

  // Determine local repo key
  let localKey = null;
  if (typeof subjectId === 'string' && /^s-\d+-\d+$/.test(subjectId)) {
    localKey = subjectId;
  } else {
    const sTitle = (subjectTitle || '').toLowerCase().trim();
    for (const item of CURRICULUM_MAPPING) {
      if (sTitle === item.match || sTitle.includes(item.match)) {
        localKey = item.key;
        break;
      }
    }
  }

  const localSubjectId = localKey || subjectId;

  // Generate topics: Static fallback list
  let localTopics = [];
  if (localSubjectId === 's-1-8') {
    localTopics = Array.from({ length: 24 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-1-9') {
    localTopics = Array.from({ length: 23 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-2-8') {
    localTopics = Array.from({ length: 15 }, (_, i) => ({ id: `t-${localSubjectId}-${i + 1}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-2-1') {
    localTopics = Array.from({ length: 15 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 16}`, localSubjectId }));
  } else if (localSubjectId === 's-2-9') {
    localTopics = Array.from({ length: 12 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else if (localSubjectId === 's-2-10') {
    const mainTopics = Array.from({ length: 8 }, (_, i) => ({ id: `t-${localSubjectId}-${i + 13}`, title: `Topic ${i + 13}`, localSubjectId }));
    const addedTopics = [
      { id: `t-${localSubjectId}-21`, title: 'Added Question 1', localSubjectId },
      { id: `t-${localSubjectId}-22`, title: 'Added Question 2', localSubjectId },
      { id: `t-${localSubjectId}-23`, title: 'Added Question 3', localSubjectId }
    ];
    localTopics = [...mainTopics, ...addedTopics];
  } else if (localSubjectId === 's-3-8') {
    localTopics = Array.from({ length: 15 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  } else {
    localTopics = Array.from({ length: 15 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  }

  localTopics.push({ 
    id: `master-${localSubjectId}`, 
    title: "Master Topic (Comprehensive Review)", 
    isMaster: true,
    localSubjectId
  });

  const isMicroBio2 = localSubjectId === 's-2-10';
  const [showAdditional, setShowAdditional] = useState(false);

  const fallbackTopics = isMicroBio2 && !showAdditional
    ? localTopics.filter(t => !t.title.startsWith('Added Question'))
    : localTopics;

  // Live Database Topics State
  const [liveTopics, setLiveTopics] = useState([]);
  const [loadingTopics, setLoadingTopics] = useState(true);

  // Load Real Topics and Question Counts from Database
  useEffect(() => {
    let isMounted = true;
    async function fetchTopics() {
      setLoadingTopics(true);
      // 1. Try Backend API first
      try {
        const res = await fetch(`https://samu-mcqs.onrender.com/api/subjects/${subjectId}/topics`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            if (isMounted) {
              setLiveTopics(data);
              setLoadingTopics(false);
              return;
            }
          }
        }
      } catch (err) {
        console.warn("Backend API /api/subjects/:id/topics failed, trying direct Supabase query...");
      }

      // 2. Direct Supabase Query with UUID or Title Resolution
      try {
        let subUUID = subjectId;
        if (!/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(subjectId)) {
          // Resolve local ID (s-X-Y) or title to Supabase subject UUID
          const cleanSubjectTitle = subjectTitle.replace(/Module\s*\d+/i, '').trim();
          const { data: sRows } = await supabase
            .from('subjects')
            .select('id, title')
            .ilike('title', `%${cleanSubjectTitle}%`)
            .limit(1);
          if (sRows && sRows.length > 0) subUUID = sRows[0].id;
        }

        const { data: tRows, error: tErr } = await supabase
          .from('topics')
          .select('id, title, subject_id, mcqs(count)')
          .eq('subject_id', subUUID)
          .not('title', 'ilike', '[BIN]%')
          .order('created_at', { ascending: true });

        if (!tErr && Array.isArray(tRows) && tRows.length > 0) {
          const formatted = tRows.map(t => ({
            _id: t.id,
            id: t.id,
            title: t.title,
            subjectId: t.subject_id,
            questionCount: t.mcqs?.[0]?.count || 0
          }));
          formatted.push({
            _id: `master-${subUUID}`,
            id: `master-${subUUID}`,
            title: "Master Topic (Comprehensive Review)",
            subjectId: subUUID,
            isMaster: true
          });
          if (isMounted) {
            setLiveTopics(formatted);
            setLoadingTopics(false);
            return;
          }
        }
      } catch (supaErr) {
        console.error("Direct Supabase topics query error:", supaErr);
      }

      if (isMounted) setLoadingTopics(false);
    }

    fetchTopics();
    return () => { isMounted = false; };
  }, [subjectId, subjectTitle]);

  const displayedTopics = liveTopics.length > 0 ? liveTopics : fallbackTopics;

  // Compatibility count helpers
  const getQuestionCount = (topicId) => {
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]) {
        const q = MCQ_REPOSITORY[sKey][topicId];
        if (Array.isArray(q)) return q.length;
        if (q.test) return q.test.length;
      }
    }
    return 20;
  };

  const getSituationalCount = (topicId) => {
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]?.situational) {
        return MCQ_REPOSITORY[sKey][topicId].situational.length;
      }
    }
    return 15;
  };

  // Resolve local topic ID (e.g. t-s-2-2-0)
  const resolveLocalTopicId = (topic, idx) => {
    let tId = topic.id || topic._id;
    if (tId && typeof tId === 'string' && tId.startsWith('t-')) return tId;
    if (localSubjectId) {
      let topicIdx = idx;
      const numMatch = topic.title?.match(/\d+/);
      if (numMatch) {
        topicIdx = parseInt(numMatch[0]) - 1;
      }
      if (localSubjectId === 's-2-8') {
        return `t-${localSubjectId}-${topicIdx + 1}`;
      } else if (localSubjectId === 's-2-10' && topicIdx >= 12) {
        return `t-${localSubjectId}-${topicIdx + 1}`;
      } else {
        return `t-${localSubjectId}-${topicIdx}`;
      }
    }
    return tId;
  };

  const getTopicCounts = (topic, idx) => {
    const localTId = resolveLocalTopicId(topic, idx);
    let testCount = 0;
    let sitCount = 0;

    for (const sKey of [localSubjectId, ...Object.keys(MCQ_REPOSITORY)]) {
      if (sKey && MCQ_REPOSITORY[sKey]?.[localTId]) {
        const data = MCQ_REPOSITORY[sKey][localTId];
        if (Array.isArray(data)) {
          testCount = data.length;
        } else if (data && typeof data === 'object') {
          testCount = data.test?.length || 0;
          sitCount = data.situational?.length || 0;
        }
        break;
      }
    }

    if (testCount === 0 && topic.questionCount) {
      testCount = topic.questionCount;
    }

    return {
      testCount: testCount || 20,
      sitCount,
      localTopicId: localTId
    };
  };

  function handleTopicClick(topic, mode, explicitTopicId) {
    if (!isSubscribed) {
      alert("Subscription Required: Please subscribe to unlock access to all courses and content.");
      navigate('/subscribe');
      return;
    }

    const targetTopicId = explicitTopicId || topic.id || topic._id;

    navigate('/quiz', {
      state: {
        topicId: targetTopicId,
        topicDbId: topic.id || topic._id,
        subjectId: localSubjectId,
        title: topic.title,
        mode,
      }
    });
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back
        </button>

        <div className={styles.header} style={{ borderLeftColor: color }}>
          <div>
            <h1 className={styles.title}>{subjectTitle}</h1>
            <p className={styles.subtitle}>{displayedTopics.length} topics • Select clinical modality</p>
          </div>
        </div>

        {isMicroBio2 && (
          <button
            onClick={() => setShowAdditional(prev => !prev)}
            style={{
              marginBottom: 10,
              backgroundColor: showAdditional ? '#FEF3C7' : '#F0FDF4',
              borderRadius: 12,
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              border: `1px solid ${showAdditional ? '#F59E0B' : '#10B981'}`,
              cursor: 'pointer',
              width: '100%',
              fontSize: 14,
              fontWeight: 'bold',
              color: showAdditional ? '#D97706' : '#059669',
              fontFamily: 'inherit'
            }}
          >
            <Eye size={18} style={{ marginRight: 8 }} />
            {showAdditional ? 'Hide Added Questions (3)' : 'Show Added Questions (3)'}
          </button>
        )}

        <div className={styles.subjectsList}>
          {displayedTopics.map((t, idx) => {
            const isMaster = t.isMaster || t.id.startsWith('master-');
            const { testCount, sitCount, localTopicId } = isMaster
              ? { testCount: 50, sitCount: 0, localTopicId: `master-${localSubjectId}` }
              : getTopicCounts(t, idx);

            const getAttemptsForMode = (modeKey) => {
              const keys = Array.from(new Set([
                `${localTopicId}_${modeKey}`,
                `${t.id}_${modeKey}`,
                t._id ? `${t._id}_${modeKey}` : null,
              ].filter(Boolean)));
              const combined = [];
              const seen = new Set();
              for (const k of keys) {
                for (const item of (attemptsHistory[k] || [])) {
                  const uid = item.id || `${item.date}_${item.correct}_${item.total}`;
                  if (!seen.has(uid)) {
                    seen.add(uid);
                    combined.push(item);
                  }
                }
              }
              return combined.sort((a, b) => (b.date || 0) - (a.date || 0)).slice(0, 3);
            };

            const attemptsTest = getAttemptsForMode('test');
            const attemptsSit = isMaster ? [] : getAttemptsForMode('situational');
            const hasAnyAttempts = attemptsTest.length > 0 || attemptsSit.length > 0;

            const renderAttemptPills = (list, modeKey, label) => {
              if (list.length === 0) return null;
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', minWidth: 68 }}>{label}:</span>
                  {list.map((att, ai) => {
                    const acc = att.accuracy ?? (att.total > 0 ? Math.round((att.correct / att.total) * 100) : 0);
                    const palette =
                      acc >= 80 ? { bg: '#ECFDF5', color: '#047857', border: '#A7F3D0' }
                      : acc >= 60 ? { bg: '#EEF2FF', color: '#4338CA', border: '#C7D2FE' }
                      : acc >= 40 ? { bg: '#FFFBEB', color: '#B45309', border: '#FDE68A' }
                      : { bg: '#FEF2F2', color: '#B91C1C', border: '#FECACA' };
                    const dStr = att.date ? new Date(att.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : '';
                    return (
                      <button
                        key={att.id || ai}
                        type="button"
                        onClick={() => setSelectedAttempt({ attempt: att, topic: t, mode: modeKey, explicitTopicId: localTopicId })}
                        title={`View detailed result for attempt #${ai + 1}`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '4px 9px', borderRadius: 999, cursor: 'pointer',
                          background: palette.bg, color: palette.color, border: `1px solid ${palette.border}`,
                          fontSize: 11, fontWeight: 800, fontFamily: 'inherit',
                        }}
                      >
                        <span>{att.correct}/{att.total} ({acc}%){dStr ? ` · ${dStr}` : ''}</span>
                        <Eye size={12} />
                      </button>
                    );
                  })}
                </div>
              );
            };
            
            return (
              <div key={t.id} className={styles.topicCard}>
                <div className={styles.topicLeft}>
                  <div className={styles.subjectIndex} style={{ 
                    background: isMaster ? '#FFF7ED' : '#F1F5F9', 
                    color: isMaster ? '#F97316' : '#6366F1'
                  }}>
                    {!isSubscribed ? <Lock size={18} color="#EF4444" /> : isMaster ? <Star size={18} fill="#F97316" /> : (idx + 1)}
                  </div>
                  <div className={styles.subjectInfo}>
                    <h3 className={styles.subjectTitle} style={isMaster ? { color: '#C2410C', fontWeight: '900' } : {}}>{t.title}</h3>
                  </div>
                </div>
                
                <div className={styles.topicActions}>
                  {isMaster ? (
                    <button
                      className={styles.quizBtn}
                      style={{ background: 'linear-gradient(90deg, #EF4444, #F59E0B, #10B981)', color: '#FFF', border: 'none', width: '100%' }}
                      onClick={() => handleTopicClick(t, 'test', `master-${localSubjectId}`)}
                    >
                      <BookOpen size={16} color="#FFF" style={{ marginRight: 8 }} />
                      MASTER PRACTICE (50 MCQs)
                    </button>
                  ) : (
                    <>
                      <button
                        className={styles.quizBtn}
                        style={{ background: '#6366F1', color: '#FFF', border: 'none', flex: 0.5 }}
                        onClick={() => handleTopicClick(t, 'test', localTopicId)}
                      >
                        <BookOpen size={14} color="#FFF" style={{ marginRight: 6 }} />
                        {testCount} Questions
                      </button>
                      <button
                        className={styles.quizBtn}
                        style={{ background: '#10B981', color: '#FFF', border: 'none', flex: 0.5 }}
                        onClick={() => handleTopicClick(t, 'situational', localTopicId)}
                      >
                        <FileText size={14} color="#FFF" style={{ marginRight: 6 }} />
                        {sitCount > 0 ? `${sitCount} Case Tasks` : 'Case Tasks'}
                      </button>
                    </>
                  )}
                </div>

                {hasAnyAttempts && (
                  <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: 0.4 }}>
                      <History size={12} color="#6366F1" />
                      <span>Past {Math.min(3, Math.max(attemptsTest.length, attemptsSit.length))} Attempts</span>
                    </div>
                    {renderAttemptPills(attemptsTest, 'test', isMaster ? 'Master' : 'Questions')}
                    {renderAttemptPills(attemptsSit, 'situational', 'Case Tasks')}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Past Attempt Result & Detailed Review Modal ── */}
      {selectedAttempt && (
        <div
          onClick={() => setSelectedAttempt(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)', zIndex: 1000, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#FFFFFF', borderRadius: 24, maxWidth: 740, width: '100%',
              maxHeight: '88vh', display: 'flex', flexDirection: 'column',
              boxShadow: '0 24px 60px rgba(15,23,42,0.35)', overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div style={{ padding: '18px 22px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#4F46E5', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Attempt Result · {selectedAttempt.mode === 'situational' ? 'Case Tasks' : 'Test Questions'}
                </div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0F172A', margin: '2px 0 0' }}>
                  {selectedAttempt.attempt.topicTitle || selectedAttempt.topic?.title}
                </h2>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span>{selectedAttempt.attempt.date ? new Date(selectedAttempt.attempt.date).toLocaleString() : ''}</span>
                  {selectedAttempt.attempt.timeTaken && (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={12} /> {selectedAttempt.attempt.timeTaken}
                    </span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAttempt(null)}
                style={{ width: 34, height: 34, borderRadius: 10, border: '1px solid #E2E8F0', background: '#F8FAFC', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '18px 22px', overflowY: 'auto', flex: 1 }}>
              {/* Summary Metrics */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: 10, marginBottom: 18 }}>
                <div style={{ padding: 12, borderRadius: 14, background: '#EEF2FF', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#4338CA' }}>{selectedAttempt.attempt.accuracy ?? 0}%</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#4F46E5', textTransform: 'uppercase' }}>Score</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: '#ECFDF5', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#047857' }}>{selectedAttempt.attempt.correct ?? 0}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>Correct</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: '#FEF2F2', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#B91C1C' }}>{selectedAttempt.attempt.wrong ?? 0}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>Wrong</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: '#FFFBEB', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#B45309' }}>{selectedAttempt.attempt.skipped ?? 0}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#D97706', textTransform: 'uppercase' }}>Skipped</div>
                </div>
                <div style={{ padding: 12, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0', textAlign: 'center' }}>
                  <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A' }}>{selectedAttempt.attempt.total ?? 0}</div>
                  <div style={{ fontSize: 10.5, fontWeight: 800, color: '#64748B', textTransform: 'uppercase' }}>Total</div>
                </div>
              </div>

              {/* Question-by-Question Review */}
              {Array.isArray(selectedAttempt.attempt.questions) && selectedAttempt.attempt.questions.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {selectedAttempt.attempt.questions.map((qItem, qi) => {
                    const isRight = qItem.userIndex === qItem.correctIndex;
                    const isSkipped = qItem.skipped || qItem.userIndex === null || qItem.userIndex === undefined;
                    return (
                      <div key={qi} style={{ padding: 14, borderRadius: 16, border: '1px solid #E2E8F0', background: '#F8FAFC' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 800, color: '#0F172A', lineHeight: 1.45 }}>
                            <span style={{ color: '#4F46E5', marginRight: 6 }}>Q{qi + 1}.</span>
                            {qItem.question}
                          </div>
                          {isRight ? (
                            <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />
                          ) : (
                            <XCircle size={18} color={isSkipped ? '#F59E0B' : '#EF4444'} style={{ flexShrink: 0 }} />
                          )}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                          {(qItem.options || []).map((opt, oi) => {
                            const isCorrectOpt = oi === qItem.correctIndex;
                            const isUserOpt = oi === qItem.userIndex;
                            let bg = '#FFFFFF';
                            let border = '#E2E8F0';
                            let color = '#334155';
                            if (isCorrectOpt) {
                              bg = '#ECFDF5';
                              border = '#6EE7B7';
                              color = '#065F46';
                            } else if (isUserOpt && !isRight) {
                              bg = '#FEF2F2';
                              border = '#FCA5A5';
                              color = '#991B1B';
                            }
                            return (
                              <div key={oi} style={{ padding: '8px 12px', borderRadius: 10, background: bg, border: `1px solid ${border}`, color, fontSize: 12.5, fontWeight: (isCorrectOpt || isUserOpt) ? 700 : 500, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                <span>{String.fromCharCode(65 + oi)}. {opt}</span>
                                {isCorrectOpt && <span style={{ fontSize: 11, fontWeight: 800 }}>✓ Correct</span>}
                                {isUserOpt && !isRight && <span style={{ fontSize: 11, fontWeight: 800 }}>✕ Your Pick</span>}
                              </div>
                            );
                          })}
                        </div>
                        {isSkipped && (
                          <div style={{ marginTop: 6, fontSize: 11.5, fontWeight: 700, color: '#B45309' }}>
                            Skipped (no option selected)
                          </div>
                        )}
                        {qItem.explanation && (
                          <div style={{ marginTop: 8, padding: '8px 10px', borderRadius: 10, background: '#EFF6FF', color: '#1E3A8A', fontSize: 12, lineHeight: 1.45 }}>
                            <strong>Explanation:</strong> {qItem.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: 24, color: '#64748B', fontSize: 13 }}>
                  Detailed question breakdown is not available for this attempt.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div style={{ padding: '14px 22px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#F8FAFC' }}>
              <button
                type="button"
                onClick={() => setSelectedAttempt(null)}
                className="btn btn-ghost"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedAttempt;
                  setSelectedAttempt(null);
                  handleTopicClick(target.topic, target.mode, target.explicitTopicId);
                }}
                className="btn btn-primary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCcw size={15} /> Retake Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
