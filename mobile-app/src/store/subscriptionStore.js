import { create } from 'zustand';
import { supabase } from '../services/supabaseClient';
import { API_URL } from '../config/Constants';

const useSubscriptionStore = create((set, get) => ({
  subscription: null,
  paymentRequests: [],
  isLoading: false,
  error: null,

  fetchSubscriptionStatus: async (userId) => {
    set({ isLoading: true });
    try {
      const { data: subData, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .gt('end_date', new Date().toISOString())
        .maybeSingle();

      if (subError) throw subError;
      set({ subscription: subData, isLoading: false });
      return subData;
    } catch (error) {
      console.error("Subscription Check Error:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },

  fetchPaymentRequests: async (userId) => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from('payment_requests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      set({ paymentRequests: data, isLoading: false });
    } catch (error) {
      set({ error: error.message, isLoading: false });
    }
  },

  validatePromoCode: async (code) => {
    try {
      const { data, error } = await supabase.rpc('validate_promo', { promo_code: code });
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Promo Validation Error:", error);
      return { valid: false, message: error.message };
    }
  },

  createPaymentRequest: async (userId, transactionId, paymentReference, amount = 199.00, promoCodeId = null) => {
    set({ isLoading: true, error: null });
    try {
      // 1. Validation: check length
      if (transactionId.length < 8) {
        throw new Error('Transaction ID must be at least 8 characters.');
      }

      // 2. Check for existing pending request
      const { data: existing } = await supabase
        .from('payment_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .maybeSingle();

      if (existing) {
        throw new Error('You already have a pending payment request.');
      }

      // 3. Insert
      const { data, error } = await supabase
        .from('payment_requests')
        .insert([{
          user_id: userId,
          transaction_id: transactionId,
          payment_reference: paymentReference,
          amount: amount,
          promo_code_id: promoCodeId,
          status: 'pending'
        }])
        .select()
        .single();

      if (error) {
        if (error.code === '23505') throw new Error('This Transaction ID has already been submitted.');
        throw error;
      }

      set((state) => ({ 
        paymentRequests: [data, ...state.paymentRequests],
        isLoading: false 
      }));
      return { data, error: null };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { data: null, error };
    }
  },

  generatePaymentReference: (userId) => {
    const last4 = userId.slice(-4).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SAMU_${last4}_${random}`;
  },

  claimFreePromoCode: async (userId, promoCode, token) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${API_URL}/payments/claim-free-promo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ promoCode })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to claim promo code.');
      }

      // Refresh subscription and payment request history
      await get().fetchSubscriptionStatus(userId);
      await get().fetchPaymentRequests(userId);

      set({ isLoading: false });
      return { success: true, message: data.message };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  }
}));

export default useSubscriptionStore;
