import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ChevronRight, ArrowLeft, BookOpen, Loader } from 'lucide-react';
import styles from './CoursePage.module.css';

const COURSE_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4'];

export default function CoursePage() {
  const { courseId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseTitle, setCourseTitle] = useState(state?.title || 'Course');
  const courseNum = state?.num || '1';
  const color = COURSE_COLORS[(parseInt(courseNum) - 1) % COURSE_COLORS.length];

  useEffect(() => {
    async function load() {
      try {
        // Try API first
        const res = await fetch(`https://samu-mcqs.onrender.com/api/subjects?courseId=${courseId}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSubjects(data);
          setLoading(false);
          return;
        }
      } catch (e) {}

      // Fallback: Supabase direct
      try {
        const { data } = await supabase
          .from('subjects')
          .select('id, title, description, course_id')
          .eq('course_id', courseId)
          .order('title');
        setSubjects(data || []);
      } catch (e) {}
      setLoading(false);
    }
    load();
  }, [courseId]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <button className={styles.backBtn} onClick={() => navigate('/home')}>
          <ArrowLeft size={18} />
          Back to Courses
        </button>

        <div className={styles.header} style={{ borderLeftColor: color }}>
          <div className={styles.headerNum} style={{ background: color }}>{courseNum}</div>
          <div>
            <h1 className={styles.title}>{courseTitle}</h1>
            <p className={styles.subtitle}>{subjects.length} subjects available</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loader}><div className="spinner" /><span>Loading subjects...</span></div>
        ) : subjects.length === 0 ? (
          <div className={styles.empty}>
            <BookOpen size={40} color="var(--text-muted)" />
            <p>No subjects found for this course.</p>
          </div>
        ) : (
          <div className={styles.subjectsList}>
            {subjects.map((s, idx) => (
              <button
                key={s.id || s._id}
                className={styles.subjectCard}
                onClick={() => navigate(`/subject/${s.id || s._id}`, { state: { title: s.title, courseId, courseNum } })}
              >
                <div className={styles.subjectIndex} style={{ background: color + '22', color }}>{idx + 1}</div>
                <div className={styles.subjectInfo}>
                  <h3 className={styles.subjectTitle}>{s.title}</h3>
                  {s.description && <p className={styles.subjectDesc}>{s.description}</p>}
                </div>
                <ChevronRight size={18} color="var(--text-muted)" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
