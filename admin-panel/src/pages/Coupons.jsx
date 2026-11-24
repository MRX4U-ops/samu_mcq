import React, { useState, useEffect } from 'react';
import { 
  Ticket, Search, Plus, RefreshCw, Copy, Check, Trash2, 
  Clock, Percent, Gift, CheckCircle2, AlertCircle, X,
  Sparkles, Shuffle, ShieldCheck, Flame, ArrowUpRight
} from 'lucide-react';
import adminService from '../services/adminService';

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, days, discount, active, inactive
  const [copiedCode, setCopiedCode] = useState(null);
  const [notification, setNotification] = useState(null);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [formType, setFormType] = useState('days'); // 'days' or 'discount'
  const [formCode, setFormCode] = useState('');
  const [formValue, setFormValue] = useState(30);
  const [formLimit, setFormLimit] = useState(100);
  const [formActive, setFormActive] = useState(true);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await adminService.getCoupons();
      setCoupons(data);
    } catch (err) {
      console.error('Failed to fetch coupons:', err);
      showToast(err.message || 'Failed to load coupons', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(`Copied ${code} to clipboard!`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  const handleToggleStatus = async (coupon) => {
    try {
      await adminService.toggleCouponStatus(coupon.id, coupon.is_active);
      setCoupons(prev => prev.map(c => c.id === coupon.id ? { ...c, is_active: !c.is_active } : c));
      showToast(`Coupon ${coupon.code} ${!coupon.is_active ? 'activated' : 'deactivated'}.`);
    } catch (err) {
      showToast(err.message || 'Failed to toggle coupon status', 'error');
    }
  };

  const handleDelete = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon '${coupon.code}'?`)) {
      return;
    }
    try {
      await adminService.deleteCoupon(coupon.id);
      setCoupons(prev => prev.filter(c => c.id !== coupon.id));
      showToast(`Coupon ${coupon.code} deleted.`);
    } catch (err) {
      showToast(err.message || 'Failed to delete coupon', 'error');
    }
  };

  const generateRandomCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let rand = '';
    for (let i = 0; i < 4; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    if (formType === 'days') {
      setFormCode(`FREE${formValue}D_${rand}`);
    } else {
      setFormCode(`SAVE${formValue}_${rand}`);
    }
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!formCode.trim()) {
      showToast('Please provide a coupon code.', 'error');
      return;
    }
    if (!formValue || Number(formValue) <= 0) {
      showToast('Please provide a valid value (days or percentage).', 'error');
      return;
    }

    try {
      setModalLoading(true);
      await adminService.createCoupon({
        code: formCode,
        type: formType,
        value: formValue,
        usageLimit: formLimit,
        isActive: formActive
      });
      setShowModal(false);
      resetForm();
      fetchCoupons();
      showToast(`Coupon '${formCode.toUpperCase()}' generated successfully!`);
    } catch (err) {
      showToast(err.message || 'Failed to create coupon', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const resetForm = () => {
    setFormCode('');
    setFormType('days');
    setFormValue(30);
    setFormLimit(100);
    setFormActive(true);
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;

    if (filterType === 'all') return true;
    if (filterType === 'active') return c.is_active;
    if (filterType === 'inactive') return !c.is_active;
    if (filterType === 'days') return c.type === 'days';
    if (filterType === 'discount') return c.type === 'discount';
    return true;
  });

  // Stats calculation
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.is_active).length;
  const freeDaysCoupons = coupons.filter(c => c.type === 'days').length;
  const totalRedemptions = coupons.reduce((sum, c) => sum + (c.current_usage || 0), 0);

  return (
    <div className="p-4 sm:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
        } animate-in slide-in-from-top duration-200`}>
          {notification.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Ticket className="text-indigo-600" size={28} />
            Coupon & Promo Code Generator
          </h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Generate and manage subscription codes for free days access or percentage discounts
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchCoupons} 
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs transition-colors"
            title="Refresh coupons"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
          >
            <Plus size={16} />
            <span>+ Generate New Coupon</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Coupons</span>
            <Ticket size={16} className="text-slate-400" />
          </div>
          <p className="text-2xl font-black text-slate-900">{totalCoupons}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Active Codes</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-black text-emerald-600">{activeCoupons}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Free Days Codes</span>
            <Gift size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-black text-amber-600">{freeDaysCoupons}</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">
            <span>Total Redemptions</span>
            <Flame size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-black text-indigo-600">{totalRedemptions.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search coupon code..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Coupons' },
            { id: 'active', label: 'Active' },
            { id: 'inactive', label: 'Inactive' },
            { id: 'days', label: '🎁 Free Days' },
            { id: 'discount', label: '🏷️ % Discounts' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filterType === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-6 py-4">Coupon Code</th>
                <th className="px-6 py-4">Benefit Type</th>
                <th className="px-6 py-4">Usage & Limit</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Created Date</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <RefreshCw className="animate-spin inline-block mr-2" size={16} />
                    Loading coupons...
                  </td>
                </tr>
              ) : filteredCoupons.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-12 text-slate-400">
                    <Ticket className="inline-block mb-2 text-slate-300" size={32} />
                    <p className="font-semibold">No coupons found matching your filter.</p>
                    <button 
                      onClick={() => { resetForm(); setShowModal(true); }}
                      className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 text-indigo-600 font-bold rounded-lg text-xs hover:bg-indigo-100 transition-colors"
                    >
                      <Plus size={14} /> Create your first coupon
                    </button>
                  </td>
                </tr>
              ) : (
                filteredCoupons.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Code Badge */}
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm tracking-wider px-3 py-1 rounded-lg bg-slate-100 text-indigo-700 border border-slate-200">
                          {c.code}
                        </span>
                        <button
                          onClick={() => handleCopyCode(c.code)}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
                          title="Copy Code"
                        >
                          {copiedCode === c.code ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </td>

                    {/* Benefit Type */}
                    <td className="px-6 py-4">
                      {c.type === 'days' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Gift size={13} className="text-emerald-600" />
                          <span>{c.benefitLabel}</span>
                        </span>
                      ) : parseFloat(c.discount_percentage) === 100 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                          <Sparkles size={13} className="text-purple-600" />
                          <span>100% Free Full Access</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          <Percent size={13} className="text-blue-600" />
                          <span>{c.benefitLabel}</span>
                        </span>
                      )}
                    </td>

                    {/* Usage Progress */}
                    <td className="px-6 py-4">
                      <div className="space-y-1.5 min-w-[130px] max-w-[180px]">
                        <div className="flex justify-between items-center text-[11px] font-bold">
                          <span className="text-slate-700">{c.current_usage || 0} used</span>
                          <span className="text-slate-400">
                            {c.usage_limit >= 10000 ? 'Unlimited' : `of ${c.usage_limit}`}
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              c.isLimitReached ? 'bg-rose-500' : c.usagePercentage > 75 ? 'bg-amber-500' : 'bg-indigo-600'
                            }`}
                            style={{ width: `${c.usagePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(c)}
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold transition-all ${
                          !c.is_active 
                            ? 'bg-slate-100 text-slate-500 hover:bg-slate-200' 
                            : c.isLimitReached 
                            ? 'bg-rose-50 text-rose-600 border border-rose-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          !c.is_active ? 'bg-slate-400' : c.isLimitReached ? 'bg-rose-500' : 'bg-emerald-500'
                        }`} />
                        <span>
                          {!c.is_active ? 'Inactive' : c.isLimitReached ? 'Limit Reached' : 'Active'}
                        </span>
                      </button>
                    </td>

                    {/* Created Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {c.created_at ? new Date(c.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleStatus(c)}
                          className="px-2.5 py-1 text-[11px] font-bold rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                        >
                          {c.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Coupon"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ═══ GENERATE COUPON MODAL ══════════════════════════════ */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 via-white to-transparent">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Ticket className="text-indigo-600" size={20} />
                  Generate New Coupon
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure free subscription days or a percentage discount
                </p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateCoupon} className="p-6 space-y-5">
              {/* Step 1: Choose Benefit Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Coupon Benefit Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => { setFormType('days'); setFormValue(30); }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      formType === 'days'
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm mb-1">
                      <Gift size={18} />
                      <span>Free Days Access</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Grants X days of 100% free premium access
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => { setFormType('discount'); setFormValue(50); }}
                    className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                      formType === 'discount'
                        ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-1">
                      <Percent size={18} />
                      <span>Percentage Discount</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-tight">
                      Applies % discount when purchasing subscription
                    </p>
                  </button>
                </div>
              </div>

              {/* Step 2: Benefit Value with Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    2. {formType === 'days' ? 'Number of Free Days' : 'Discount Percentage (%)'}
                  </label>
                  <span className="text-xs font-bold text-indigo-600">
                    {formType === 'days' ? `${formValue} Days Free` : `${formValue}% Discount`}
                  </span>
                </div>

                {formType === 'days' ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {[7, 14, 30, 90, 180, 365].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setFormValue(d)}
                          className={`py-2 px-1.5 rounded-xl text-xs font-bold transition-all border ${
                            formValue === d
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          +{d}d
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="730"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        placeholder="Custom number of days..."
                        required
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">Days</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="grid grid-cols-5 gap-2">
                      {[10, 20, 50, 75, 100].map(p => (
                        <button
                          key={p}
                          type="button"
                          onClick={() => setFormValue(p)}
                          className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                            formValue === p
                              ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {p}%
                        </button>
                      ))}
                    </div>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        max="100"
                        value={formValue}
                        onChange={(e) => setFormValue(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        placeholder="Custom discount percentage..."
                        required
                      />
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">%</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 3: Coupon Code */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Coupon Code
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomCode}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Shuffle size={12} />
                    <span>Generate Random Code</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                    placeholder="e.g. SUMMER30, TRH100, WELCOME7D"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono font-bold uppercase tracking-wider text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              {/* Step 4: Usage Limit & Active State */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Usage Limit
                  </label>
                  <select
                    value={formLimit}
                    onChange={(e) => setFormLimit(Number(e.target.value))}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={25}>25 Redemptions</option>
                    <option value={50}>50 Redemptions</option>
                    <option value={100}>100 Redemptions</option>
                    <option value={500}>500 Redemptions</option>
                    <option value={1000}>1,000 Redemptions</option>
                    <option value={10000}>Unlimited (10,000)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Initial Status
                  </label>
                  <div className="flex items-center gap-2 pt-1.5">
                    <input
                      type="checkbox"
                      id="formActiveCheck"
                      checked={formActive}
                      onChange={(e) => setFormActive(e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded-md focus:ring-indigo-500"
                    />
                    <label htmlFor="formActiveCheck" className="text-xs font-bold text-slate-800 cursor-pointer">
                      Activate Immediately
                    </label>
                  </div>
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="p-3.5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest block">Student Preview</span>
                  <p className="font-mono font-black text-sm text-yellow-300 tracking-wider">
                    {formCode.trim() || 'COUPON_CODE'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-emerald-400">
                    {formType === 'days' ? `+${formValue} Days Free Access` : `${formValue}% Off`}
                  </span>
                  <p className="text-[10px] text-slate-400">Max: {formLimit >= 10000 ? 'Unlimited' : `${formLimit} uses`}</p>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
                >
                  {modalLoading && <RefreshCw size={14} className="animate-spin" />}
                  <span>Save & Activate Coupon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
