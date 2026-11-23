import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

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
        fetchUserData(session.user.id);
      }
    });

    // 2. Auth state listener — fast reactive updates
    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
      }
    });

    return () => authSub.unsubscribe();
  }, []);

  async function fetchUserData(userId) {
    try {
      const [profileRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).single(),
        supabase.from('subscriptions').select('*').eq('user_id', userId).eq('status', 'active').maybeSingle()
      ]);

      if (profileRes.data?.status === 'blocked') {
        await signOut();
        return;
      }

      setProfile(profileRes.data);
      setSubscription(subRes.data);
    } catch (e) {
      console.error('Fetch user data error:', e);
    }
  }

  // Fast Instant Sign In
  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Set user and unblock immediately for zero-lag navigation
    setUser(data.user);
    setLoading(false);
    
    // Fetch profile and subscription in the background
    fetchUserData(data.user.id);
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
    const { data, error } = await supabase.auth.verifyOtp({ email, token, type });
    if (error) throw error;
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

  const isSubscribed = !!subscription || profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ 
      user, profile, subscription, loading, isSubscribed, 
      signIn, signUp, signOut, verifyOTP, resendOTP, resetPassword, updatePassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
