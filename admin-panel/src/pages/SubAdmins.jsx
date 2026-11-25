import React, { useState, useEffect } from 'react';
import {
  ShieldCheck, UserPlus, Trash2, Loader2, RefreshCw
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

const PERM_LABELS = [
  { key: 'view_payments', label: 'View Payments' },
  { key: 'approve_payments', label: 'Approve Payments' },
  { key: 'reject_payments', label: 'Reject Payments' },
  { key: 'manage_subscriptions', label: 'Manage Subscriptions' },
  { key: 'manage_plans', label: 'Manage Plans & Pricing' },
  { key: 'manage_settings', label: 'App Settings (Non-Sensitive)' },
];

const SubAdmins = () => {
  const admin = useAuthStore(state => state.admin);
  const isSuper = admin?.isSuperAdmin || admin?.email?.toLowerCase() === 'mohd6396889713@gmail.com';

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPerms, setNewPerms] = useState({
    view_payments: true,
    approve_payments: false,
    reject_payments: false,
    manage_subscriptions: false,
    manage_plans: false,
    manage_settings: false,
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/sub-admins');
      setSubAdmins(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to fetch sub-admins', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSuper) fetchAdmins();
  }, [isSuper]);

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post('/admin/sub-admins', {
        email: newEmail.trim(),
        permissions: newPerms,
      });
      showToast('Sub-admin appointed with explicit permissions!');
      setShowAddModal(false);
      setNewEmail('');
      await fetchAdmins();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to appoint sub-admin', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTogglePerm = async (adm, key) => {
    const updated = { ...(adm.permissions || {}), [key]: !adm.permissions?.[key] };
    try {
      await axiosInstance.put(`/admin/sub-admins/${adm.id}/permissions`, { permissions: updated });
      setSubAdmins(prev => prev.map(a => (a.id === adm.id ? { ...a, permissions: updated } : a)));
      showToast('Permissions updated.');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to update permission', 'error');
    }
  };

  const handleRevokeAdmin = async (adm) => {
    if (adm.email?.toLowerCase() === 'mohd6396889713@gmail.com') return;
    if (!window.confirm(`Revoke admin privileges for ${adm.name || adm.email}?`)) return;
    try {
      await axiosInstance.delete(`/admin/sub-admins/${adm.id}`);
      showToast('Admin privileges revoked.');
      await fetchAdmins();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to revoke admin privileges', 'error');
    }
  };

  if (!isSuper) {
    return (
      <div className="p-16 text-center text-slate-500">
        <ShieldCheck size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Super Admin Restricted Area</h2>
        <p className="text-sm text-slate-500 mt-1">
          Only the Super Admin can manage sub-admin staff roles and permissions.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sub-Admin &amp; Granular Permissions</h2>
          <p className="text-slate-500 text-sm mt-0.5">Grant explicit backend-enforced permissions for payment viewing, approval, rejection, and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchAdmins} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-md shadow-indigo-600/20">
            <UserPlus size={16} /><span>Appoint Sub-Admin</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {subAdmins.map((adm) => {
          const isPrimary = adm.isSuperAdmin || adm.email?.toLowerCase() === 'mohd6396889713@gmail.com';
          return (
            <div
              key={adm.id}
              className={`p-6 rounded-2xl border ${
                isPrimary
                  ? 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border-indigo-500/30 shadow-lg'
                  : 'bg-white text-slate-900 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-sm">{adm.name || 'Admin'}</h3>
                  <p className={`text-xs ${isPrimary ? 'text-indigo-300' : 'text-slate-400'}`}>{adm.email}</p>
                </div>
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                  isPrimary ? 'bg-amber-400 text-slate-950' : 'bg-purple-100 text-purple-700'
                }`}>
                  {isPrimary ? 'Super Admin' : 'Sub-Admin'}
                </span>
              </div>

              {!isPrimary && (
                <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                  {PERM_LABELS.map((p) => (
                    <label key={p.key} className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={Boolean(adm.permissions?.[p.key])}
                        onChange={() => handleTogglePerm(adm, p.key)}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-5 pt-3 border-t border-slate-100/10 flex items-center justify-between text-xs font-semibold">
                <span className={isPrimary ? 'text-slate-400' : 'text-slate-500'}>
                  {isPrimary ? 'All Permissions (Super Admin)' : 'Backend RBAC Enforced'}
                </span>
                {!isPrimary && (
                  <button onClick={() => handleRevokeAdmin(adm)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg" title="Revoke Admin">
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Appoint Sub-Admin</h3>
            <form onSubmit={handleAddSubAdmin} className="space-y-4 text-xs font-semibold text-slate-700 mt-3">
              <div>
                <label className="block mb-1">Registered Gmail Address *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@gmail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="font-bold text-slate-800">Granted Permissions:</div>
                {PERM_LABELS.map((p) => (
                  <label key={p.key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={Boolean(newPerms[p.key])}
                      onChange={(e) => setNewPerms({ ...newPerms, [p.key]: e.target.checked })}
                    />
                    <span>{p.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center">
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Appoint</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubAdmins;
