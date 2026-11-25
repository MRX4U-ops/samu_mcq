import { Link } from 'react-router-dom';
import { Stethoscope, HeartPulse, ShieldCheck } from 'lucide-react';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandRow}>
              <div className={styles.logoBadge}>
                <Stethoscope size={20} color="#FFFFFF" />
              </div>
              <span className={styles.brandTitle}>
                SAMU <span className={styles.brandAccent}>MCQs</span>
              </span>
            </div>
            <p className={styles.brandDesc}>
              Official 6-Year Medical University Practice Platform — verified MCQs, clinical case tasks, AI tutor, live 1v1 battles, and high-yield lecture streams.
            </p>
            <div className={styles.trustPill}>
              <ShieldCheck size={14} color="#38BDF8" />
              <span>6 Courses · 8,000+ Verified Questions</span>
            </div>
          </div>

          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Study Hub</h4>
            <Link to="/home" className={styles.link}>Practice MCQs</Link>
            <Link to="/telegram-media" className={styles.link}>Videos &amp; Notes</Link>
            <Link to="/battle" className={styles.link}>1v1 Quiz Battle</Link>
            <Link to="/ask-ai" className={styles.link}>AI Medical Tutor</Link>
          </div>

          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Clinical Tools</h4>
            <Link to="/clinical-case" className={styles.link}>Clinical Cases</Link>
            <Link to="/drugs" className={styles.link}>Drug Database</Link>
            <Link to="/revision" className={styles.link}>Revision Engine</Link>
            <Link to="/leaderboard" className={styles.link}>Leaderboard</Link>
          </div>

          <div className={styles.linkCol}>
            <h4 className={styles.colTitle}>Account &amp; Support</h4>
            <Link to="/profile" className={styles.link}>My Profile</Link>
            <Link to="/subscribe" className={styles.link}>Subscription Plans</Link>
            <Link to="/guidance" className={styles.link}>Study Guidance</Link>
            <Link to="/help" className={styles.link}>Help Desk</Link>
          </div>
        </div>

        <div className={styles.bottomBar}>
          <span className={styles.copy}>
            © {new Date().getFullYear()} SAMU MCQs Medical Platform. All rights reserved.
          </span>
          <span className={styles.madeWith}>
            <HeartPulse size={14} color="#38BDF8" /> Built for Future Doctors
          </span>
        </div>
      </div>
    </footer>
  );
}
