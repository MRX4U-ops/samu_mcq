import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ALL_SUBJECTS } from '../data/index.js';
import Navbar from '../components/Navbar';
import { ChevronRight, ArrowLeft, BookOpen, Loader, Pin } from 'lucide-react';
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

  const [pinnedSubjects, setPinnedSubjects] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinned_subjects') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    async function load() {
      try {
        // Try API first
        const res = await fetch(`https://samu-mcqs.onrender.com/api/courses/${courseId}/subjects`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setSubjects(data);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend API fetch failed, trying fallback...");
      }

      // Fallback: local static data based on course number
      if (courseNum) {
        const localSubjects = ALL_SUBJECTS.filter(s => s.id.startsWith(`s-${courseNum}-`));
        if (localSubjects.length > 0) {
          setSubjects(localSubjects);
          setLoading(false);
          return;
        }
      }

      // Final Fallback: Supabase direct (if courseId is a UUID)
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
  }, [courseId, courseNum]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned;
    if (pinnedSubjects.includes(id)) {
      newPinned = pinnedSubjects.filter(pId => pId !== id);
    } else {
      newPinned = [...pinnedSubjects, id];
    }
    setPinnedSubjects(newPinned);
    localStorage.setItem('pinned_subjects', JSON.stringify(newPinned));
  };

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) => {
      const aId = a.id || a._id;
      const bId = b.id || b._id;
      const aPinned = pinnedSubjects.includes(aId);
      const bPinned = pinnedSubjects.includes(bId);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return 0;
    });
  }, [subjects, pinnedSubjects]);

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
            {sortedSubjects.map((s, idx) => {
              const sId = s.id || s._id;
              const isPinned = pinnedSubjects.includes(sId);
              return (
                <div
                  key={sId}
                  className={styles.subjectCard}
                  onClick={() => navigate(`/subject/${sId}`, { state: { title: s.title, courseId, courseNum } })}
                >
                  <div className={styles.subjectIndex} style={{ background: color + '22', color }}>
                    {idx + 1}
                  </div>
                  <div className={styles.subjectInfo}>
                    <h3 className={styles.subjectTitle}>{s.title}</h3>
                    {s.description && <p className={styles.subjectDesc}>{s.description}</p>}
                  </div>
                  <button 
                    className={styles.pinBtn} 
                    onClick={(e) => togglePin(e, sId)}
                    title={isPinned ? "Unpin subject" : "Pin subject"}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px', borderRadius: '50%', transition: 'background 0.2s', marginLeft: 'auto' }}
                    onMouseOver={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.05)'}
                    onMouseOut={(e) => e.currentTarget.style.background = 'none'}
                  >
                    <Pin size={20} color={isPinned ? '#F59E0B' : 'var(--text-muted)'} fill={isPinned ? '#F59E0B' : 'none'} style={{ transform: isPinned ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s' }} />
                  </button>
                  <ChevronRight size={18} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

