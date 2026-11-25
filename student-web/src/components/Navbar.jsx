import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { Stethoscope, Bell, LogOut, Shield, Menu, X, ChevronRight, Gift, Sparkles, Check } from 'lucide-react';
import styles from './Navbar.module.css';

const NAV_LINKS = [
  { label: 'Practice MCQs', to: '/home' },
  { label: 'Videos & Notes', to: '/telegram-media' },
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

  // Notification State
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activePromo, setActivePromo] = useState(null);
  const notifRef = useRef(null);

  // Close mobile drawer and notifications whenever location changes
  useEffect(() => {
    setMobileMenuOpen(false);
    setShowNotifications(false);
  }, [location.pathname]);

  // Close notification popover on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  // Fetch active coupon for notification alert
  useEffect(() => {
    if (!user) return;
    async function checkNotifications() {
      try {
        const { data } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1);

        if (data && data.length > 0) {
          const promo = data[0];
          const val = parseFloat(promo.discount_percentage) || 0;
          const isDays = val < 0;
          const benefit = isDays 
            ? `${Math.round(Math.abs(val))} Days Free Access` 
            : (val === 100 ? '100% Free Full Access' : `${val}% Discount`);
          
          setActivePromo({ ...promo, benefit });

          const isRead = localStorage.getItem('samu_read_promo_' + promo.code);
          if (!isRead) {
            setUnreadCount(1);
          }
        }
      } catch (e) {
        console.error('Navbar notification load error:', e);
      }
    }
    checkNotifications();
  }, [user]);

  const handleMarkAllRead = () => {
    if (activePromo?.code) {
      localStorage.setItem('samu_read_promo_' + activePromo.code, 'true');
    }
    setUnreadCount(0);
  };

  const isSuper = isSuperAdmin || user?.email?.toLowerCase() === 'mohd6396889713@gmail.com' || profile?.role === 'admin';
  const displayName = user?.user_metadata?.full_name || profile?.name || (isSuper ? 'Sameer Ahmad' : (profile?.full_name || user?.email || 'M'));
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || '';
  const initial = displayName[0]?.toUpperCase() || (isSuper ? 'S' : 'M');

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
            <Stethoscope size={19} color="#FFFFFF" strokeWidth={2.4} />
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
              {/* Notifications Popover */}
              <div className={styles.bellWrap} ref={notifRef}>
                <button 
                  className={styles.bellBtn} 
                  title="Notifications"
                  onClick={() => setShowNotifications(prev => !prev)}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && <span className={styles.bellDot} />}
                </button>

                {showNotifications && (
                  <div className={styles.notificationDropdown}>
                    <div className={styles.notifHeader}>
                      <div className={styles.notifTitleBox}>
                        <h4 className={styles.notifTitle}>Notifications</h4>
                        {unreadCount > 0 && (
                          <span className={styles.notifBadge}>{unreadCount} New</span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllRead} className={styles.notifMarkAllBtn}>
                          <Check size={12} /> Mark read
                        </button>
                      )}
                    </div>

                    <div className={styles.notifList}>
                      {activePromo && (
                        <div className={`${styles.notifItem} ${unreadCount > 0 ? styles.notifItemUnread : ''}`}>
                          <div className={styles.notifIconBox}>
                            <Gift size={18} color="#0284C7" />
                          </div>
                          <div className={styles.notifContent}>
                            <div className={styles.notifItemHeader}>
                              <span className={styles.notifItemTag}>SPECIAL OFFER</span>
                              <span className={styles.notifTime}>Active</span>
                            </div>
                            <div className={styles.notifItemTitle}>
                              New Coupon Code: <strong>{activePromo.code}</strong>
                            </div>
                            <div className={styles.notifItemBody}>
                              Use code <strong>{activePromo.code}</strong> on Plans page to get <strong>{activePromo.benefit}</strong>! (1 use/account)
                            </div>
                            <Link 
                              to={`/subscribe?code=${activePromo.code}`} 
                              onClick={() => {
                                handleMarkAllRead();
                                setShowNotifications(false);
                              }}
                              className={styles.notifActionBtn}
                            >
                              Redeem Coupon →
                            </Link>
                          </div>
                        </div>
                      )}

                      <div className={styles.notifItem}>
                        <div className={styles.notifIconBoxGray}>
                          <Sparkles size={16} color="#475569" />
                        </div>
                        <div className={styles.notifContent}>
                          <div className={styles.notifItemHeader}>
                            <span className={styles.notifItemTagInfo}>STUDY TIP</span>
                            <span className={styles.notifTime}>Today</span>
                          </div>
                          <div className={styles.notifItemTitle}>
                            Keep up your study streak!
                          </div>
                          <div className={styles.notifItemBody}>
                            Complete 10 test MCQs today to maintain your daily streak and earn points.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Link to="/profile" className={styles.avatarBtn} title="View Profile" style={{ overflow: 'hidden', padding: 0 }}>
                {avatarUrl ? (
                  <img src={avatarUrl} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                ) : (
                  initial
                )}
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
