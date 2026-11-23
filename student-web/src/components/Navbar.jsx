import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const initial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'M';

  const NAV_LINKS = [
    { label: 'Practice MCQs', to: '/home' },
    { label: '1v1 Battle', badge: 'Live', to: '/battle' },
    { label: 'AI Tutor', badge: 'New', to: '/ask-ai' },
    { label: 'Clinical Cases', to: '/clinical-case' },
    { label: 'Drug Database', to: '/drugs' },
    { label: 'Leaderboard', to: '/leaderboard' },
    { label: 'Plans', to: '/subscribe' },
    { label: 'Guidance', to: '/guidance' },
  ];

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <div className={styles.leftSection}>
          <Link to="/" className={styles.brand}>
            <div className={styles.logo}>
              <BookOpen size={18} color="#fff" />
            </div>
            <span className={styles.brandName}>SAMU <span className={styles.brandAccent}>MCQs</span></span>
          </Link>

          <div className={styles.navLinks}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className={styles.navLink}
              >
                {link.label}
                {link.badge && <span className={styles.badge}>{link.badge}</span>}
              </Link>
            ))}
          </div>
        </div>

        <div className={styles.actions}>
          {user ? (
            <>
              <button className={styles.bellBtn} title="Notifications">
                <Bell size={18} />
                <span className={styles.bellDot} />
              </button>
              <Link to="/profile" className={styles.avatarBtn}>
                {initial}
              </Link>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: 13 }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 13 }}>Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
