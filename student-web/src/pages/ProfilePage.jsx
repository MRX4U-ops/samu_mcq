import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getStats as getRevisionStats, getWeakSubjects } from '../lib/revisionEngine';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import {
  ChevronLeft, User, Mail, Shield, Calendar, LogOut,
  CheckCircle, Crown, Clock, BookOpen, Brain,
  Trophy, Flame, BarChart2, ArrowRight, Bell,
  Lock, Zap, Target, Award, ChevronRight, Settings,
  KeyRound, Check, AlertCircle, Eye, EyeOff, Camera,
  Phone, Hash, GraduationCap, MonitorSmartphone, Trash2,
  Send, MessageCircle, Megaphone, RefreshCw, Ticket
} from 'lucide-react';
import styles from './ProfilePage.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';
const DEVICE_SESSION_KEY = 'samu_device_session_id';

const QUICK_LINKS = [
  { icon: BookOpen, color: '#3B82F6', bg: '#EFF6FF', label: 'Browse Courses',  to: '/home' },
  { icon: Brain,    color: '#8B5CF6', bg: '#F5F3FF', label: 'AI Assistant',    to: '/ask-ai' },
  { icon: Trophy,   color: '#F59E0B', bg: '#FFFBEB', label: 'Leaderboard',     to: '/leaderboard' },
  { icon: Target,   color: '#10B981', bg: '#F0FDF4', label: 'Battle Mode',     to: '/battle' },
  { icon: Zap,      color: '#EF4444', bg: '#FFF1F2', label: 'Revision Engine', to: '/revision' },
  { icon: Bell,     color: '#06B6D4', bg: '#ECFEFF', label: 'Plans & Billing', to: '/subscribe' },
];

const STATUS_BADGE_MAP = {
  ACTIVE:               { label: 'ACTIVE',               bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
  PAYMENT_VERIFICATION: { label: 'UNDER VERIFICATION',   bg: 'rgba(245,158,11,0.14)', color: '#B45309', border: 'rgba(245,158,11,0.35)' },
  PENDING_PAYMENT:      { label: 'PENDING PAYMENT',      bg: 'rgba(59,130,246,0.12)', color: '#1D4ED8', border: 'rgba(59,130,246,0.3)' },
  EXPIRED:              { label: 'EXPIRED',              bg: 'rgba(239,68,68,0.12)',  color: '#DC2626', border: 'rgba(239,68,68,0.3)' },
  REJECTED:             { label: 'PAYMENT REJECTED',     bg: 'rgba(239,68,68,0.12)',  color: '#DC2626', border: 'rgba(239,68,68,0.3)' },
  SUSPENDED:            { label: 'SUSPENDED',            bg: 'rgba(225,29,72,0.12)',  color: '#BE123C', border: 'rgba(225,29,72,0.3)' },
  CANCELLED:            { label: 'CANCELLED',            bg: 'rgba(107,114,128,0.12)',color: '#4B5563', border: 'rgba(107,114,128,0.3)' },
  FREE:                 { label: 'FREE PLAN',            bg: 'rgba(100,116,139,0.12)',color: '#475569', border: 'rgba(100,116,139,0.25)' },
};

export default function ProfilePage() {
  const { user, profile, subscription, subscriptionState, isSubscribed, signOut, updatePassword, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);
  const fileInputRef = useRef(null);

  const isSuper = user?.email?.toLowerCase() === 'mohd6396889713@gmail.com' || profile?.role === 'admin' || profile?.isSuperAdmin;
  const currentName = user?.user_metadata?.full_name || profile?.name || (isSuper ? 'Sameer Ahmad' : (profile?.full_name || user?.email?.split('@')[0] || 'Student'));
  const avatarUrl = user?.user_metadata?.avatar_url || profile?.avatar_url || '';
  const hasChangedName = Boolean(user?.user_metadata?.name_changed || profile?.name_changed);

  // Full Profile Dashboard Data from Backend
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [fullData, setFullData] = useState(null);

  // 1. Personal Details Form State
  const [editName, setEditName] = useState(currentName);
  const [phone, setPhone] = useState(profile?.phone || user?.user_metadata?.phone || '');
  const [hemisId, setHemisId] = useState(profile?.hemis_id || user?.user_metadata?.hemis_id || '');
  const [courseYear, setCourseYear] = useState(profile?.course_year || user?.user_metadata?.course_year || '');
  const [semester, setSemester] = useState(profile?.semester || user?.user_metadata?.semester || '');
  const [editingDetails, setEditingDetails] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');

  // 4. Device Management State
  const [deviceLoading, setDeviceLoading] = useState(false);
  const [deviceMsg, setDeviceMsg] = useState('');
  const currentLocalSid = (() => {
    try { return localStorage.getItem(DEVICE_SESSION_KEY) || ''; } catch { return ''; }
  })();

  // 5. Help Desk Quick Ticket State
  const [ticketTitle, setTicketTitle] = useState('');
  const [ticketCategory, setTicketCategory] = useState('General Support');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketSubmitting, setTicketSubmitting] = useState(false);
  const [ticketMsg, setTicketMsg] = useState('');
  const [ticketErr, setTicketErr] = useState('');

  // 6. Notifications State
  const [notifLoading, setNotifLoading] = useState(false);

  // 7. Security / Password Change State
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwError, setPwError] = useState('');

  const getToken = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || null;
  };

  const loadFullProfile = useCallback(async () => {
    if (!user?.id) return;
    setDashboardLoading(true);
    try {
      const token = await getToken();
      if (!token) return;
      const res = await fetch(`${API_BASE_URL}/api/users/profile/full`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setFullData(data);
        if (data?.personal) {
          setPhone(data.personal.phone || '');
          setHemisId(data.personal.hemisId || '');
          setCourseYear(data.personal.courseYear || '');
          setSemester(data.personal.semester || '');
        }
      }
    } catch (e) {
      console.warn('Profile full load warning:', e.message);
    } finally {
      setDashboardLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadFullProfile();
  }, [loadFullProfile]);

  // Avatar Upload
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

  // 1-Time Name Change
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

  // Save Mobile, HEMIS ID, Course Year, Semester
  const handleSavePersonalDetails = async (e) => {
    e.preventDefault();
    setProfileErr('');
    setProfileMsg('');
    setProfileSaving(true);
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/users/profile/details`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ phone, hemisId, courseYear, semester }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to save details');
      setProfileMsg('Personal details updated successfully!');
      setEditingDetails(false);
      await loadFullProfile();
      setTimeout(() => setProfileMsg(''), 4000);
    } catch (err) {
      setProfileErr(err.message || 'Failed to update personal details.');
    } finally {
      setProfileSaving(false);
    }
  };

  // Device Actions
  const handleRemoveDevice = async (deviceId) => {
    setDeviceLoading(true);
    setDeviceMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/users/devices/${encodeURIComponent(deviceId)}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Failed to remove device session');
      if (deviceId === currentLocalSid) {
        await handleLogout();
        return;
      }
      setDeviceMsg('Device session removed.');
      await loadFullProfile();
    } catch (err) {
      setDeviceMsg(err.message);
    } finally {
      setDeviceLoading(false);
    }
  };

  const handleLogoutOtherDevices = async () => {
    setDeviceLoading(true);
    setDeviceMsg('');
    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE_URL}/api/users/devices/logout-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ keepSessionId: currentLocalSid }),
      });
      if (!res.ok) throw new Error('Failed to sign out other devices');
      setDeviceMsg('All other device sessions signed out.');
      await loadFullProfile();
    } catch (err) {
      setDeviceMsg(err.message);
    } finally {
      setDeviceLoading(false);
    }
  };

  // Support Ticket Submit
  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticketTitle.trim() || !ticketDesc.trim()) {
      setTicketErr('Please enter both a subject and message.');
      return;
    }
    setTicketSubmitting(true);
    setTicketErr('');
    setTicketMsg('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/support/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': user?.id,
        },
        body: JSON.stringify({
          title: ticketTitle.trim(),
          category: ticketCategory,
          description: ticketDesc.trim(),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || 'Failed to submit support ticket');
      setTicketMsg('Support ticket submitted! Our team will respond shortly.');
      setTicketTitle('');
      setTicketDesc('');
      await loadFullProfile();
      setTimeout(() => setTicketMsg(''), 4000);
    } catch (err) {
      setTicketErr(err.message || 'Could not submit ticket.');
    } finally {
      setTicketSubmitting(false);
    }
  };

  // Mark Notification(s) Read
  const handleMarkNotificationsRead = async (notificationId = null) => {
    setNotifLoading(true);
    try {
      const token = await getToken();
      await fetch(`${API_BASE_URL}/api/users/notifications/read`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(notificationId ? { notificationId } : {}),
      });
      await loadFullProfile();
    } catch {}
    finally {
      setNotifLoading(false);
    }
  };

  // Update Password
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

  const name = currentName;
  const email = fullData?.personal?.email || user?.email || (isSuper ? 'mohd6396889713@gmail.com' : '');
  const role = isSuper ? 'Super Admin' : (profile?.role || 'student');
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || 'S';

  const subInfo = fullData?.subscription || subscriptionState;
  const effectiveSubStatus = isSuper ? 'ACTIVE' : (subInfo?.status || (isSubscribed ? 'ACTIVE' : 'FREE'));
  const badgeStyle = STATUS_BADGE_MAP[effectiveSubStatus] || STATUS_BADGE_MAP.FREE;

  const daysLeft = isSuper
    ? 3650
    : (subInfo?.remainingDays ?? (subscription?.end_date ? Math.max(0, Math.ceil((new Date(subscription.end_date) - new Date()) / 86400000)) : null));

  const rawStartDate = subInfo?.startDate || subscription?.start_date;
  const rawEndDate = subInfo?.endDate || subscription?.end_date;

  const subStart = isSuper
    ? 'Permanent'
    : (rawStartDate ? new Date(rawStartDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

  const subEnd = isSuper
    ? 'Lifetime VIP'
    : (rawEndDate ? new Date(rawEndDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : null);

  const totalDays = rawStartDate && rawEndDate
    ? Math.max(1, Math.ceil((new Date(rawEndDate) - new Date(rawStartDate)) / 86400000))
    : null;
  const usedDays = totalDays && daysLeft !== null ? Math.max(0, totalDays - daysLeft) : null;
  const progressPct = totalDays ? Math.max(0, Math.min(100, (usedDays / totalDays) * 100)) : 0;

  // Combined Learning Progress & Quiz Performance
  const localRev = getRevisionStats();
  const weakSubjects = getWeakSubjects().slice(0, 3);
  const backendProg = fullData?.progress || {};
  const totalAttempted = Math.max(backendProg.totalAttempted || 0, localRev.total || 0);
  const totalCorrect = Math.max(backendProg.totalCorrect || 0, localRev.correct || 0);
  const totalWrong = Math.max(backendProg.totalWrong || 0, localRev.wrong || 0);
  const accuracyPct = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : (backendProg.accuracy || 0);
  const currentStreak = backendProg.currentStreak || 0;
  const monthlyPoints = backendProg.monthlyPoints || 0;
  const recentAttempts = backendProg.recentAttempts || [];

  const devices = fullData?.devices || [];
  const tickets = fullData?.tickets || [];
  const notifications = fullData?.notifications || [];
  const unreadNotifCount = notifications.filter(n => !n.is_read).length;
  const announcement = fullData?.announcement || '';

  const handleLogout = async () => {
    setLoggingOut(true);
    await signOut();
    navigate('/login');
  };

  const handleSignOutAll = async () => {
    setLoggingOut(true);
    try {
      const token = await getToken();
      if (token) {
        await fetch(`${API_BASE_URL}/api/users/devices/logout-all`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({}),
        });
      }
    } catch {}
    await signOut();
    navigate('/login');
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
          <button
            type="button"
            onClick={loadFullProfile}
            disabled={dashboardLoading}
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 12px', borderRadius: 10, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.06)', color: '#4F46E5', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
            title="Refresh profile data"
          >
            <RefreshCw size={14} className={dashboardLoading ? styles.spin : ''} />
            <span>Sync</span>
          </button>
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
              Welcome, <strong>Sameer Ahmad</strong>! Full platform administrative authority is enabled. Manage users, subscription pricing/days, payment verification, courses, and MCQs.
            </p>
            <div className={styles.adminBtnRow}>
              <Link to="/admin" className={styles.adminLaunchBtn}>
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
              <span className={styles.avatarMetaVal}>{courseYear || 'SAMU'}</span>
              <span className={styles.avatarMetaLabel}>{courseYear ? 'Course Year' : 'University'}</span>
            </div>
            <div className={styles.avatarMetaDivider} />
            <div className={styles.avatarMetaItem}>
              <span className={styles.avatarMetaVal}>{hemisId || role}</span>
              <span className={styles.avatarMetaLabel}>{hemisId ? 'HEMIS ID' : 'Account Type'}</span>
            </div>
            <div className={styles.avatarMetaDivider} />
            <div className={styles.avatarMetaItem}>
              <span className={styles.avatarMetaVal}>{isSuper ? '✓ Lifetime VIP' : effectiveSubStatus}</span>
              <span className={styles.avatarMetaLabel}>Subscription</span>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════
            1. PERSONAL ACCOUNT DETAILS
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <User size={18} color="#3B82F6" />
            <span>1. Personal Account Details</span>
            <button
              type="button"
              onClick={() => setEditingDetails((v) => !v)}
              style={{
                marginLeft: 'auto', padding: '4px 12px', borderRadius: 999,
                border: '1px solid #CBD5E1', background: editingDetails ? '#EEF2FF' : '#F8FAFC',
                color: '#1E40AF', fontSize: 11, fontWeight: 800, cursor: 'pointer'
              }}
            >
              {editingDetails ? 'Cancel' : 'Edit Details'}
            </button>
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

          {/* 1-Time Name Change Control */}
          {!hasChangedName && (
            <form onSubmit={handleOneTimeNameChange} style={{ marginBottom: 16, padding: 12, borderRadius: 14, background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 800, color: '#0F172A', marginBottom: 6 }}>
                Full Name (Can be updated ONE TIME only)
              </label>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <input
                  type="text"
                  value={editName}
                  disabled={profileSaving}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your full name"
                  style={{ flex: 1, minWidth: 200, padding: '8px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontWeight: 600 }}
                />
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{ padding: '8px 16px', borderRadius: 10, border: 'none', background: '#2563EB', color: '#fff', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}
                >
                  Save Name (1-Time)
                </button>
              </div>
            </form>
          )}

          {editingDetails ? (
            <form onSubmit={handleSavePersonalDetails} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Mobile Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 / +91 XXXXX XXXXX"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>HEMIS ID</label>
                <input
                  type="text"
                  value={hemisId}
                  onChange={(e) => setHemisId(e.target.value)}
                  placeholder="e.g. 394211100123"
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontWeight: 600 }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Course Year</label>
                <select
                  value={courseYear}
                  onChange={(e) => setCourseYear(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontWeight: 600, background: '#fff' }}
                >
                  <option value="">Select Year</option>
                  {['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', '6th Year'].map((yr) => (
                    <option key={yr} value={yr}>{yr}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#475569', marginBottom: 4 }}>Semester</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13.5, fontWeight: 600, background: '#fff' }}
                >
                  <option value="">Select Semester</option>
                  {Array.from({ length: 12 }, (_, i) => `Semester ${i + 1}`).map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{ padding: '10px 20px', borderRadius: 10, border: 'none', background: '#1D4ED8', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}
                >
                  {profileSaving ? 'Saving...' : 'Save Personal Details'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.detailRow}>
                <div className={styles.detailLeft}>
                  <div className={styles.detailIcon} style={{ background: '#EFF6FF' }}><User size={15} color="#3B82F6" /></div>
                  <span className={styles.detailLabel}>Full Name</span>
                </div>
                <span className={styles.detailValue}>
                  {name} {hasChangedName && <span style={{ fontSize: 11, color: '#B45309' }}>🔒</span>}
                </span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <div className={styles.detailLeft}>
                  <div className={styles.detailIcon} style={{ background: '#ECFDF5' }}><Phone size={15} color="#10B981" /></div>
                  <span className={styles.detailLabel}>Mobile Number</span>
                </div>
                <span className={styles.detailValue}>{phone || 'Not set (click Edit Details)'}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <div className={styles.detailLeft}>
                  <div className={styles.detailIcon} style={{ background: '#F5F3FF' }}><Mail size={15} color="#8B5CF6" /></div>
                  <span className={styles.detailLabel}>Email Address</span>
                </div>
                <span className={styles.detailValue} style={{ maxWidth: 240, textAlign: 'right', wordBreak: 'break-all', fontSize: 13 }}>{email}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <div className={styles.detailLeft}>
                  <div className={styles.detailIcon} style={{ background: '#FFFBEB' }}><Hash size={15} color="#F59E0B" /></div>
                  <span className={styles.detailLabel}>HEMIS ID</span>
                </div>
                <span className={styles.detailValue}>{hemisId || 'Not set'}</span>
              </div>
              <div className={styles.divider} />
              <div className={styles.detailRow}>
                <div className={styles.detailLeft}>
                  <div className={styles.detailIcon} style={{ background: '#ECFEFF' }}><GraduationCap size={15} color="#06B6D4" /></div>
                  <span className={styles.detailLabel}>Course Year & Semester</span>
                </div>
                <span className={styles.detailValue}>
                  {courseYear || semester ? `${courseYear || '—'} · ${semester || '—'}` : 'Not set'}
                </span>
              </div>
            </>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            2. SUBSCRIPTION STATUS & EXPIRY
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Crown size={18} color="#FBBF24" />
            <span>2. Subscription Status & Expiry</span>
            <span
              style={{
                marginLeft: 'auto', fontSize: 10, fontWeight: 900,
                background: badgeStyle.bg, color: badgeStyle.color,
                border: `1px solid ${badgeStyle.border}`,
                borderRadius: 999, padding: '3px 10px', letterSpacing: 0.8
              }}
            >
              {badgeStyle.label}
            </span>
          </div>

          {(isSubscribed || isSuper) ? (
            <div className={styles.subActive}>
              <div className={styles.subTopRow}>
                <div className={styles.subIconBox}>
                  <Crown size={28} color="#F59E0B" />
                </div>
                <div>
                  <div className={styles.subPlanName}>
                    {isSuper ? 'Super Admin Lifetime Pass' : (subInfo?.planName || 'Premium Access')}
                  </div>
                  <div className={styles.subPlanDesc}>
                    {isSuper
                      ? 'Unrestricted Lifetime Access · All 6 Medical Courses · Full Admin Privileges'
                      : `All 6 courses · 8,000+ MCQs · AI Tutor · Battle Mode${subInfo?.price != null ? ` · ₹${subInfo.price}` : ''}`}
                  </div>
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

              {!isSuper && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
                  {daysLeft !== null && daysLeft <= 7 ? (
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: '#DC2626' }}>
                      ⚠️ Your subscription expires soon!
                    </span>
                  ) : (
                    <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>
                      Renewing before expiry extends directly from your current expiry date.
                    </span>
                  )}
                  <Link to="/subscribe" className={styles.renewLink}>
                    Renew / View Payment History <ArrowRight size={13} />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className={styles.subInactive}>
              <div className={styles.subLockedBox}>
                <Lock size={32} color="#94A3B8" />
                <div>
                  <div className={styles.subLockedTitle}>
                    {effectiveSubStatus === 'PAYMENT_VERIFICATION'
                      ? 'Payment Submitted — Awaiting Admin Verification'
                      : effectiveSubStatus === 'EXPIRED'
                      ? 'Subscription Expired'
                      : effectiveSubStatus === 'SUSPENDED'
                      ? 'Subscription Suspended'
                      : effectiveSubStatus === 'REJECTED'
                      ? 'Latest Payment Rejected'
                      : 'No Active Subscription'}
                  </div>
                  <div className={styles.subLockedDesc}>
                    {subInfo?.reason
                      ? `Status Note: ${subInfo.reason}`
                      : 'Subscribe via Direct UPI or redeem a coupon code to unlock all 6 courses, 8,000+ MCQs, AI Tutor, and Battle Mode.'}
                  </div>
                </div>
              </div>
              <Link to="/subscribe" className="btn btn-primary" style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Crown size={16} /> {effectiveSubStatus === 'EXPIRED' ? 'Renew Subscription' : 'Unlock Premium Access'} <ArrowRight size={16} />
              </Link>
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            3. LEARNING PROGRESS & QUIZ PERFORMANCE (COMBINED)
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <BarChart2 size={18} color="#8B5CF6" />
            <span>3. Learning Progress & Quiz Performance</span>
            <Link to="/revision" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#6366F1', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Revision Engine <ArrowRight size={12} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: 10, marginBottom: 16 }}>
            <div style={{ padding: 14, borderRadius: 14, background: '#EFF6FF', border: '1px solid #BFDBFE' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#1D4ED8', textTransform: 'uppercase' }}>Attempted</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', marginTop: 4 }}>{totalAttempted}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#047857', textTransform: 'uppercase' }}>Correct</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#065F46', marginTop: 4 }}>{totalCorrect}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: '#FFF1F2', border: '1px solid #FECDD3' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#BE123C', textTransform: 'uppercase' }}>Wrong</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#9F1239', marginTop: 4 }}>{totalWrong}</div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: '#F5F3FF', border: '1px solid #DDD6FE' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#6D28D9', textTransform: 'uppercase' }}>Accuracy</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#4C1D95', marginTop: 4 }}>{accuracyPct}%</div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: '#FFF7ED', border: '1px solid #FED7AA' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#C2410C', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Flame size={12} /> Streak
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#9A3412', marginTop: 4 }}>{currentStreak}d</div>
            </div>
            <div style={{ padding: 14, borderRadius: 14, background: '#FEFCE8', border: '1px solid #FDE68A' }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#A16207', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Trophy size={12} /> Points
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: '#854D0E', marginTop: 4 }}>{monthlyPoints}</div>
            </div>
          </div>

          {recentAttempts.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8 }}>Recent Quiz Attempts</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {recentAttempts.slice(0, 5).map((att) => {
                  const pct = att.total_questions > 0 ? Math.round((att.correct_count / att.total_questions) * 100) : 0;
                  return (
                    <div key={att.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12.5 }}>
                      <div>
                        <strong style={{ color: '#0F172A' }}>{att.subject_id || 'Practice Quiz'}</strong>
                        <span style={{ color: '#64748B', marginLeft: 8 }}>{new Date(att.created_at).toLocaleDateString()}</span>
                      </div>
                      <span style={{ fontWeight: 800, color: pct >= 60 ? '#059669' : '#DC2626' }}>
                        {att.correct_count}/{att.total_questions} ({pct}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : weakSubjects.length > 0 ? (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#475569', marginBottom: 8 }}>Topic Mastery Breakdown</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {weakSubjects.map((ws) => (
                  <div key={ws.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12.5 }}>
                    <span style={{ fontWeight: 700, color: '#0F172A' }}>{ws.name}</span>
                    <span style={{ fontWeight: 800, color: ws.accuracy >= 70 ? '#059669' : '#D97706' }}>{ws.accuracy}% ({ws.correct}/{ws.total})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: '#64748B', fontWeight: 600 }}>
              Complete quizzes in any course to see your detailed score history and accuracy trends here.
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            4. DEVICE MANAGEMENT
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <MonitorSmartphone size={18} color="#0EA5E9" />
            <span>4. Device Management (Single-Device Active Lock)</span>
            {devices.length > 1 && (
              <button
                type="button"
                disabled={deviceLoading}
                onClick={handleLogoutOtherDevices}
                style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 8, border: '1px solid #FECACA', background: '#FEF2F2', color: '#DC2626', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                Logout Other Devices
              </button>
            )}
          </div>

          {deviceMsg && (
            <div style={{ padding: '8px 12px', borderRadius: 10, background: '#EFF6FF', color: '#1E40AF', fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
              {deviceMsg}
            </div>
          )}

          {devices.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              No active session records found in database yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {devices.map((d) => {
                const isThisDevice = currentLocalSid && d.device_id === currentLocalSid;
                return (
                  <div key={d.id || d.device_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '12px 14px', borderRadius: 14, background: isThisDevice ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${isThisDevice ? '#BBF7D0' : '#E2E8F0'}` }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, fontWeight: 800, color: '#0F172A' }}>
                        <span>Session {String(d.device_id).slice(0, 14)}…</span>
                        {isThisDevice && (
                          <span style={{ fontSize: 10, fontWeight: 900, background: '#10B981', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>
                            THIS DEVICE
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 3 }}>
                        Last active: {d.last_login ? new Date(d.last_login).toLocaleString() : 'Active'}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={deviceLoading}
                      onClick={() => handleRemoveDevice(d.device_id)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 10, border: '1px solid #FECACA', background: '#fff', color: '#DC2626', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                      <span>{isThisDevice ? 'Sign Out' : 'Revoke'}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            5. HELP DESK & SUPPORT
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Ticket size={18} color="#F43F5E" />
            <span>5. Help Desk & Support</span>
            <Link to="/help" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#F43F5E', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              Full Help Desk <ArrowRight size={12} />
            </Link>
          </div>

          {ticketMsg && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#ECFDF5', color: '#065F46', fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
              {ticketMsg}
            </div>
          )}
          {ticketErr && (
            <div style={{ padding: '10px 12px', borderRadius: 10, background: '#FEF2F2', color: '#991B1B', fontSize: 12.5, fontWeight: 700, marginBottom: 12 }}>
              {ticketErr}
            </div>
          )}

          <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input
                type="text"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
                placeholder="Ticket subject (e.g. Payment verification, Question issue)"
                style={{ flex: 2, minWidth: 200, padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13 }}
              />
              <select
                value={ticketCategory}
                onChange={(e) => setTicketCategory(e.target.value)}
                style={{ flex: 1, minWidth: 150, padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13, background: '#fff' }}
              >
                <option value="General Support">General Support</option>
                <option value="Payment Issue">Payment Issue</option>
                <option value="Login Problem">Login Problem</option>
                <option value="Technical Bug">Technical Bug</option>
                <option value="Content Correction">Content Correction</option>
              </select>
            </div>
            <textarea
              rows={2}
              value={ticketDesc}
              onChange={(e) => setTicketDesc(e.target.value)}
              placeholder="Describe your issue or question..."
              style={{ width: '100%', padding: '9px 12px', borderRadius: 10, border: '1.5px solid #CBD5E1', fontSize: 13 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <a href="https://t.me/mrx4u" target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12.5, fontWeight: 700, color: '#0284C7', textDecoration: 'none' }}>
                <MessageCircle size={15} /> Direct Telegram Support (@mrx4u)
              </a>
              <button
                type="submit"
                disabled={ticketSubmitting}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 10, border: 'none', background: '#E11D48', color: '#fff', fontSize: 12.5, fontWeight: 800, cursor: 'pointer' }}
              >
                <Send size={14} />
                <span>{ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
              </button>
            </div>
          </form>

          {tickets.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#475569' }}>Your Recent Tickets</div>
              {tickets.slice(0, 5).map((t) => (
                <div key={t.id} style={{ padding: '10px 12px', borderRadius: 12, background: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: 12.5 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                    <strong style={{ color: '#0F172A' }}>{t.title || t.category}</strong>
                    <span style={{
                      fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 999,
                      background: t.status === 'RESOLVED' ? '#D1FAE5' : '#FEF3C7',
                      color: t.status === 'RESOLVED' ? '#065F46' : '#92400E',
                    }}>
                      {t.status}
                    </span>
                  </div>
                  <div style={{ color: '#475569', marginTop: 4 }}>{t.description}</div>
                  {t.admin_notes && (
                    <div style={{ marginTop: 6, padding: '6px 10px', borderRadius: 8, background: '#EEF2FF', color: '#3730A3', fontSize: 12, fontWeight: 600 }}>
                      Admin Reply: {t.admin_notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════
            6. NOTIFICATIONS & ANNOUNCEMENTS
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <Bell size={18} color="#F59E0B" />
            <span>6. Notifications & Announcements</span>
            {unreadNotifCount > 0 && (
              <button
                type="button"
                disabled={notifLoading}
                onClick={() => handleMarkNotificationsRead()}
                style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#F8FAFC', color: '#1E40AF', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                Mark All Read ({unreadNotifCount})
              </button>
            )}
          </div>

          {announcement && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '12px 14px', borderRadius: 14, background: 'linear-gradient(135deg, #EEF2FF, #E0F2FE)', border: '1px solid #BFDBFE', marginBottom: 12 }}>
              <Megaphone size={18} color="#1D4ED8" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 900, color: '#1E40AF', textTransform: 'uppercase' }}>Official Announcement</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginTop: 2 }}>{announcement}</div>
              </div>
            </div>
          )}

          {notifications.length === 0 ? (
            <div style={{ fontSize: 13, color: '#64748B', fontWeight: 600 }}>
              No personal notifications yet. Payment updates, subscription alerts, and expiry reminders appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {notifications.slice(0, 10).map((n) => (
                <div
                  key={n.id}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12,
                    padding: '10px 12px', borderRadius: 12,
                    background: n.is_read ? '#F8FAFC' : '#FEFCE8',
                    border: `1px solid ${n.is_read ? '#E2E8F0' : '#FDE68A'}`,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, color: '#0F172A' }}>
                      {!n.is_read && <span style={{ color: '#D97706', marginRight: 6 }}>●</span>}
                      {n.title}
                    </div>
                    <div style={{ fontSize: 12.5, color: '#475569', marginTop: 3 }}>{n.body}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>{new Date(n.created_at).toLocaleString()}</div>
                  </div>
                  {!n.is_read && (
                    <button
                      type="button"
                      onClick={() => handleMarkNotificationsRead(n.id)}
                      style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #CBD5E1', background: '#fff', fontSize: 11, fontWeight: 700, cursor: 'pointer', flexShrink: 0 }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
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
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                padding: '12px', borderRadius: '12px',
                background: pwLoading || !newPassword || !confirmNewPassword ? '#94A3B8' : 'linear-gradient(135deg, #0EA5E9 0%, #2563EB 100%)',
                color: '#fff', fontWeight: 700, fontSize: '14px', border: 'none',
                cursor: pwLoading || !newPassword || !confirmNewPassword ? 'not-allowed' : 'pointer',
                marginTop: '4px', boxShadow: '0 4px 12px rgba(37,99,235,0.2)'
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

        {/* ═══════════════════════════════════════════════════════
            7. SECURE LOGOUT
           ═══════════════════════════════════════════════════════ */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <LogOut size={18} color="#EF4444" />
            <span>7. Secure Logout</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className={styles.logoutBtn} style={{ flex: 1, minWidth: 200, marginTop: 0 }} onClick={handleLogout} disabled={loggingOut}>
              <LogOut size={18} />
              <span>{loggingOut ? 'Signing out...' : 'Sign Out This Device'}</span>
            </button>
            <button
              type="button"
              onClick={handleSignOutAll}
              disabled={loggingOut}
              style={{
                flex: 1, minWidth: 200, padding: 15, borderRadius: 18,
                border: '1.5px solid #CBD5E1', background: '#F8FAFC', color: '#334155',
                fontSize: 14, fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <Shield size={16} />
              <span>Sign Out All Devices</span>
            </button>
          </div>
        </div>

        <p className={styles.versionTag}>SSMU MCQs · v2.2 · © 2026</p>
      </div>
      <Footer />
    </div>
  );
}
