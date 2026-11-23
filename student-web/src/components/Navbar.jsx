import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell, LogOut, Shield } from 'lucide-react';
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
  const { user, profile, isSuperAdmin, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSuper = isSuperAdmin || user?.email?.toLowerCase() === 'mohd6396889713@gmail.com' || profile?.role === 'admin';
  const displayName = profile?.name || (isSuper ? 'Sameer Ahmad' : (profile?.full_name || user?.email || 'M'));
  const initial = isSuper ? 'S' : (displayName[0]?.toUpperCase() || 'M');

  const getAdminUrl = () => {
    if (typeof window === 'undefined') return '/admin/';
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5174';
    }
    const origin = window.location.origin;
    const pathname = window.location.pathname.replace(/\/$/, '');
    return `${origin}${pathname}/admin/`;
  };
  const adminPanelUrl = getAdminUrl();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

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
              {isSuper && (
                <a 
                  href={adminPanelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.adminNavPill}
                  title="Open Super Admin Panel"
                >
                  <Shield size={14} />
                  <span className={styles.adminNavText}>Admin Panel</span>
                </a>
              )}
              <button className={styles.bellBtn} title="Notifications">
                <Bell size={18} />
                <span className={styles.bellDot} />
              </button>
              <Link to="/profile" className={styles.avatarBtn} title="View Profile">
                {initial}
              </Link>
              <button onClick={handleSignOut} className={styles.logoutNavBtn} title="Sign Out">
                <LogOut size={15} />
                <span className={styles.logoutNavText}>Logout</span>
              </button>
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
