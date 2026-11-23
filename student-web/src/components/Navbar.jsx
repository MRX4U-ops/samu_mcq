import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Practice MCQs', to: '/home' },
  { label: '1v1 Battle', badge: 'LIVE', to: '/battle' },
  { label: 'AI Tutor', badge: 'NEW', to: '/ask-ai' },
  { label: 'Clinical Cases', to: '/clinical-case' },
  { label: 'Drug Database', to: '/drugs' },
  { label: 'Leaderboard', to: '/leaderboard' },
  { label: 'Plans', to: '/subscribe' },
  { label: 'Guidance', to: '/guidance' },
];

export default function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const initial = profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'M';

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        {/* Brand Logo */}
        <Link to={user ? '/home' : '/'} className={styles.brand}>
          <div className={styles.logo}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span className={styles.brandName}>SAMU <span className={styles.brandAccent}>MCQs</span></span>
        </Link>

        {/* Desktop Nav Links */}
        <div className={styles.navLinks}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`${styles.navLink} ${location.pathname === link.to ? styles.activeLink : ''}`}
            >
              {link.label}
              {link.badge && (
                <span className={link.badge === 'LIVE' ? styles.badgeLive : styles.badgeNew}>
                  {link.badge}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Right Actions */}
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
              <Link to="/login" className={styles.loginBtn}>Sign In</Link>
              <Link to="/register" className={styles.registerBtn}>Register Free</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
