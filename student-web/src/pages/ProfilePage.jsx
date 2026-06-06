import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  ChevronLeft, User, Mail, Shield, Calendar, LogOut,
  CheckCircle, XCircle, Crown, Clock, BookOpen, Brain,
  Trophy, Flame, BarChart2, Star, ArrowRight, Bell,
  Lock, Zap, Target, Award, ChevronRight, Settings
} from 'lucide-react';
import styles from './ProfilePage.module.css';

const QUICK_LINKS = [
  { icon: BookOpen,  color: '#3B82F6', bg: '#EFF6FF', label: 'Browse Courses',   to: '/home' },
  { icon: Brain,     color: '#8B5CF6', bg: '#F5F3FF', label: 'AI Assistant',     to: '/ask-ai' },
  { icon: Trophy,    color: '#F59E0B', bg: '#FFFBEB', label: 'Leaderboard',      to: '/leaderboard' },
  { icon: Target,    color: '#10B981', bg: '#F0FDF4', label: 'Battle Mode',      to: '/battle' },
  { icon: Zap,       color: '#EF4444', bg: '#FFF1F2', label: 'Revision Engine',  to: '/revision' },
  { icon: Bell,      color: '#06B6D4', bg: '#ECFEFF', label: 'Help & Support',   to: '/help' },
];

export default function ProfilePage() {
  const { user, profile, subscription, isSubscribed, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const name  = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';
  const role  = profile?.role || 'student';
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000))
    : null;

  const subStart = subscription?.start_date
    ? new Date(subscription.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const subEnd = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  // Progress bar for subscription days used
  const totalDays = subscription?.start_date && subscription?.end_date
    ? Math.ceil((new Date(subscription.end_date) - new Date(subscription.start_date)) / 86400000)
    : null;
  const usedDays = totalDays && daysLeft !== null ? totalDays - daysLeft : null;
  const progressPct = totalDays ? Math.max(0, Math.min(100, (usedDays / totalDays) * 100)) : 0;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        {/* ── Header ── */}
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={18} />
            <span>Back</span>
          </Link>
          <h1 className={styles.title}>My Profile</h1>
        </div>

        {/* ── Hero Avatar Card ── */}
        <div className={styles.avatarCard}>
          <div className={styles.avatarBg} />
          <div className={styles.avatarTopRow}>
            <div className={styles.avatarCircle}>{initials}</div>
            {role === 'admin' && (
              <span className={styles.adminBadge}><Shield size={12} /> Admin</span>
            )}
          </div>
          <div className={styles.avatarInfo}>
            <h2 className={styles.avatarName}>{name}</h2>
            <p className={styles.avatarEmail}><Mail size={13} /> {email}</p>
          </div>
          <div className={styles.avatarMeta}>
            <div className={styles.avatarMetaItem}>
              <span className={styles.avatarMetaVal}>SAMU</span>
              <span className={styles.avatarMetaLabel}>University</span>
            </div>
            <div className={styles.avatarMetaDivider} />
            <div className={styles.avatarMetaItem}>
              <span className={styles.avatarMetaVal} style={{ textTransform: 'capitalize' }}>{role}</span>
              <span className={styles.avatarMetaLabel}>Account Type</span>
            </div>
            <div className={styles.avatarMetaDivider} />
            <div className={styles.avatarMetaItem}>
              <span className={styles.avatarMetaVal}>{isSubscribed ? '✓ Active' : 'Free'}</span>
              <span className={styles.avatarMetaLabel}>Plan</span>
            </div>
          </div>
        </div>

        {/* ── Subscription Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Crown size={18} color="#FBBF24" />
            <span>Subscription Plan</span>
            {isSubscribed && <span className={styles.activePill}>ACTIVE</span>}
          </div>

          {isSubscribed ? (
            <div className={styles.subActive}>
              <div className={styles.subTopRow}>
                <div className={styles.subIconBox}>
                  <Crown size={28} color="#F59E0B" />
                </div>
                <div>
                  <div className={styles.subPlanName}>Premium Access</div>
                  <div className={styles.subPlanDesc}>All 6 courses · All MCQs · AI Assistant</div>
                </div>
                <CheckCircle size={24} color="#10B981" style={{ marginLeft: 'auto', flexShrink: 0 }} />
              </div>

              <div className={styles.subDates}>
                {subStart && (
                  <div className={styles.subDateItem}>
                    <Calendar size={14} color="#6366f1" />
                    <div>
                      <div className={styles.subDateLabel}>Start Date</div>
                      <div className={styles.subDateVal}>{subStart}</div>
                    </div>
                  </div>
                )}
                {subEnd && (
                  <div className={styles.subDateItem}>
                    <Clock size={14} color="#EF4444" />
                    <div>
                      <div className={styles.subDateLabel}>Expiry Date</div>
                      <div className={styles.subDateVal}>{subEnd}</div>
                    </div>
                  </div>
                )}
              </div>

              {totalDays && (
                <div className={styles.progressSection}>
                  <div className={styles.progressLabels}>
                    <span>{usedDays} days used</span>
                    <span style={{ color: daysLeft <= 7 ? '#EF4444' : '#10B981', fontWeight: 800 }}>
                      {daysLeft} days left
                    </span>
                  </div>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progressPct}%`, background: daysLeft <= 7 ? '#EF4444' : 'linear-gradient(90deg, #6366f1, #8b5cf6)' }}
                    />
                  </div>
                </div>
              )}

              {daysLeft !== null && daysLeft <= 7 && (
                <div className={styles.expiryWarning}>
                  <span>⚠️ Your subscription expires soon!</span>
                  <Link to="/subscribe" className={styles.renewLink}>Renew Now <ArrowRight size={12} /></Link>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.subInactive}>
              <div className={styles.subLockedBox}>
                <Lock size={32} color="#d1d5db" />
                <div>
                  <div className={styles.subLockedTitle}>No Active Subscription</div>
                  <div className={styles.subLockedDesc}>Subscribe to unlock all 6 courses, 8,000+ MCQs, AI Assistant, and Battle Mode.</div>
                </div>
              </div>
              <div className={styles.subBenefits}>
                {['All 6 Medical Courses', '8,000+ MCQs & Case Tasks', 'AI Study Assistant', 'Battle Mode & Leaderboard'].map(b => (
                  <div key={b} className={styles.subBenefitItem}>
                    <CheckCircle size={14} color="#10B981" fill="#10B981" />
                    <span>{b}</span>
                  </div>
                ))}
              </div>
              <Link to="/subscribe" className="btn btn-primary" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Crown size={16} /> Unlock Premium Access <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ── Account Details Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={18} color="#3B82F6" />
            <span>Account Details</span>
          </div>
          <div className={styles.detailRow}>
            <div className={styles.detailLeft}>
              <div className={styles.detailIcon} style={{ background: '#EFF6FF' }}><User size={15} color="#3B82F6" /></div>
              <span className={styles.detailLabel}>Full Name</span>
            </div>
            <span className={styles.detailValue}>{name}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <div className={styles.detailLeft}>
              <div className={styles.detailIcon} style={{ background: '#F5F3FF' }}><Mail size={15} color="#8B5CF6" /></div>
              <span className={styles.detailLabel}>Email Address</span>
            </div>
            <span className={styles.detailValue} style={{ maxWidth: 200, textAlign: 'right', wordBreak: 'break-all', fontSize: 12 }}>{email}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <div className={styles.detailLeft}>
              <div className={styles.detailIcon} style={{ background: '#F0FDF4' }}><Shield size={15} color="#10B981" /></div>
              <span className={styles.detailLabel}>Account Type</span>
            </div>
            <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{role}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <div className={styles.detailLeft}>
              <div className={styles.detailIcon} style={{ background: '#FFFBEB' }}><Award size={15} color="#F59E0B" /></div>
              <span className={styles.detailLabel}>Status</span>
            </div>
            <span className={styles.detailValue} style={{ color: isSubscribed ? '#10B981' : '#EF4444' }}>
              {isSubscribed ? '✓ Premium' : 'Free Plan'}
            </span>
          </div>
        </div>

        {/* ── Quick Access ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Zap size={18} color="#6366f1" />
            <span>Quick Access</span>
          </div>
          <div className={styles.quickGrid}>
            {QUICK_LINKS.map(ql => (
              <Link key={ql.label} to={ql.to} className={styles.quickItem}>
                <div className={styles.quickIcon} style={{ background: ql.bg }}>
                  <ql.icon size={20} color={ql.color} />
                </div>
                <span className={styles.quickLabel}>{ql.label}</span>
                <ChevronRight size={14} color="#d1d5db" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Logout ── */}
        <button className={styles.logoutBtn} onClick={handleLogout} disabled={loggingOut}>
          <LogOut size={18} />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        <p className={styles.versionTag}>SAMU MCQs · v2.0 · © 2025</p>
      </div>
    </div>
  );
}
