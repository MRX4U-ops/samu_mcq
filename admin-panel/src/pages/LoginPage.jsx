import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Loader2, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import useAuthStore from '../store/authStore';
import { supabase } from '../services/supabase';
import logo from '../assets/logo.png';

const SUPER_ADMIN_EMAIL = 'mohd6396889713@gmail.com';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resetSent, setResetSent] = useState(false);
  
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  React.useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const cleanEmail = session.user.email?.toLowerCase();
        const isSuper = cleanEmail === SUPER_ADMIN_EMAIL;
        let prof = null;
        if (!isSuper) {
          const { data: p } = await supabase.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
          prof = p;
        }
        if (isSuper || prof?.role === 'admin' || prof?.role === 'super_admin') {
          const adminProfile = {
            ...(prof || {}),
            id: session.user.id,
            email: session.user.email,
            name: prof?.name || (isSuper ? 'Sameer Ahmad' : 'Admin'),
            role: isSuper ? 'super_admin' : prof.role,
            isSuperAdmin: isSuper,
          };
          setAuth(adminProfile, session.access_token);
          navigate('/');
        }
      }
    }).catch(err => console.log('Session check error:', err));
  }, [navigate, setAuth]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (authError) throw authError;

      // Check if user is admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const isSuper = cleanEmail === SUPER_ADMIN_EMAIL;
      const isAdmin = isSuper || profile?.role === 'admin' || profile?.role === 'super_admin';

      if (!isAdmin) {
        await supabase.auth.signOut();
        throw new Error('Unauthorized: Admin access required. This portal is strictly for authorized university staff.');
      }

      const adminProfile = {
        ...(profile || {}),
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || (isSuper ? 'Sameer Ahmad' : 'Admin'),
        role: isSuper ? 'super_admin' : (profile?.role || 'admin'),
        isSuperAdmin: isSuper
      };

      setAuth(adminProfile, data.session.access_token);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setResetSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-slate-950/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/10 text-white">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-indigo-400">
            <Shield size={40} />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">SAMU MCQs Control Center</h1>
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mt-1">Super Admin & Staff Access</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center text-rose-400 text-sm font-medium">
            <AlertCircle size={18} className="mr-3 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {resetSent && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center text-emerald-400 text-sm font-medium">
            <CheckCircle2 size={18} className="mr-3 shrink-0" />
            <span>Password recovery email dispatched! Please inspect your inbox.</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider ml-1">Admin Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                placeholder="mohd6396889713@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center ml-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">Secret Password</label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold text-sm tracking-wide shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 mt-4"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin mr-2" />
                <span>Authenticating Super Admin...</span>
              </>
            ) : (
              <span>Sign In to Control Center →</span>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[11px] text-slate-500 font-semibold">
            Protected by End-to-End Enterprise Role Auth • SAMU University
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
