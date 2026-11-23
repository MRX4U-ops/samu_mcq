import { Link } from 'react-router-dom';
import { FileQuestion, ChevronLeft, BookOpen, MessageSquare, Trophy, FileText, HelpCircle, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import styles from './GuidancePage.module.css';

export default function GuidancePage() {
  const guidelines = [
    {
      icon: <BookOpen size={24} color="#3B82F6" />,
      title: "Course Navigation",
      desc: "Access your subscribed courses from the Home dashboard. Each course contains subjects grouped by category. You must have an active subscription to access premium content."
    },
    {
      icon: <MessageSquare size={24} color="#F59E0B" />,
      title: "Quiz Battles",
      desc: "Challenge other students in real-time Quiz Battles. Answer quickly and accurately to score points. Join an existing battle or create your own room."
    },
    {
      icon: <Trophy size={24} color="#10B981" />,
      title: "Global Leaderboard",
      desc: "Compete globally! Your score from battles and regular quizzes contributes to your daily, weekly, and monthly ranking. Top 3 students are featured on the podium."
    },
    {
      icon: <FileText size={24} color="#8B5CF6" />,
      title: "Exam Results",
      desc: "Review your past CBT exam results. Check your pass/fail status, detailed score, and duration for any previously taken medical board simulation."
    },
    {
      icon: <HelpCircle size={24} color="#F43F5E" />,
      title: "Help & Support",
      desc: "If you encounter any issues with questions or subscriptions, use the Help Desk to submit a ticket. For urgent issues, you can reach out directly via Telegram @mrx4u."
    }
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <div className={styles.titleWrap}>
            <FileQuestion size={32} color="#06B6D4" />
            <h1 className={styles.title}>Website Guidance</h1>
          </div>
          <p className={styles.sub}>Everything you need to know about navigating SAMU MCQs effectively.</p>
        </div>

        <div className={styles.grid}>
          {guidelines.map((g, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.iconBox}>{g.icon}</div>
              <h3 className={styles.cardTitle}>{g.title}</h3>
              <p className={styles.cardDesc}>{g.desc}</p>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p>Ready to test your knowledge?</p>
          <Link to="/home" className="btn btn-primary">
            Go to Dashboard <ArrowRight size={16} style={{ marginLeft: 8 }} />
          </Link>
        </div>
      </div>
    </div>
  );
}
