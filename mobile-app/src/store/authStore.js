import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  session: null,
  subscription: null,
  loading: true,
  isActionLoading: false,
  error: null,
  isRecovering: false,
  offerPopupShown: false,

  // Initialize session and listeners
  initialize: async () => {
    set({ loading: true });
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;

      if (session) {
        // Parallelize fetching profile and subscription for faster startup
        const [profileRes, subRes] = await Promise.all([
          get().fetchProfile(session.user.id),
          get().checkSubscription(session.user.id)
        ]);

        const profile = profileRes.data;
        if (profile?.status === 'blocked') {
          await get().signOut();
          set({ loading: false });
          return;
        }
      }

      set({ session, user: session?.user || null, loading: false });

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        set({ session, user: session?.user || null });
        if (session) {
          const { data: profile } = await get().fetchProfile(session.user.id);
          if (profile?.status === 'blocked') {
            await get().signOut();
            return;
          }
          await get().checkSubscription(session.user.id);
        } else {
          set({ profile: null, subscription: null });
        }
      });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchProfile: async (userId) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error) set({ profile: data });
    return { data, error };
  },

  checkSubscription: async (userId) => {
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .gt('end_date', new Date().toISOString())
      .maybeSingle();

    set({ subscription: data || null });
    return data;
  },

  signIn: async (email, password, deviceId) => {
    set({ isActionLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check status
      const { data: profile } = await get().fetchProfile(data.user.id);
      if (profile?.status === 'blocked') {
        await supabase.auth.signOut();
        throw new Error('This account is blocked.');
      }

      // Handle Device Control
      if (deviceId) {
        const { error: deviceError } = await supabase
          .from('devices')
          .upsert({ user_id: data.user.id, device_id: deviceId, last_login: new Date() }, { onConflict: 'user_id,device_id' });

        if (deviceError) {
          await supabase.auth.signOut();
          throw new Error(deviceError.message);
        }
      }

      set({ isActionLoading: false });
      return { data, error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { data: null, error };
    }
  },

  signUp: async (email, password, name) => {
    set({ isActionLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name }
        }
      });
      if (error) throw error;
      set({ isActionLoading: false });
      return { data, error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { data: null, error };
    }
  },


  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null, session: null, subscription: null });
  },

  updateStats: async ({ attempted, correct, wrong }) => {
    const { user, profile } = get();
    if (!user || !profile) return;

    // Optimistic Update
    const newTotal = (profile.total_attempted || 0) + attempted;
    const newCorrect = (profile.total_correct || 0) + correct;
    const newWrong = (profile.total_wrong || 0) + wrong;
    const newAccuracy = newTotal > 0 ? Math.round((newCorrect / newTotal) * 100) : 0;

    const updatedProfile = {
      ...profile,
      total_attempted: newTotal,
      total_correct: newCorrect,
      total_wrong: newWrong,
      accuracy: newAccuracy
    };

    set({ profile: updatedProfile });

    // Sync to Supabase
    try {
      await supabase
        .from('profiles')
        .update({
          total_attempted: newTotal,
          total_correct: newCorrect,
          total_wrong: newWrong,
          accuracy: newAccuracy
        })
        .eq('id', user.id);
    } catch (e) {
      console.log('[Store] Stats sync failed:', e.message);
    }
  },

  toggleBookmark: async (questionId) => {
    const { user } = get();
    if (!user) return false;

    try {
      // 1. Check if already bookmarked
      const { data: existing } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (existing) {
        // Remove
        await supabase.from('bookmarks').delete().eq('id', existing.id);
        return false;
      } else {
        // Add
        await supabase.from('bookmarks').insert({
          user_id: user.id,
          question_id: questionId
        });
        return true;
      }
    } catch (e) {
      console.log('[Store] Bookmark toggle failed:', e.message);
      return false;
    }
  },

  resetPassword: async (email) => {
    set({ isActionLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
      set({ isActionLoading: false });
      return { error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { error };
    }
  },


  verifyOTP: async (email, token, type = 'signup') => {
    set({ isActionLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type, // 'signup' or 'recovery'
      });
      if (error) throw error;
      set({ isActionLoading: false });
      return { data, error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { data: null, error };
    }
  },

  setRecovering: (value) => set({ isRecovering: value }),
  setOfferPopupShown: (value) => set({ offerPopupShown: value }),

  resendOTP: async (email, type = 'signup') => {
    set({ isActionLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resend({
        type,
        email,
      });
      if (error) throw error;
      set({ isActionLoading: false });
      return { error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { error };
    }
  },

  updateProfile: async (updates) => {
    set({ isActionLoading: true, error: null });
    try {
      const user = get().user;
      if (!user) throw new Error('No user authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      set({ profile: data, isActionLoading: false });
      return { data, error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { data: null, error };
    }
  },

  uploadAvatar: async (uri, name, type, base64) => {
    set({ isActionLoading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user authenticated');

      const fileExt = name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      let uploadData;
      if (base64) {
        // Decode base64 string to ArrayBuffer for most reliable upload
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        uploadData = bytes.buffer;
      } else {
        // Fallback to XHR/Blob if base64 is missing
        uploadData = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = () => resolve(xhr.response);
          xhr.onerror = () => reject(new TypeError("Network request failed"));
          xhr.responseType = "blob";
          xhr.open("GET", uri, true);
          xhr.send(null);
        });
      }

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, uploadData, {
          contentType: type,
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Add a cache-buster timestamp to ensure the app sees the new image immediately
      const finalUrl = `${publicUrl}?t=${Date.now()}`;
      await get().updateProfile({ avatar_url: finalUrl });

      set({ isActionLoading: false });
      return { publicUrl: finalUrl, error: null };
    } catch (error) {
      set({ error: error.message, isActionLoading: false });
      return { error };
    }
  },

  clearError: () => set({ error: null }),

  // Admin Methods
  isAdmin: () => get().profile?.role === 'admin',

  fetchAllUsers: async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, subscriptions(status, end_date)')
      .order('created_at', { ascending: false });
    return { data, error };
  },

  updateUserStatus: async (userId, status) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status })
      .eq('id', userId);
    return { error };
  },

  deleteUser: async (userId) => {
    // Note: Due to ON DELETE CASCADE in schema, this will handle profiles and related data.
    // However, deleting from auth.users requires admin/service_role which client SDK doesn't have by default.
    // We will delete from public.profiles and let the app handle the UI.
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    return { error };
  },

  activateSubscription: async (userId, days = 90) => {
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    // Check if subscription already exists
    const { data: existing } = await supabase
      .from('subscriptions')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: 'active',
          end_date: endDate.toISOString()
        })
        .eq('user_id', userId);
      return { error };
    } else {
      const { error } = await supabase
        .from('subscriptions')
        .insert({
          user_id: userId,
          status: 'active',
          end_date: endDate.toISOString()
        });
      return { error };
    }
  },

  activateSubscriptionByEmail: async (email, days) => {
    // 1. Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('email', email)
      .maybeSingle();

    if (profileError || !profile) {
      return { error: profileError || new Error('User not found with this email') };
    }

    // 2. Activate subscription
    return await get().activateSubscription(profile.id, Number(days));
  },

  fetchAdminStats: async () => {
    const { count: userCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { count: subCount } = await supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active');
    const { data: payments } = await supabase.from('payment_requests').select('amount').eq('status', 'approved');

    const revenue = payments?.reduce((acc, curr) => acc + Number(curr.amount), 0) || 0;

    return { userCount, subCount, revenue };
  },

  spendCoins: async (amount, description) => {
    const { user, profile } = get();
    if (!user || !profile) return false;
    
    if ((profile.total_coins || 0) < amount) {
      throw new Error('Insufficient coins balance');
    }
    
    try {
      // 1. Update Profile
      const { data, error } = await supabase
        .from('profiles')
        .update({ total_coins: (profile.total_coins || 0) - amount })
        .eq('id', user.id)
        .select()
        .single();
        
      if (error) throw error;
      set({ profile: data });
      
      // 2. Record in Ledger (Audit Trail)
      await supabase.from('points_ledger').insert({
        user_id: user.id,
        amount: -amount,
        type: 'spend',
        description
      });
      
      return true;
    } catch (e) {
      console.error('[Store] Coin spend failed:', e.message);
      throw e;
    }
  }

}));

export default useAuthStore;
