import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

const isSuperAdminEmail = (email) => email?.toLowerCase() === 'mohd6396889713@gmail.com';
const DEVICE_SESSION_KEY = 'samu_device_session_id';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://samu-mcqs.onrender.com';

function createDeviceSessionId() {
  const id = (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  try {
    localStorage.setItem(DEVICE_SESSION_KEY, id);
  } catch {}
  return id;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check — unblock UI immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email);
      }
    });

    // 2. Auth state listener — fast reactive updates
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchUserData(session.user.id, session.user.email);
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  // 3. Single-Device Session Enforcement: auto-logout old device if logged in elsewhere
  useEffect(() => {
    if (!user) return;
    let isChecking = false;

    const verifySingleDevice = async () => {
      if (isChecking) return;
      isChecking = true;
      try {
        const localSid = localStorage.getItem(DEVICE_SESSION_KEY) || '';
        const params = new URLSearchParams({
          userId: user.id,
          sessionId: localSid,
        });
        const res = await fetch(`${API_BASE_URL}/api/users/session/check?${params.toString()}`);
        if (!res.ok) return;
        const data = await res.json();

        if (data.activeSessionId && data.valid === false) {
          try {
            sessionStorage.setItem('samu_logout_reason', 'You were logged out because your account was signed in on another device.');
          } catch {}
          await signOut();
          window.location.hash = '#/login';
        }
      } catch {
        // ignore transient network errors
      } finally {
        isChecking = false;
      }
    };

    // Check immediately, on tab focus/visibility, and every 5 seconds
    const initTimer = setTimeout(verifySingleDevice, 800);
    const interval = setInterval(verifySingleDevice, 5000);
    const onFocus = () => verifySingleDevice();
    const onVis = () => {
      if (document.visibilityState === 'visible') verifySingleDevice();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      clearTimeout(initTimer);
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [user?.id]);

  async function fetchUserData(userId, userEmail) {
    const emailToCheck = (userEmail || user?.email || '').toLowerCase();
    const isSuper = isSuperAdminEmail(emailToCheck);

    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle()
      ]);

      if (profileRes.data?.status === 'blocked') {
        await signOut();
        return;
      }

      let prof = profileRes.data;
      if (isSuper || prof?.role === 'admin') {
        prof = {
          ...(prof || {}),
          id: userId,
          email: prof?.email || emailToCheck || 'mohd6396889713@gmail.com',
          name: prof?.name || 'Sameer Ahmad',
          role: 'admin',
          status: 'active',
          isSuperAdmin: true,
        };
      }

      let sub = subRes.data;
      if ((isSuper || prof?.role === 'admin') && !sub) {
        sub = {
          id: 'lifetime-admin-sub',
          user_id: userId,
          status: 'active',
          plan_id: 'lifetime_super_admin',
          start_date: '2026-01-01T00:00:00.000Z',
          end_date: '2099-12-31T23:59:59.000Z',
          created_at: '2026-01-01T00:00:00.000Z'
        };
      }

      setProfile(prof);
      setSubscription(sub);
    } catch (e) {
      console.error('Fetch user data error:', e);
      if (isSuper) {
        setProfile({
          id: userId,
          email: emailToCheck,
          name: 'Sameer Ahmad',
          role: 'admin',
          status: 'active',
          isSuperAdmin: true,
        });
        setSubscription({
          id: 'lifetime-admin-sub',
          user_id: userId,
          status: 'active',
          plan_id: 'lifetime_super_admin',
          start_date: '2026-01-01T00:00:00.000Z',
          end_date: '2099-12-31T23:59:59.000Z'
        });
      }
    }
  }

  // Fast Instant Sign In + Single-Device Enforcement
  async function signIn(email, password) {
    const newSid = createDeviceSessionId();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    // Claim single active session on backend (invalidates all old devices)
    try {
      await fetch(`${API_BASE_URL}/api/users/session/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: data.user.id, sessionId: newSid }),
      });
      await supabase.auth.signOut({ scope: 'others' });
    } catch (e) {
      console.warn('Single-device sync warning:', e);
    }

    // Set user and unblock immediately for zero-lag navigation
    setUser(data.user);
    setLoading(false);

    // Fetch profile and subscription in the background
    fetchUserData(data.user.id, data.user.email);
    return data;
  }

  async function signUp(email, password, fullName) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name: fullName, full_name: fullName } }
    });
    if (error) throw error;
    return data;
  }

  async function verifyOTP(email, token, type = 'signup') {
    const newSid = createDeviceSessionId();
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error) throw error;
    try {
      if (data?.user?.id) {
        await fetch(`${API_BASE_URL}/api/users/session/claim`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: data.user.id, sessionId: newSid }),
        });
      }
      await supabase.auth.signOut({ scope: 'others' });
    } catch {}
    return data;
  }

  async function resendOTP(email, type = 'signup') {
    const { error } = await supabase.auth.resend({ type, email });
    if (error) throw error;
  }

  // Password Reset with explicit site URL redirect
  async function resetPassword(email) {
    const origin = window.location.origin;
    const pathname = window.location.pathname.endsWith('/') 
      ? window.location.pathname 
      : `${window.location.pathname}/`;
    const redirectUrl = `${origin}${pathname}#/login?mode=set_password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });
    if (error) throw error;
  }

  async function updatePassword(password) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
    return data;
  }

  async function updateUserProfile({ fullName, avatarUrl, markNameChanged }) {
    const metaPatch = {};
    if (fullName !== undefined) {
      metaPatch.full_name = fullName;
      metaPatch.name = fullName;
    }
    if (markNameChanged) {
      metaPatch.name_changed = true;
    }
    if (avatarUrl !== undefined) {
      metaPatch.avatar_url = avatarUrl;
    }

    const { data, error } = await supabase.auth.updateUser({ data: metaPatch });
    if (error) throw error;

    if (data?.user) {
      setUser(data.user);
      setProfile((prev) => ({
        ...(prev || {}),
        ...(fullName !== undefined ? { name: fullName, full_name: fullName } : {}),
        ...(avatarUrl !== undefined ? { avatar_url: avatarUrl } : {}),
        ...(markNameChanged ? { name_changed: true } : {}),
      }));
      // Best-effort sync to profiles table if columns exist
      try {
        const dbPatch = {};
        if (fullName !== undefined) dbPatch.name = fullName;
        if (Object.keys(dbPatch).length > 0) {
          await supabase.from('profiles').update(dbPatch).eq('id', data.user.id);
        }
      } catch {
        // user_metadata is already updated as primary source of truth
      }
    }
    return data;
  }

  // Complete, aggressive sign out that guarantees stored tokens are wiped
  async function signOut() {
    try {
      await supabase.auth.signOut({ scope: 'local' });
    } catch (err) {
      console.warn('Supabase signOut error:', err);
    }

    try {
      // Clear all Supabase auth tokens from localStorage and sessionStorage
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('supabase') || key.includes('auth') || key.includes('ssmu'))) {
          localStorage.removeItem(key);
        }
      }
      sessionStorage.clear();
    } catch (e) {
      console.warn('Storage purge error:', e);
    }

    setUser(null);
    setProfile(null);
    setSubscription(null);
    setLoading(false);
  }

  async function refreshSubscription() {
    if (!user) return;
    await fetchUserData(user.id, user.email);
  }

  const isSuperAdmin = isSuperAdminEmail(user?.email) || profile?.role === 'admin' || profile?.isSuperAdmin;
  const isSubscribed = !!subscription || isSuperAdmin;

  return (
    <AuthContext.Provider value={{ 
      user, profile, subscription, loading, isSubscribed, isSuperAdmin,
      signIn, signUp, signOut, verifyOTP, resendOTP, resetPassword, updatePassword,
      updateUserProfile, refreshSubscription
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
