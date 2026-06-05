import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import styles from './AuthPage.module.css';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  
  const [mode, setMode] = useState(initialMode); // 'login', 'signup', 'otp', 'forgot_password', 'set_password'
  const [otpType, setOtpType] = useState('signup'); // 'signup' or 'recovery'
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [otp, setOtp] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, signUp, verifyOTP, resendOTP, resetPassword, updatePassword } = useAuth();
  const navigate = useNavigate();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  async function handleAction(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (mode === 'otp') {
      if (otp.length < 6) {
        setError("Please enter the verification code.");
        return;
      }
      setLoading(true);
      try {
        await verifyOTP(email, otp, otpType);
        if (otpType === 'recovery') {
          setTimeout(() => {
            setMode('set_password');
            setOtp('');
          }, 500);
        } else {
          navigate('/home');
        }
      } catch (err) {
        setError(err.message || "The code is incorrect or expired.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (mode === 'forgot_password') {
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccess("A 6-digit reset code has been sent to your email.");
        setOtpType('recovery');
        setMode('otp');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }
    
    if (mode === 'set_password') {
      if (password.length < 6) {
        setError("New password must be at least 6 characters.");
        return;
      }
      setLoading(true);
      try {
        await updatePassword(password);
        setSuccess("Password updated successfully. You can now log in.");
        setMode('login');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

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
        setError(err.message || "Invalid email or password");
      } finally {
        setLoading(false);
      }
    } else if (mode === 'signup') {
      if (name.length < 2) {
        setError("Please enter your full professional name.");
        return;
      }
      setLoading(true);
      try {
        const data = await signUp(email, password, name);
        if (data?.session) {
          navigate('/home');
        } else {
          setOtpType('signup');
          setMode('otp');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleResend() {
    setError('');
    setSuccess('');
    try {
      await resendOTP(email, otpType);
      setSuccess("A new verification code has been sent to your email.");
    } catch (err) {
      setError(err.message);
    }
  }

  if (mode === 'otp') {
    return (
      <div className={styles.page}>
        <div className={styles.glow} />
        <div className={styles.card}>
          <div className={styles.logo} style={{ backgroundColor: '#EEF2FF' }}>
            <ShieldCheck size={32} color="#6366F1" />
          </div>
          <h1 className={styles.title}>Enter Code</h1>
          <p className={styles.sub}>We've sent a verification code to {email}. Check your inbox and spam folder.</p>

          {error && <div className={styles.errorBox}>{error}</div>}
          {success && <div className={styles.successBox}>{success}</div>}

          <form onSubmit={handleAction} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Verification Code</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: 44, fontSize: 20, letterSpacing: 6, fontWeight: 'bold' }}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  maxLength={6}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify Code'}
              {!loading && <CheckCircle size={16} />}
            </button>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 20 }}>
              <button type="button" onClick={handleResend} className={styles.linkButton} disabled={loading}>
                Resend Code
              </button>
              <button type="button" onClick={() => { setMode('login'); setOtp(''); }} className={styles.linkButton} disabled={loading}>
                Change Email
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <ShieldCheck size={28} color="#fff" />
        </div>
        <h1 className={styles.title}>
          {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Join SAMU MCQs' : mode === 'set_password' ? 'New Password' : 'Reset Password'}
        </h1>
        <p className={styles.sub}>
          {mode === 'login' ? 'Sign in to your medical account' : mode === 'signup' ? 'Start your professional medical journey' : mode === 'set_password' ? 'Secure your account with a new password' : 'Enter your email to receive a reset link'}
        </p>

        {error && <div className={styles.errorBox}>{error}</div>}
        {success && <div className={styles.successBox}>{success}</div>}

        <form onSubmit={handleAction} className={styles.form}>
          {mode === 'signup' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Full Professional Name</label>
              <div className={styles.inputWrap}>
                <User size={16} className={styles.inputIcon} />
                <input
                  type="text"
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  placeholder="Dr. Jasur Toshmatov"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label}>Institutional Email</label>
            <div className={styles.inputWrap}>
              <Mail size={16} className={styles.inputIcon} />
              <input
                type="email"
                className="input-field"
                style={{ paddingLeft: 44 }}
                placeholder="student@meduniver.uz"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {mode !== 'forgot_password' && mode !== 'set_password' && (
            <div className={styles.inputGroup}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <label className={styles.label} style={{ marginBottom: 0 }}>Secure Password</label>
                {mode === 'login' && (
                  <button type="button" onClick={() => setMode('forgot_password')} className={styles.linkButton} style={{ fontSize: 12 }}>
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'set_password' && (
            <div className={styles.inputGroup}>
              <label className={styles.label}>Enter New Password</label>
              <div className={styles.inputWrap}>
                <Lock size={16} className={styles.inputIcon} />
                <input
                  type="password"
                  className="input-field"
                  style={{ paddingLeft: 44 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: 14 }} disabled={loading}>
            {loading ? 'Processing...' : mode === 'login' ? 'Authenticate' : mode === 'signup' ? 'Register Account' : mode === 'set_password' ? 'Update Password' : 'Send Reset Link'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <button 
            type="button" 
            className={styles.linkButton}
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? "Don't have an account? Create one" : "Back to Login"}
          </button>
        </div>
      </div>
    </div>
  );
}
