import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle,
  Eye, EyeOff, BookOpen, Sparkles, ArrowLeft, GraduationCap, Check
} from 'lucide-react';
import styles from './AuthPage.module.css';

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
      <div className={styles.authWrapper}>
        <div className={styles.topNavbar}>
          <div className={styles.topNavBrand}>
            <div className={styles.topNavLogo}><BookOpen size={18} color="#fff" /></div>
            <span className={styles.topNavName}>SAMU MCQs</span>
          </div>
          <Link to="/" className={styles.topNavBack}>
            <ArrowLeft size={15} /> Back to Home
          </Link>
        </div>

        <div className={styles.authContainer}>
          <div className={styles.authCard}>
            <div className={styles.brandIconWrap}>
              <div className={styles.brandIcon}>
                <ShieldCheck size={28} color="#fff" />
              </div>
            </div>

            <h1 className={styles.cardHeading}>Verify Your Email</h1>
            <p className={styles.cardSub}>We sent a 6-digit code to<br /><strong>{email}</strong></p>

            {error && <div className={styles.alertError}>⚠ {error}</div>}
            {success && <div className={styles.alertSuccess}>✓ {success}</div>}

            <form onSubmit={handleAction} className={styles.authForm}>
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>6-Digit Verification Code</label>
                <div className={styles.inputContainer}>
                  <ShieldCheck size={18} className={styles.fieldIcon} />
                  <input
                    type="text"
                    className={`${styles.fieldInput} ${styles.otpInput}`}
                    placeholder="000000"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                    maxLength={6}
                    required
                  />
                </div>
              </div>

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? <span className={styles.btnSpinner} /> : null}
                <span>{loading ? 'Verifying...' : 'Verify Code'}</span>
                {!loading && <CheckCircle size={17} />}
              </button>

              <div className={styles.otpSwitchRow}>
                <button type="button" onClick={handleResend} className={styles.textLink} disabled={loading}>Resend Code</button>
                <button type="button" onClick={() => { setMode('login'); setOtp(''); }} className={styles.textLink}>Change Email</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const isLogin  = mode === 'login';
  const isSignup = mode === 'signup';

  return (
    <div className={styles.authWrapper}>
      {/* ── TOP HEADER BAR ── */}
      <header className={styles.topNavbar}>
        <div className={styles.topNavBrand}>
          <div className={styles.topNavLogo}>
            <BookOpen size={18} color="#fff" />
          </div>
          <div className={styles.topNavTitleBlock}>
            <span className={styles.topNavName}>SAMU MCQs</span>
            <span className={styles.topNavTag}>STUDENT PORTAL</span>
          </div>
        </div>

        <div className={styles.topNavCenterBadge}>
          <GraduationCap size={15} color="#0f4c75" />
          <span>Official Medical University Exam System</span>
        </div>

        <Link to="/" className={styles.topNavBack}>
          <ArrowLeft size={15} /> Back to Website
        </Link>
      </header>

      {/* ── AMBIENT BACKGROUND GLOWS ── */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowBottom} />

      {/* ── MAIN CENTERED AUTH CARD ── */}
      <main className={styles.authContainer}>
        <div className={styles.authCard}>
          {/* Brand Icon Header */}
          <div className={styles.brandIconWrap}>
            <div className={styles.brandIcon}>
              <BookOpen size={26} color="#fff" />
            </div>
            <div className={styles.brandIconPulse} />
          </div>

          <div className={styles.headerBlock}>
            <h1 className={styles.cardHeading}>
              {isLogin ? 'Welcome Back, Future Doctor' : isSignup ? 'Join SAMU Medical Platform' : mode === 'set_password' ? 'Create New Password' : 'Reset Password'}
            </h1>
            <p className={styles.cardSub}>
              {isLogin ? 'Sign in to access your 6-year question repository' : isSignup ? 'Start practicing verified curriculum test questions free' : mode === 'set_password' ? 'Choose a secure password for your account' : 'Enter your registered email to receive a recovery code'}
            </p>
          </div>

          {/* Segmented Mode Switcher */}
          {(isLogin || isSignup) && (
            <div className={styles.segmentedToggle}>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isLogin ? styles.toggleBtnActive : ''}`}
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={`${styles.toggleBtn} ${isSignup ? styles.toggleBtnActive : ''}`}
                onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              >
                Create Account
              </button>
            </div>
          )}

          {error   && <div className={styles.alertError}>⚠ {error}</div>}
          {success && <div className={styles.alertSuccess}>✓ {success}</div>}

          {/* FORM */}
          <form onSubmit={handleAction} className={styles.authForm}>
            {isSignup && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Full Name</label>
                <div className={styles.inputContainer}>
                  <User size={18} className={styles.fieldIcon} />
                  <input
                    type="text"
                    className={styles.fieldInput}
                    placeholder="Dr. Jasur Toshmatov"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'set_password' && (
              <div className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>Email Address</label>
                <div className={styles.inputContainer}>
                  <Mail size={18} className={styles.fieldIcon} />
                  <input
                    type="email"
                    className={styles.fieldInput}
                    placeholder="student@meduniver.uz"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot_password' && (
              <div className={styles.fieldGroup}>
                <div className={styles.fieldLabelRow}>
                  <label className={styles.fieldLabel}>Password</label>
                  {isLogin && (
                    <button
                      type="button"
                      className={styles.forgotBtn}
                      onClick={() => { setMode('forgot_password'); setError(''); setSuccess(''); }}
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className={styles.inputContainer}>
                  <Lock size={18} className={styles.fieldIcon} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    className={styles.fieldInput}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.passwordToggle}
                    onClick={() => setShowPw(!showPw)}
                    aria-label="Toggle password visibility"
                  >
                    {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            <button type="submit" className={styles.primaryBtn} disabled={loading}>
              {loading && <span className={styles.btnSpinner} />}
              <span>
                {loading ? 'Please wait...' : isLogin ? 'Sign In to Account' : isSignup ? 'Create Free Student Account' : mode === 'set_password' ? 'Update Password' : 'Send Recovery Code'}
              </span>
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          {/* Bottom Switcher */}
          {(isLogin || isSignup) && (
            <div className={styles.cardFooter}>
              <span>{isLogin ? "Don't have an account yet?" : "Already registered?"}</span>
              <button
                type="button"
                className={styles.footerActionBtn}
                onClick={() => { setMode(isLogin ? 'signup' : 'login'); setError(''); setSuccess(''); }}
              >
                {isLogin ? 'Create Account Free' : 'Sign In Here'}
              </button>
            </div>
          )}

          {!isLogin && !isSignup && (
            <div className={styles.cardFooter}>
              <button
                type="button"
                className={styles.footerActionBtn}
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              >
                ← Return to Sign In
              </button>
            </div>
          )}
        </div>

        {/* ── TRUST & HIGHLIGHT BADGES ── */}
        <div className={styles.trustRow}>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Check size={12} color="#0f4c75" /></div>
            <span>All 6 Academic Courses</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Check size={12} color="#0f4c75" /></div>
            <span>8,000+ Verified MCQs</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Check size={12} color="#0f4c75" /></div>
            <span>Situational Case Tasks</span>
          </div>
          <div className={styles.trustItem}>
            <div className={styles.trustCheck}><Check size={12} color="#0f4c75" /></div>
            <span>AI Clinical Tutor</span>
          </div>
        </div>

        {/* ── SECURITY NOTE ── */}
        <p className={styles.bottomLegal}>
          🔒 End-to-End Secure • Built specifically for SAMU Medical University Students
        </p>
      </main>
    </div>
  );
}
