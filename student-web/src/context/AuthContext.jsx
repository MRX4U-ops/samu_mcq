import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserData(session.user.id);
      } else {
        setProfile(null);
        setSubscription(null);
        setLoading(false);
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

      setProfile(profileRes.data);
      setSubscription(subRes.data);
    } catch (e) {
      console.error('Fetch user data error:', e);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    
    // Check if blocked
    const { data: profileData } = await supabase.from('profiles').select('status').eq('id', data.user.id).single();
    if (profileData?.status === 'blocked') {
      await supabase.auth.signOut();
      throw new Error('This account is blocked.');
    }
    
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

  async function resetPassword(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  }

  async function updatePassword(password) {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
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

