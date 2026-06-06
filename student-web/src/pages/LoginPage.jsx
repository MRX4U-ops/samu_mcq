import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle,
  Eye, EyeOff, BookOpen, Brain, Trophy, Zap, Star
} from 'lucide-react';
import styles from './AuthPage.module.css';

const PERKS = [
  { icon: BookOpen, text: 'All 6 SAMU Medical Courses' },
  { icon: Brain,    text: '8,000+ MCQs & Case Tasks' },
  { icon: Trophy,   text: 'Battle Mode & Leaderboard' },
  { icon: Zap,      text: 'AI Study Assistant' },
];

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode]       = useState(initialMode);
  const [otpType, setOtpType] = useState('signup');
  const [email, setEmail]     = useState('');
  const [password, setPassword] = useState('');
  const [name, setName]       = useState('');
  const [otp, setOtp]         = useState('');
  const [showPw, setShowPw]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, verifyOTP, resendOTP, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  async function handleAction(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    if (mode === 'otp') {
      if (otp.length < 6) { setError('Please enter the 6-digit code.'); return; }
      setLoading(true);
      try {
        await verifyOTP(email, otp, otpType);
        if (otpType === 'recovery') { setTimeout(() => { setMode('set_password'); setOtp(''); }, 500); }
        else { navigate('/home'); }
      } catch (err) { setError(err.message || 'Incorrect or expired code.'); }
      finally { setLoading(false); }
      return;
    }

    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }

    if (mode === 'forgot_password') {
      setLoading(true);
      try { await resetPassword(email); setSuccess('A 6-digit reset code has been sent.'); setOtpType('recovery'); setMode('otp'); }
      catch (err) { setError(err.message); }
      finally { setLoading(false); }
      return;
    }

    if (mode === 'set_password') {
      if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
      setLoading(true);
      try { await updatePassword(password); setSuccess('Password updated! You can now log in.'); setMode('login'); }
      catch (err) { setError(err.message); }
      finally { setLoading(false); }
      return;
    }

    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    if (mode === 'login') {
      setLoading(true);
      try {
        const data = await signIn(email, password);
        if (data?.user && !data.user.email_confirmed_at) { setOtpType('signup'); setMode('otp'); }
        else { navigate('/home'); }
      } catch (err) { setError(err.message || 'Invalid email or password.'); }
      finally { setLoading(false); }
    } else if (mode === 'signup') {
      if (name.length < 2) { setError('Please enter your full name.'); return; }
      setLoading(true);
      try {
        const data = await signUp(email, password, name);
        if (data?.session) { navigate('/home'); }
        else { setOtpType('signup'); setMode('otp'); }
      } catch (err) { setError(err.message); }
      finally { setLoading(false); }
    }
  }

  async function handleResend() {
    setError(''); setSuccess('');
    try { await resendOTP(email, otpType); setSuccess('A new code has been sent to your email.'); }
    catch (err) { setError(err.message); }
  }

  // ── OTP Screen ──
  if (mode === 'otp') {
    return (
      <div className={styles.page}>
        <div className={styles.bgBlob1} /><div className={styles.bgBlob2} />
        <div className={styles.card}>
          <div className={styles.logo} style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            <ShieldCheck size={28} color="#fff" />
          </div>
          <h1 className={styles.title}>Verify Your Email</h1>
          <p className={styles.sub}>We sent a 6-digit code to<br /><strong>{email}</strong></p>

          {error && <div className={styles.errorBox}>⚠ {error}</div>}
          {success && <div className={styles.successBox}>✓ {success}</div>}

          <form onSubmit={handleAction} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Verification Code</label>
              <div className={styles.inputWrap}>
                <ShieldCheck size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className={styles.input}
                  style={{ letterSpacing: 10, fontSize: 22, fontWeight: 900, textAlign: 'center' }}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  required
                />
              </div>
            </div>
            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Verifying...' : 'Verify Code'}
              {!loading && <CheckCircle size={16} />}
            </button>
            <div className={styles.switchRow}>
              <button type="button" onClick={handleResend} className={styles.linkBtn} disabled={loading}>Resend Code</button>
              <button type="button" onClick={() => { setMode('login'); setOtp(''); }} className={styles.linkBtn}>Change Email</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const isLogin  = mode === 'login';
  const isSignup = mode === 'signup';

  return (
    <div className={styles.page}>
      <div className={styles.bgBlob1} />
      <div className={styles.bgBlob2} />
      <div className={styles.bgBlob3} />

      {/* ── Left Panel (desktop only) ── */}
      <div className={styles.leftPanel}>
        <div className={styles.leftContent}>
          <div className={styles.leftLogo}>
            <BookOpen size={22} color="#fff" />
          </div>
          <h2 className={styles.leftTitle}>SAMU MCQs</h2>
          <p className={styles.leftSub}>Your complete medical exam preparation platform for all 6 years of SAMU education.</p>

          <div className={styles.leftPerks}>
            {PERKS.map(p => (
              <div key={p.text} className={styles.leftPerk}>
                <div className={styles.leftPerkIcon}><p.icon size={16} color="#a5b4fc" /></div>
                <span>{p.text}</span>
              </div>
            ))}
          </div>

          <div className={styles.leftStats}>
            <div className={styles.leftStat}><strong>8K+</strong><span>MCQs</span></div>
            <div className={styles.leftStatDiv} />
            <div className={styles.leftStat}><strong>1,200+</strong><span>Students</span></div>
            <div className={styles.leftStatDiv} />
            <div className={styles.leftStat}><strong>94%</strong><span>Pass Rate</span></div>
          </div>

          <div className={styles.leftTestimonial}>
            <div className={styles.testimonialStars}>
              {[1,2,3,4,5].map(i => <Star key={i} size={12} color="#fbbf24" fill="#fbbf24" />)}
            </div>
            <p>"Best MCQ platform for SAMU students. Scored 78 in Biochemistry CBT!"</p>
            <span>— Abdul A., 3rd Year</span>
          </div>
        </div>
      </div>

      {/* ── Right Panel / Form ── */}
      <div className={styles.rightPanel}>
        <div className={styles.card}>
          {/* Mobile logo */}
          <div className={styles.mobileLogo}>
            <div className={styles.logo}>
              <ShieldCheck size={26} color="#fff" />
            </div>
          </div>

          {/* Mode tabs */}
          <div className={styles.modeTabs}>
            <button
              className={`${styles.modeTab} ${isLogin ? styles.modeTabActive : ''}`}
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
            >Sign In</button>
            <button
              className={`${styles.modeTab} ${isSignup ? styles.modeTabActive : ''}`}
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
            >Create Account</button>
          </div>

          <h1 className={styles.title}>
            {isLogin ? 'Welcome Back 👋' : isSignup ? 'Join SAMU MCQs' : mode === 'set_password' ? 'New Password' : 'Reset Password'}
          </h1>
          <p className={styles.sub}>
            {isLogin ? 'Sign in to continue your medical journey' : isSignup ? 'Start preparing smarter today' : mode === 'set_password' ? 'Enter your new secure password' : 'Enter your email to receive a reset code'}
          </p>

          {error   && <div className={styles.errorBox}>⚠ {error}</div>}
          {success && <div className={styles.successBox}>✓ {success}</div>}

          <form onSubmit={handleAction} className={styles.form}>
            {isSignup && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Full Name</label>
                <div className={styles.inputWrap}>
                  <User size={16} className={styles.inputIcon} />
                  <input type="text" className={styles.input} placeholder="Dr. Jasur Toshmatov"
                    value={name} onChange={e => setName(e.target.value)} required />
                </div>
              </div>
            )}

            {mode !== 'set_password' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Email Address</label>
                <div className={styles.inputWrap}>
                  <Mail size={16} className={styles.inputIcon} />
                  <input type="email" className={styles.input} placeholder="student@meduniver.uz"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              </div>
            )}

            {mode !== 'forgot_password' && (
              <div className={styles.inputGroup}>
                <div className={styles.labelRow}>
                  <label className={styles.label}>Password</label>
                  {isLogin && (
                    <button type="button" className={styles.linkBtn} onClick={() => setMode('forgot_password')}>
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <Lock size={16} className={styles.inputIcon} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? <span className={styles.spinner} /> : null}
              {loading ? 'Processing...' : isLogin ? 'Sign In' : isSignup ? 'Create Account' : mode === 'set_password' ? 'Update Password' : 'Send Reset Code'}
              {!loading && <ArrowRight size={16} />}
            </button>
          </form>

          {(isLogin || isSignup) && (
            <p className={styles.switchText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button type="button" className={styles.linkBtn} onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); setSuccess(''); }}>
                {isLogin ? 'Register Free' : 'Sign In'}
              </button>
            </p>
          )}

          {!isLogin && !isSignup && (
            <p className={styles.switchText}>
              <button type="button" className={styles.linkBtn} onClick={() => { setMode('login'); setError(''); setSuccess(''); }}>
                ← Back to Sign In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
