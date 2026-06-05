import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ChevronRight, ArrowLeft, BookOpen, FileText, Lock, Star, Eye } from 'lucide-react';
import styles from './CoursePage.module.css';
import { MCQ_REPOSITORY } from '../data';
import { useAuth } from '../context/AuthContext';

// Subject local ID mapping (same as mobile app CURRICULUM_MAPPING)
const CURRICULUM_MAPPING = {
  'Medical Biology': 's-1-8',
  'Chemistry': 's-1-9',
  'Physics': 's-1-10',
  'Anatomy': 's-2-0',
  'Physiology': 's-2-1',
  'Biochemistry': 's-2-2',
  'Histology': 's-2-8',
  'Microbiology': 's-2-9',
  'Pathology': 's-2-10',
};

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

  // Determine local repo key
  const localKey = Object.entries(CURRICULUM_MAPPING).find(([name]) =>
    subjectTitle.toLowerCase().includes(name.toLowerCase())
  )?.[1];

  const localSubjectId = localKey || subjectId;

  // Generate topics EXACTLY like mobile app TopicScreen.js
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
  } else {
    localTopics = Array.from({ length: 15 }, (_, i) => ({ id: `t-${localSubjectId}-${i}`, title: `Topic ${i + 1}`, localSubjectId }));
  }

  // Always append Master Topic
  localTopics.push({ 
    id: `master-${localSubjectId}`, 
    title: "Master Topic (Comprehensive Review)", 
    isMaster: true,
    localSubjectId
  });

  const isMicroBio2 = localSubjectId === 's-2-10';
  const [showAdditional, setShowAdditional] = useState(false);

  const visibleTopics = isMicroBio2 && !showAdditional
    ? localTopics.filter(t => !t.title.startsWith('Added Question'))
    : localTopics;

  const [topics, setTopics] = useState(localTopics);

  const getQuestionCount = (topicId) => {
    let questions = null;
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]) {
        questions = MCQ_REPOSITORY[sKey][topicId];
        break;
      }
    }
    if (questions) {
      if (Array.isArray(questions)) return questions.length;
      if (questions.test) return questions.test.length;
      if (questions.situational) return questions.situational.length;
    }
    return 0;
  };

  const getSituationalCount = (topicId) => {
    let questions = null;
    for (const sKey in MCQ_REPOSITORY) {
      if (MCQ_REPOSITORY[sKey][topicId]) {
        questions = MCQ_REPOSITORY[sKey][topicId];
        break;
      }
    }
    if (questions && questions.situational) return questions.situational.length;
    return 0;
  };

  function handleTopicClick(topic, mode) {
    let count = 0;
    if (topic.isMaster || topic.id.startsWith('master-')) {
       const sId = topic.localSubjectId || localSubjectId;
       if (MCQ_REPOSITORY[sId]) count = 1; 
    } else {
       count = mode === 'situational' ? getSituationalCount(topic.id) : getQuestionCount(topic.id);
    }

    if (count === 0) {
      alert("Coming Soon: All data available on Before 27 may");
      return;
    }

    if (!isSubscribed) {
      alert("Subscription Required: Please subscribe to unlock access to all courses and content.");
      navigate('/subscribe');
      return;
    }

    const topicNum = topic.title.match(/\d+/)?.[0];
    const topicKey = localKey && topicNum && !topic.title.startsWith('Added Question') ? `t-${localKey}-${parseInt(topicNum) - 1}` : topic.id;
    navigate('/quiz', {
      state: {
        topicId: topic.id, // pass the exact ID from localTopics
        topicDbId: topic.id,
        subjectId: localKey || subjectId,
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
            <p className={styles.subtitle}>{visibleTopics.length} topics • Select clinical modality</p>
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
          {visibleTopics.map((t, idx) => {
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
                        {getQuestionCount(t.id) || 'XX'} Questions
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

