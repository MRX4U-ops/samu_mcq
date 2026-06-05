import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ChevronRight, ArrowLeft, BookOpen, FileText } from 'lucide-react';
import styles from './CoursePage.module.css';

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
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectTitle, setSubjectTitle] = useState(state?.title || 'Subject');
  const courseNum = state?.courseNum || '1';
  const courseId = state?.courseId;
  const color = COURSE_COLORS[(parseInt(courseNum) - 1) % COURSE_COLORS.length];

  // Determine local repo key
  const localKey = Object.entries(CURRICULUM_MAPPING).find(([name]) =>
    subjectTitle.toLowerCase().includes(name.toLowerCase())
  )?.[1];

  useEffect(() => {
    async function load() {
      try {
        const { data } = await supabase
          .from('topics')
          .select('id, title, description')
          .eq('subject_id', subjectId)
          .order('title');
        setTopics(data || []);
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, [subjectId]);

  function handleTopicClick(topic, mode) {
    const topicNum = topic.title.match(/\d+/)?.[0];
    const topicKey = localKey && topicNum ? `t-${localKey}-${parseInt(topicNum) - 1}` : topic.id;
    navigate('/quiz', {
      state: {
        topicId: topicKey,
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
            <p className={styles.subtitle}>{topics.length} topics{localKey ? ' • Local data available' : ''}</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loader}><div className="spinner" /><span>Loading topics...</span></div>
        ) : topics.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={40} color="var(--text-muted)" />
            <p>No topics found for this subject.</p>
          </div>
        ) : (
          <div className={styles.subjectsList}>
            {topics.map((t, idx) => {
              const topicNum = t.title.match(/\d+/)?.[0];
              return (
                <div key={t.id} className={styles.topicCard}>
                  <div className={styles.topicLeft}>
                    <div className={styles.subjectIndex} style={{ background: color + '22', color }}>
                      {topicNum || idx + 1}
                    </div>
                    <div className={styles.subjectInfo}>
                      <h3 className={styles.subjectTitle}>{t.title}</h3>
                    </div>
                  </div>
                  <div className={styles.topicActions}>
                    <button
                      className={styles.quizBtn}
                      style={{ background: color + '22', color, border: `1px solid ${color}44` }}
                      onClick={() => handleTopicClick(t, 'test')}
                    >
                      <BookOpen size={13} />
                      Test
                    </button>
                    <button
                      className={styles.quizBtn}
                      style={{ background: '#8B5CF622', color: '#8B5CF6', border: '1px solid #8B5CF644' }}
                      onClick={() => handleTopicClick(t, 'situational')}
                    >
                      <FileText size={13} />
                      Situational
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
