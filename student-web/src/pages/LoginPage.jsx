import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import {
  Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle,
  Eye, EyeOff, BookOpen, ArrowLeft, GraduationCap, Check,
  KeyRound, RefreshCw, Send
} from 'lucide-react';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';

  const [mode, setMode]               = useState(initialMode);
  const [otpType, setOtpType]         = useState('signup');
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName]               = useState('');
  const [otp, setOtp]                 = useState('');
  const [showPw, setShowPw]           = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');

  const { signIn, signUp, verifyOTP, resendOTP, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  // ── Listen for Password Recovery events & detect recovery URL parameters ──
  useEffect(() => {
    const hash = window.location.hash || '';
    const params = new URLSearchParams(window.location.search);

    if (
      searchParams.get('mode') === 'set_password' ||
      params.get('mode') === 'set_password' ||
      hash.includes('type=recovery') ||
      hash.includes('mode=set_password')
    ) {
      setMode('set_password');
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('set_password');
        setError('');
        setSuccess('Identity verified! Please enter your new password.');
      }
    });

    return () => subscription.unsubscribe();
  }, [searchParams]);

  const validateEmail = (e) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(e).toLowerCase());

  async function handleAction(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    // ── OTP VERIFICATION ──
    if (mode === 'otp') {
      if (otp.length < 6) { setError('Please enter the 6-digit code.'); return; }
      setLoading(true);
      try {
        await verifyOTP(email, otp, otpType);
        if (otpType === 'recovery') {
          setMode('set_password');
          setOtp('');
          setSuccess('Code verified! Enter your new password below.');
        } else {
          navigate('/home');
        }
      } catch (err) {
        setError(err.message || 'Incorrect or expired code.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── FORGOT PASSWORD (REQUEST RESET LINK) ──
    if (mode === 'forgot_password') {
      if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccess('Password reset link sent! Check your inbox.');
        setMode('forgot_sent');
      } catch (err) {
        if (
          err.message?.includes('recovery email') ||
          err.message?.includes('unexpected_failure') ||
          err.status === 500
        ) {
          setError('Supabase Email (SMTP) is not enabled on this project. Please sign in directly with your password, or configure Custom SMTP in your Supabase Dashboard (Authentication → SMTP Settings).');
        } else {
          setError(err.message || 'Failed to send reset link. Please check your email.');
        }
      } finally {
        setLoading(false);
      }
      return;
    }

    // ── SET NEW PASSWORD ──
    if (mode === 'set_password') {
      if (password.length < 6) {
        setError('New password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      setLoading(true);
      try {
        await updatePassword(password);
        setSuccess('Password updated successfully! Redirecting to dashboard...');
        setTimeout(() => navigate('/home'), 1200);
      } catch (err) {
        setError(err.message || 'Failed to update password. Recovery session may have expired.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!validateEmail(email)) { setError('Please enter a valid email address.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    // ── INSTANT SIGN IN ──
    if (mode === 'login') {
      setLoading(true);
      try {
        const data = await signIn(email, password);
        if (data?.user && !data.user.email_confirmed_at) {
          setOtpType('signup');
          setMode('otp');
        } else {
          navigate('/home');
        }
      } catch (err) {
        setError(err.message || 'Invalid email or password.');
      } finally {
        setLoading(false);
      }
    } 
    // ── SIGN UP ──
    else if (mode === 'signup') {
      if (name.length < 2) { setError('Please enter your full name.'); return; }
      setLoading(true);
      try {
        const data = await signUp(email, password, name);
        if (data?.session) {
          navigate('/home');
        } else {
          setOtpType('signup');
          setMode('otp');
          setSuccess('Account created! Please enter the confirmation code sent to your email.');
        }
      } catch (err) {
        setError(err.message || 'Failed to create account.');
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleResend() {
    setError(''); setSuccess('');
    try {
      if (mode === 'forgot_sent' || otpType === 'recovery') {
        await resetPassword(email);
        setSuccess('A fresh reset link has been dispatched to your email.');
      } else {
        await resendOTP(email, otpType);
        setSuccess('A new verification code has been sent to your email.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend. Please try again in 1 minute.');
    }
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
              {mode === 'set_password' || mode === 'forgot_password' || mode === 'forgot_sent' ? (
                <KeyRound size={26} color="#fff" />
              ) : mode === 'otp' ? (
                <ShieldCheck size={26} color="#fff" />
              ) : (
                <BookOpen size={26} color="#fff" />
              )}
            </div>
            <div className={styles.brandIconPulse} />
          </div>

          <div className={styles.headerBlock}>
            <h1 className={styles.cardHeading}>
              {isLogin
                ? 'Welcome Back, Future Doctor'
                : isSignup
                ? 'Join SAMU Medical Platform'
                : mode === 'set_password'
                ? 'Create New Password'
                : mode === 'forgot_sent'
                ? 'Check Your Email'
                : mode === 'otp'
                ? 'Verify Your Email'
                : 'Reset Password'}
            </h1>
            <p className={styles.cardSub}>
              {isLogin
                ? 'Sign in to access your 6-year question repository'
                : isSignup
                ? 'Start practicing verified curriculum test questions free'
                : mode === 'set_password'
                ? 'Choose a secure password for your account'
                : mode === 'forgot_sent'
                ? `We sent a secure recovery link to ${email}`
                : mode === 'otp'
                ? `Enter the 6-digit verification code sent to ${email}`
                : 'Enter your registered email to receive a password reset link'}
            </p>
          </div>

          {/* Segmented Mode Switcher (only on Login / Signup) */}
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

          {/* ── FORGOT PASSWORD: SENT CONFIRMATION STATE ── */}
          {mode === 'forgot_sent' && (
            <div className={styles.sentStateBox}>
              <div className={styles.sentInstructions}>
                <div className={styles.sentStep}>
                  <span className={styles.stepNum}>1</span>
                  <span>Open your email inbox (also check <strong>Spam / Junk</strong> folder).</span>
                </div>
                <div className={styles.sentStep}>
                  <span className={styles.stepNum}>2</span>
                  <span>Click the <strong>"Reset Password"</strong> link in the email to set a new password.</span>
                </div>
              </div>

              <div className={styles.sentActions}>
                <button
                  type="button"
                  className={styles.secondaryActionBtn}
                  onClick={handleResend}
                  disabled={loading}
                >
                  <RefreshCw size={14} /> Resend Reset Link
                </button>
                <button
                  type="button"
                  className={styles.textLink}
                  onClick={() => { setOtpType('recovery'); setMode('otp'); setError(''); }}
                >
                  Have a 6-digit code? Enter code instead →
                </button>
              </div>

              <div className={styles.cardFooter}>
                <button
                  type="button"
                  className={styles.footerActionBtn}
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                >
                  ← Back to Sign In
                </button>
              </div>
            </div>
          )}

          {/* ── FORM (Login, Signup, Forgot, Set Password, OTP) ── */}
          {mode !== 'forgot_sent' && (
            <form onSubmit={handleAction} className={styles.authForm}>
              {/* Full name (Sign Up) */}
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

              {/* Email (Login, Signup, Forgot Password) */}
              {(isLogin || isSignup || mode === 'forgot_password') && (
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

              {/* Password (Login, Signup) */}
              {(isLogin || isSignup) && (
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

              {/* OTP Field (OTP Mode) */}
              {mode === 'otp' && (
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
              )}

              {/* Set New Password Fields */}
              {mode === 'set_password' && (
                <>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>New Password (min. 6 characters)</label>
                    <div className={styles.inputContainer}>
                      <Lock size={18} className={styles.fieldIcon} />
                      <input
                        type={showPw ? 'text' : 'password'}
                        className={styles.fieldInput}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowPw(!showPw)}
                      >
                        {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>Confirm New Password</label>
                    <div className={styles.inputContainer}>
                      <Lock size={18} className={styles.fieldIcon} />
                      <input
                        type={showConfirmPw ? 'text' : 'password'}
                        className={styles.fieldInput}
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        className={styles.passwordToggle}
                        onClick={() => setShowConfirmPw(!showConfirmPw)}
                      >
                        {showConfirmPw ? <EyeOff size={17} /> : <Eye size={17} />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Action Button */}
              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading && <span className={styles.btnSpinner} />}
                <span>
                  {loading
                    ? 'Please wait...'
                    : isLogin
                    ? 'Sign In to Account'
                    : isSignup
                    ? 'Create Free Student Account'
                    : mode === 'forgot_password'
                    ? 'Send Password Reset Link'
                    : mode === 'set_password'
                    ? 'Save & Set New Password'
                    : 'Verify Code'}
                </span>
                {!loading && (
                  mode === 'forgot_password' ? <Send size={16} /> : <ArrowRight size={17} />
                )}
              </button>
            </form>
          )}

          {/* OTP Resend Row */}
          {mode === 'otp' && (
            <div className={styles.otpSwitchRow}>
              <button type="button" onClick={handleResend} className={styles.textLink} disabled={loading}>
                Resend Code
              </button>
              <button type="button" onClick={() => { setMode('login'); setOtp(''); }} className={styles.textLink}>
                Change Email / Back
              </button>
            </div>
          )}

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

          {mode === 'forgot_password' && (
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
