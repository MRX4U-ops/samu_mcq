import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import {
  ChevronLeft, User, Mail, Shield, Calendar, LogOut,
  CheckCircle, XCircle, Crown, Clock
} from 'lucide-react';
import styles from './ProfilePage.module.css';

export default function ProfilePage() {
  const { user, profile, subscription, isSubscribed, signOut } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const email = user?.email || '';
  const role = profile?.role || 'student';

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000))
    : null;

  const subStart = subscription?.start_date
    ? new Date(subscription.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const subEnd = subscription?.end_date
    ? new Date(subscription.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : null;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/');
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>

        {/* Header */}
        <div className={styles.header}>
          <Link to="/home" className={styles.backBtn}>
            <ChevronLeft size={24} />
            <span>Back</span>
          </Link>
          <h1 className={styles.title}>My Profile</h1>
        </div>

        {/* Avatar Card */}
        <div className={styles.avatarCard}>
          <div className={styles.avatarCircle}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div className={styles.avatarInfo}>
            <h2 className={styles.avatarName}>{name}</h2>
            <p className={styles.avatarEmail}>{email}</p>
            {role === 'admin' && (
              <span className={styles.adminBadge}>
                <Shield size={12} /> Admin
              </span>
            )}
          </div>
        </div>

        {/* Subscription Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Crown size={18} color="#FBBF24" />
            <span>Subscription</span>
          </div>

          {isSubscribed ? (
            <div className={styles.subActive}>
              <div className={styles.subStatusRow}>
                <CheckCircle size={20} color="#10B981" />
                <span className={styles.subStatusText}>Active Subscription</span>
              </div>
              {subStart && (
                <div className={styles.subDetail}>
                  <Calendar size={14} color="var(--text-muted)" />
                  <span>Started: <strong>{subStart}</strong></span>
                </div>
              )}
              {subEnd && (
                <div className={styles.subDetail}>
                  <Clock size={14} color="var(--text-muted)" />
                  <span>Expires: <strong>{subEnd}</strong></span>
                </div>
              )}
              {daysLeft !== null && (
                <div className={`${styles.daysLeftBadge} ${daysLeft <= 7 ? styles.daysLeftWarn : ''}`}>
                  {daysLeft === 0 ? 'Expires today!' : `${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.subInactive}>
              <div className={styles.subStatusRow}>
                <XCircle size={20} color="#EF4444" />
                <span className={styles.subStatusTextRed}>No Active Subscription</span>
              </div>
              <p className={styles.subHint}>Subscribe to unlock all 6 courses and thousands of MCQs.</p>
              <Link to="/subscribe" className="btn btn-primary" style={{ display: 'inline-flex', gap: 8, marginTop: 12 }}>
                <Crown size={16} /> Subscribe Now
              </Link>
            </div>
          )}
        </div>

        {/* Account Details Card */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={18} color="#3B82F6" />
            <span>Account Details</span>
          </div>
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Full Name</span>
            <span className={styles.detailValue}>{name}</span>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Email</span>
            <div className={styles.emailRow}>
              <Mail size={14} color="var(--text-muted)" />
              <span className={styles.detailValue}>{email}</span>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.detailRow}>
            <span className={styles.detailLabel}>Account Type</span>
            <span className={styles.detailValue} style={{ textTransform: 'capitalize' }}>{role}</span>
          </div>
        </div>

        {/* Logout */}
        <button
          className={styles.logoutBtn}
          onClick={handleLogout}
          disabled={loggingOut}
        >
          <LogOut size={18} />
          <span>{loggingOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

      </div>
    </div>
  );
}
