import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ChevronLeft, User, Mail, Shield, Calendar, LogOut,
  CheckCircle, XCircle, Crown, Clock, BookOpen, Brain,
  Trophy, Flame, BarChart2, Star, ArrowRight, Bell,
  Lock, Zap, Target, Award, ChevronRight, Settings,
  KeyRound, Check, AlertCircle, Eye, EyeOff, Camera
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
  const { user, profile, subscription, isSubscribed, signOut, updatePassword, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef(null);

  // Avatar & 1-Time Name Change State
  const isSuper = user?.email?.toLowerCase() === 'mohd6396889713@gmail.com' || profile?.role === 'admin' || profile?.isSuperAdmin;
  const currentName = user?.user_metadata?.full_name || profile?.name || (isSuper ? 'Sameer Ahmad' : (profile?.full_name || user?.email?.split('@')[0] || 'Student'));
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || '';
  const hasChangedName = Boolean(user?.user_metadata?.name_changed || profile?.name_changed);

  const [editName, setEditName] = useState(currentName);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  const handleAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setProfileErr('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }
    setProfileErr('');
    setProfileSaving(true);
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = async () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 240;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          const minSide = Math.min(img.width, img.height);
          const sx = (img.width - minSide) / 2;
          const sy = (img.height - minSide) / 2;
          ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          await updateUserProfile({ avatarUrl: compressed });
          setProfileMsg('Profile photo updated!');
          setTimeout(() => setProfileMsg(''), 4000);
        } catch (err) {
          setProfileErr(err.message || 'Failed to upload profile photo.');
        } finally {
          setProfileSaving(false);
        }
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  const handleOneTimeNameChange = async (e) => {
    e.preventDefault();
    if (hasChangedName) return;
    const trimmed = editName.trim();
    if (trimmed.length < 2) {
      setProfileErr('Please enter at least 2 characters for your name.');
      return;
    }
    setProfileErr('');
    setProfileMsg('');
    setProfileSaving(true);
    try {
      await updateUserProfile({ fullName: trimmed, markNameChanged: true });
      setProfileMsg('Name updated! (1-time name change is now locked.)');
      setTimeout(() => setProfileMsg(''), 5000);
    } catch (err) {
      setProfileErr(err.message || 'Failed to update name.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Security / Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPwError('');
    setPwSuccess('');
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPwError('Passwords do not match.');
      return;
    }
    setPwLoading(true);
    try {
      await updatePassword(newPassword);
      setPwSuccess('Password successfully updated!');
      setNewPassword('');
      setConfirmNewPassword('');
      setTimeout(() => setPwSuccess(''), 5000);
    } catch (err) {
      setPwError(err.message || 'Failed to update password.');
    } finally {
      setPwLoading(false);
    }
  };

  const name  = currentName;
  const email = user?.email || (isSuper ? 'mohd6396889713@gmail.com' : '');
  const role  = isSuper ? 'Super Admin' : (profile?.role || 'student');
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const daysLeft = subscription?.end_date
    ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000))
    : (isSuper ? 3650 : null);

  const subStart = subscription?.start_date
    ? new Date(subscription.start_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    : (isSuper ? 'Permanent' : null);

  const subEnd = isSuper 
    ? 'Lifetime VIP' 
    : (subscription?.end_date ? new Date(subscription.end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

  // Progress bar for subscription days used
  const totalDays = subscription?.start_date && subscription?.end_date
    ? Math.ceil((new Date(subscription.end_date) - new Date(subscription.start_date)) / 86400000)
    : null;
  const usedDays = totalDays && daysLeft !== null ? totalDays - daysLeft : null;
  const progressPct = totalDays ? Math.max(0, Math.min(100, (usedDays / totalDays) * 100)) : 0;

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

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

        {/* ── Super Admin Control Card ── */}
        {isSuper && (
          <div className={styles.adminControlCard}>
            <div className={styles.adminCardHeader}>
              <div className={styles.adminCardTitleBlock}>
                <Shield size={22} color="#FBBF24" />
                <span className={styles.adminCardTitle}>Super Admin Control Center</span>
              </div>
              <span className={styles.superAdminBadge}>★ Super Admin</span>
            </div>
            <p className={styles.adminCardDesc}>
              Welcome, <strong>Sameer Ahmad</strong>! Full platform administrative authority is enabled. You have unrestricted access to manage users, courses, subjects, MCQs, payments, and system controls.
            </p>
            <div className={styles.adminBtnRow}>
              <Link 
                to="/admin" 
                className={styles.adminLaunchBtn}
              >
                <Zap size={16} /> Open Admin Control Panel <ArrowRight size={14} />
              </Link>
              <Link to="/home" className={styles.adminSecondaryBtn}>
                <BookOpen size={15} /> Student Mode View
              </Link>
            </div>
          </div>
        )}

        {/* ── Hero Avatar Card ── */}
        <div className={styles.avatarCard}>
          <div className={styles.avatarBg} />
          <div className={styles.avatarTopRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div
                className={styles.avatarCircle}
                onClick={() => fileInputRef.current?.click()}
                style={{ cursor: 'pointer', position: 'relative', overflow: 'hidden' }}
                title="Click to change profile photo"
              >
                {avatarUrl ? (
                  <img src={avatarUrl} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  initials
                )}
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={profileSaving}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 12px', borderRadius: 999,
                  background: 'rgba(255,255,255,0.18)', border: '1px solid rgba(255,255,255,0.35)',
                  color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                }}
              >
                <Camera size={14} />
                <span>{profileSaving ? 'Saving...' : 'Change Photo'}</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                style={{ display: 'none' }}
              />
            </div>
            {isSuper ? (
              <span className={styles.superAdminBadge}><Crown size={12} /> Super Admin</span>
            ) : role === 'admin' && (
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
              <span className={styles.avatarMetaVal}>{isSuper ? '✓ Lifetime VIP' : (isSubscribed ? '✓ Active' : 'Free')}</span>
              <span className={styles.avatarMetaLabel}>Plan</span>
            </div>
          </div>
        </div>

        {/* ── Subscription Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Crown size={18} color="#FBBF24" />
            <span>Subscription Plan</span>
            {(isSubscribed || isSuper) && <span className={styles.activePill}>ACTIVE</span>}
          </div>

          {(isSubscribed || isSuper) ? (
            <div className={styles.subActive}>
              <div className={styles.subTopRow}>
                <div className={styles.subIconBox}>
                  <Crown size={28} color="#F59E0B" />
                </div>
                <div>
                  <div className={styles.subPlanName}>{isSuper ? 'Super Admin Lifetime Pass' : 'Premium Access'}</div>
                  <div className={styles.subPlanDesc}>{isSuper ? 'Unrestricted Lifetime Access · All 6 Medical Courses · 8,000+ MCQs · Full Admin Privileges' : 'All 6 courses · All MCQs · AI Assistant'}</div>
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
                    <Clock size={14} color={isSuper ? '#10B981' : '#EF4444'} />
                    <div>
                      <div className={styles.subDateLabel}>{isSuper ? 'Access Status' : 'Expiry Date'}</div>
                      <div className={styles.subDateVal}>{subEnd}</div>
                    </div>
                  </div>
                )}
              </div>

              {!isSuper && totalDays && (
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

              {!isSuper && daysLeft !== null && daysLeft <= 7 && (
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

        {/* ── Edit Profile (Photo & 1-Time Name Change) ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Settings size={18} color="#2563EB" />
            <span>Profile Settings</span>
            {hasChangedName && (
              <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 800, color: '#B45309', background: '#FEF3C7', padding: '3px 10px', borderRadius: 999 }}>
                🔒 Name Locked
              </span>
            )}
          </div>

          {profileMsg && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              <Check size={16} /> <span>{profileMsg}</span>
            </div>
          )}
          {profileErr && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 12, background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', fontSize: 13, fontWeight: 600, marginBottom: 14 }}>
              <AlertCircle size={16} /> <span>{profileErr}</span>
            </div>
          )}

          <form onSubmit={handleOneTimeNameChange} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12.5, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Full Name {hasChangedName ? '(Already Changed Once — Locked)' : '(Can be changed ONE TIME only)'}
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={hasChangedName ? name : editName}
                  disabled={hasChangedName || profileSaving}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{
                    flex: 1, minWidth: 220, padding: '10px 14px', borderRadius: 12,
                    border: '1.5px solid #CBD5E1', fontSize: 14, fontWeight: 600,
                    background: hasChangedName ? '#F1F5F9' : '#FFFFFF',
                    color: hasChangedName ? '#64748B' : '#0F172A'
                  }}
                />
                {!hasChangedName && (
                  <button
                    type="submit"
                    disabled={profileSaving}
                    style={{
                      padding: '10px 18px', borderRadius: 12, border: 'none',
                      background: 'linear-gradient(135deg, #1D4ED8 0%, #2563EB 100%)',
                      color: '#fff', fontWeight: 800, fontSize: 13.5, cursor: 'pointer'
                    }}
                  >
                    {profileSaving ? 'Saving...' : 'Save Name (1-Time)'}
                  </button>
                )}
              </div>
            </div>
          </form>
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

        {/* ── Security & Change Password Card ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <KeyRound size={18} color="#0EA5E9" />
            <span>Security & Password</span>
          </div>
          
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '16px', lineHeight: 1.5 }}>
            You are securely authenticated. Update your password here anytime without needing an email reset link.
          </p>

          {pwSuccess && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
              <Check size={16} />
              <span>{pwSuccess}</span>
            </div>
          )}

          {pwError && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '12px', background: '#FEF2F2', color: '#991B1B', border: '1px solid #FECACA', fontSize: '13px', fontWeight: 600, marginBottom: '14px' }}>
              <AlertCircle size={16} />
              <span>{pwError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                New Password (minimum 6 characters)
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter new secure password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{ width: '100%', padding: '10px 40px 10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#475569', marginBottom: '6px' }}>
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Confirm new secure password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', border: '1.5px solid #CBD5E1', fontSize: '14px', outline: 'none' }}
              />
            </div>

            <button
              type="submit"
              disabled={pwLoading || !newPassword || !confirmNewPassword}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px',
                borderRadius: '12px',
                background: pwLoading || !newPassword || !confirmNewPassword ? '#94A3B8' : 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                color: '#fff',
                fontWeight: 700,
                fontSize: '14px',
                border: 'none',
                cursor: pwLoading || !newPassword || !confirmNewPassword ? 'not-allowed' : 'pointer',
                marginTop: '4px',
                boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
              }}
            >
              <KeyRound size={16} />
              <span>{pwLoading ? 'Updating Password...' : 'Save New Password'}</span>
            </button>
          </form>
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

        <p className={styles.versionTag}>SAMU MCQs · v2.1 · © 2026</p>
      </div>
      <Footer />
    </div>
  );
}
