import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Crown, ChevronLeft, CheckCircle, MessageCircle } from 'lucide-react';
import styles from './SubscribePage.module.css';

const PLAN_FEATURES = [
  'Access to all 6 MBBS courses',
  'Thousands of MCQs and situational tasks',
  'Real-time Quiz Battles',
  'Global Leaderboard ranking',
  'Exam result tracking',
  'AI-powered doubt solving',
];

export default function SubscribePage() {
  const { isSubscribed } = useAuth();

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
        </div>

        <div className={styles.heroSection}>
          <div className={styles.crownWrap}>
            <Crown size={40} color="#FBBF24" />
          </div>
          <h1 className={styles.heroTitle}>Unlock Everything</h1>
          <p className={styles.heroSub}>
            Get full access to all SAMU MCQ content and boost your MBBS preparation.
          </p>
        </div>

        {isSubscribed ? (
          <div className={styles.alreadyCard}>
            <CheckCircle size={40} color="#10B981" />
            <h2 className={styles.alreadyTitle}>You are already subscribed! 🎉</h2>
            <p className={styles.alreadySub}>Enjoy full access to all content.</p>
            <Link to="/home" className="btn btn-primary" style={{ marginTop: 16 }}>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <>
            <div className={styles.featuresCard}>
              <h3 className={styles.featuresTitle}>What you get</h3>
              {PLAN_FEATURES.map((f, i) => (
                <div key={i} className={styles.featureRow}>
                  <CheckCircle size={18} color="#10B981" />
                  <span>{f}</span>
                </div>
              ))}
            </div>

            <div className={styles.contactCard}>
              <div className={styles.contactIcon}>
                <MessageCircle size={28} color="#0088cc" />
              </div>
              <div className={styles.contactInfo}>
                <h3 className={styles.contactTitle}>How to Subscribe</h3>
                <p className={styles.contactDesc}>
                  Contact us on Telegram to get your subscription activated. We'll set it up for you right away.
                </p>
              </div>
              <a
                href="https://t.me/mrx4u"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <MessageCircle size={16} />
                Contact on Telegram
              </a>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
