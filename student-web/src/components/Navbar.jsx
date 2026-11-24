import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BookOpen, Bell, LogOut, Shield, Menu, X, ChevronRight } from 'lucide-react';
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

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
                <Link 
                  to="/admin"
                  className={styles.adminNavPill}
                  title="Open Super Admin Panel"
                >
                  <Shield size={14} />
                  <span className={styles.adminNavText}>Admin Panel</span>
                </Link>
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

          {/* Mobile & Tablet Hamburger Toggle Button */}
          <button
            className={styles.menuToggleBtn}
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileDrawer}>
          <div className={styles.mobileDrawerLinks}>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`${styles.mobileDrawerLink} ${location.pathname === link.to ? styles.mobileActiveLink : ''}`}
              >
                <span>{link.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {link.badge && (
                    <span className={link.badge === 'LIVE' ? styles.badgeLive : styles.badgeNew}>
                      {link.badge}
                    </span>
                  )}
                  <ChevronRight size={16} className={styles.mobileDrawerChev} />
                </div>
              </Link>
            ))}
            {isSuper && (
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className={styles.mobileDrawerAdminLink}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Shield size={16} />
                  <span>Super Admin Portal</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            )}
            {user ? (
              <div className={styles.mobileDrawerUserRow}>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className={styles.mobileDrawerProfileLink}
                >
                  <div className={styles.avatarBtn}>{initial}</div>
                  <div className={styles.mobileUserInfoText}>
                    <div className={styles.mobileDrawerUserName}>{displayName}</div>
                    <div className={styles.mobileDrawerUserEmail}>{user.email}</div>
                  </div>
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleSignOut(); }}
                  className={styles.mobileLogoutBtn}
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <div className={styles.mobileAuthRow}>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className={styles.loginBtn} style={{ textAlign: 'center', flex: 1 }}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} className={styles.registerBtn} style={{ textAlign: 'center', flex: 1 }}>Register Free</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
