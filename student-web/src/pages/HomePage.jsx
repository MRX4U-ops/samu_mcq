import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import { ChevronRight, Lock, Unlock, Flame, BookOpen, Sparkles } from 'lucide-react';
import styles from './HomePage.module.css';

const COURSE_COLORS = ['#3B82F6','#8B5CF6','#10B981','#F59E0B','#EF4444','#06B6D4'];
const DEFAULT_COURSES = [
  { id:'1', title:'1st Course', num:'1', subjectCount:21 },
  { id:'2', title:'2nd Course', num:'2', subjectCount:24 },
  { id:'3', title:'3rd Course', num:'3', subjectCount:25 },
  { id:'4', title:'4th Course', num:'4', subjectCount:23 },
  { id:'5', title:'5th Course', num:'5', subjectCount:24 },
  { id:'6', title:'6th Course', num:'6', subjectCount:14 },
];

export default function HomePage() {
  const { user, profile, isSubscribed, subscription } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState(DEFAULT_COURSES);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    // Try to fetch real courses from backend
    fetch('https://samu-mcqs.onrender.com/api/courses')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setCourses(data.slice(0,6).map((c,i) => ({
            id: c._id,
            title: c.title,
            num: String(i+1),
            subjectCount: c.subjectCount || 0,
          })));
        }
      })
      .catch(() => {}); // fallback to defaults

    // Fetch streak
    if (user) {
      supabase.from('user_streaks').select('current_streak').eq('user_id', user.id).single()
        .then(({ data }) => { if (data) setStreak(data.current_streak || 0); });
    }
  }, [user]);

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Scholar';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 18 ? 'Good Afternoon' : 'Good Evening';

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000))
    : 0;

  function handleCourseClick(course) {
    if (!isSubscribed) {
      navigate('/subscribe');
      return;
    }
    navigate(`/course/${course.id}`, { state: { title: course.title, num: course.num } });
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        {/* Welcome Card */}
        <div className={styles.welcomeCard}>
          <div className={styles.welcomeLeft}>
            <p className={styles.welcomeGreeting}>{greeting}, {name}!</p>
            <h1 className={styles.welcomeTitle}>Ready to practice?</h1>
            <p className={styles.welcomeSub}>Keep up the momentum — every question brings you closer to excellence.</p>
            {streak > 0 && (
              <div className={styles.streakBadge}>
                <Flame size={14} color="#F59E0B" fill="#F59E0B" />
                <span>{streak} Day Streak</span>
              </div>
            )}
          </div>
          <div className={styles.welcomeIcon}>
            <Sparkles size={40} color="#FBBF24" />
          </div>
        </div>

        {/* Subscription Banner */}
        {!isSubscribed && (
          <div className={styles.subBanner}>
            <div>
              <p className={styles.subBannerTitle}>🔒 Unlock All Content</p>
              <p className={styles.subBannerSub}>Subscribe to access all 6 courses, thousands of MCQs and situational tasks.</p>
            </div>
            <Link to="/subscribe" className="btn btn-primary" style={{ flexShrink: 0, fontSize: 13, padding: '10px 20px' }}>
              Subscribe
            </Link>
          </div>
        )}

        {isSubscribed && daysLeft > 0 && daysLeft <= 7 && (
          <div className={styles.subWarnBanner}>
            ⚠️ Your subscription expires in <strong>{daysLeft} day{daysLeft !== 1 ? 's' : ''}</strong>
          </div>
        )}

        {/* Courses */}
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>SELECT COURSE</span>
        </div>
        <div className={styles.coursesGrid}>
          {courses.map((c, i) => {
            const color = COURSE_COLORS[i % COURSE_COLORS.length];
            return (
              <button key={c.id} className={styles.courseCard} onClick={() => handleCourseClick(c)}>
                <div className={styles.courseTop}>
                  <div className={styles.courseNum} style={{ background: color }}>{c.num}</div>
                  {isSubscribed
                    ? <Unlock size={14} color="#10B981" />
                    : <Lock size={14} color="#EF4444" />}
                </div>
                <div className={styles.courseTitle}>{c.title}</div>
                <div className={styles.courseSubs} style={{ color }}>{c.subjectCount} subjects</div>
              </button>
            );
          })}
        </div>

        {/* Quick Links */}
        <div className={styles.sectionHeader} style={{ marginTop: 32 }}>
          <span className={styles.sectionLabel}>QUICK ACTIONS</span>
        </div>
        <div className={styles.quickGrid}>
          <button className={styles.quickCard} onClick={() => navigate('/profile')}>
            <BookOpen size={22} color="#3B82F6" />
            <span>My Profile</span>
            <ChevronRight size={16} color="var(--text-muted)" />
          </button>
        </div>

      </div>
    </div>
  );
}
