import React, { useState, useEffect } from 'react';
import {
  Plus, Edit3, Trash2, Sparkles, RefreshCw, Loader2,
  CheckCircle2, Star, Calendar, IndianRupee, X
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const SubscriptionPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form, setForm] = useState({
    name: '',
    days: 90,
    price: 49,
    description: '',
    isPopular: false,
    isActive: true,
    sortOrder: 1,
  });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/plans');
      setPlans(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load subscription plans', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const openCreate = () => {
    setEditingPlan(null);
    setForm({
      name: '',
      days: 90,
      price: 49,
      description: 'Full access to all 6 courses, MCQs, AI Tutor & Battle Mode',
      isPopular: false,
      isActive: true,
      sortOrder: plans.length + 1,
    });
    setShowModal(true);
  };

  const openEdit = (plan) => {
    setEditingPlan(plan);
    setForm({
      name: plan.name || '',
      days: plan.days || 90,
      price: plan.price ?? 49,
      description: plan.description || '',
      isPopular: Boolean(plan.isPopular),
      isActive: plan.isActive !== false,
      sortOrder: plan.sortOrder || 1,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingPlan) {
        await axiosInstance.put(`/admin/plans/${editingPlan.id}`, form);
        showToast('Plan updated! Live website pricing updated automatically.');
      } else {
        await axiosInstance.post('/admin/plans', form);
        showToast('New subscription plan added and live on website!');
      }
      setShowModal(false);
      await fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to save plan', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (plan) => {
    try {
      await axiosInstance.put(`/admin/plans/${plan.id}`, { isActive: !(plan.isActive !== false) });
      showToast(`Plan ${plan.isActive !== false ? 'hidden from' : 'published to'} main website.`);
      await fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to toggle plan status', 'error');
    }
  };

  const handleDelete = async (plan) => {
    if (!window.confirm(`Delete plan "${plan.name}" (₹${plan.price} / ${plan.days} days)? It will be removed from the main website immediately.`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/admin/plans/${plan.id}`);
      showToast('Plan deleted and removed from website.');
      await fetchPlans();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to delete plan', 'error');
    }
  };

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Plans & Pricing</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Add, edit, or delete subscription durations (days) and prices — changes sync automatically to the main website.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchPlans}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all"
          >
            <Plus size={16} />
            <span>Add Subscription Plan</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-400">
          <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
          <p className="text-sm font-bold">Loading plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center text-slate-500">
          <p className="text-sm font-bold">No plans configured yet. Click "Add Subscription Plan" to create one.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {plans.map((plan) => {
            const active = plan.isActive !== false;
            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border p-6 shadow-xs flex flex-col justify-between transition-all ${
                  plan.isPopular ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-slate-200'
                } ${!active ? 'opacity-65' : ''}`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-base">{plan.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                          {active ? 'Live on Website' : 'Hidden'}
                        </span>
                        {plan.isPopular && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800 flex items-center gap-1">
                            <Star size={10} /> Popular
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline gap-2">
                    <span className="text-3xl font-black text-indigo-600 flex items-center">
                      <IndianRupee size={22} />{plan.price}
                    </span>
                    <span className="text-xs font-bold text-slate-500 flex items-center gap-1">
                      <Calendar size={13} /> {plan.days} Days
                    </span>
                  </div>

                  {plan.description && (
                    <p className="text-xs text-slate-500 mt-3 leading-relaxed">{plan.description}</p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleActive(plan)}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700"
                  >
                    {active ? 'Disable' : 'Enable'}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(plan)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700"
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(plan)}
                      className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                      title="Delete Plan"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Plan Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-slate-900 text-base">
                {editingPlan ? 'Update Subscription Plan' : 'Create Subscription Plan'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Plan Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Standard 90-Day Pass"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Duration (Days) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="3650"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={form.days}
                    onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}
                  />
                </div>
                <div>
                  <label className="block mb-1">Price (INR ₹) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1">Description</label>
                <textarea
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPopular}
                    onChange={(e) => setForm({ ...form, isPopular: e.target.checked })}
                  />
                  <span>Mark as Popular</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  />
                  <span>Visible on Main Website</span>
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{editingPlan ? 'Save Changes' : 'Create Plan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPlans;
