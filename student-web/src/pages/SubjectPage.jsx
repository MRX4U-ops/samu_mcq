import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ChevronRight, ArrowLeft, BookOpen, FileText, Lock, Star, Eye } from 'lucide-react';
import styles from './CoursePage.module.css';
import { MCQ_REPOSITORY, ALL_SUBJECTS } from '../data';
import { useAuth } from '../context/AuthContext';

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
  const { isSubscribed } = useAuth();
  
  const [subjectTitle, setSubjectTitle] = useState(state?.title || 'Subject');
  const courseNum = state?.courseNum || '1';
  const courseId = state?.courseId;
  const color = COURSE_COLORS[(parseInt(courseNum) - 1) % COURSE_COLORS.length];

  useEffect(() => {
    if ((!state?.title || subjectTitle === 'Subject') && subjectId) {
      const match = ALL_SUBJECTS.find(s => s.id === subjectId);
      if (match) setSubjectTitle(match.title);
    }
  }, [subjectId, state?.title]);

  // Determine local repo key
  const localKey = Object.entries(CURRICULUM_MAPPING).find(([name]) =>
    subjectTitle.toLowerCase().includes(name.toLowerCase())
  )?.[1];

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
                      onClick={() => handleTopicClick(t, 'test')}
                    >
                      <BookOpen size={16} color="#FFF" style={{ marginRight: 8 }} />
                      MASTER PRACTICE (50 MCQs)
                    </button>
                  ) : (
                    <>
                      <button
                        className={styles.quizBtn}
                        style={{ background: '#6366F1', color: '#FFF', border: 'none', flex: 0.5 }}
                        onClick={() => handleTopicClick(t, 'test')}
                      >
                        <BookOpen size={14} color="#FFF" style={{ marginRight: 6 }} />
                        {(t.questionCount !== undefined && t.questionCount > 0) ? t.questionCount : (getQuestionCount(t.id) || '25')} Questions
                      </button>
                      <button
                        className={styles.quizBtn}
                        style={{ background: '#10B981', color: '#FFF', border: 'none', flex: 0.5 }}
                        onClick={() => handleTopicClick(t, 'situational')}
                      >
                        <FileText size={14} color="#FFF" style={{ marginRight: 6 }} />
                        {getSituationalCount(t.id) || '0'} Case Tasks
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
