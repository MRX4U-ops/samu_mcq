import React, { useState, useEffect } from 'react';
import { 
  UsersRound, ShieldCheck, UserPlus, Trash2, 
  Check, X, AlertCircle, Loader2, RefreshCw, Key
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import useAuthStore from '../store/authStore';

const SubAdmins = () => {
  const admin = useAuthStore(state => state.admin);
  const isSuper = admin?.isSuperAdmin || admin?.email?.toLowerCase() === 'mohd6396889713@gmail.com';

  const [subAdmins, setSubAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/sub-admins');
      if (Array.isArray(res.data)) {
        setSubAdmins(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch sub-admins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddSubAdmin = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setActionLoading(true);
    try {
      const res = await axiosInstance.post('/admin/sub-admins', { email: newEmail.trim() });
      showToast(res.data.message || 'Sub-admin appointed successfully!');
      setShowAddModal(false);
      setNewEmail('');
      fetchAdmins();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to appoint sub-admin', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeAdmin = async (adm) => {
    if (adm.email?.toLowerCase() === 'mohd6396889713@gmail.com') {
      alert('Super Admin privileges cannot be revoked.');
      return;
    }
    if (!window.confirm(`Revoke admin privileges for ${adm.name || adm.email}?`)) {
      return;
    }
    try {
      await axiosInstance.delete(`/admin/sub-admins/${adm.id}`);
      showToast('Admin privileges revoked.');
      fetchAdmins();
    } catch (err) {
      showToast('Failed to revoke admin privileges', 'error');
    }
  };

  if (!isSuper) {
    return (
      <div className="p-16 text-center text-slate-500">
        <ShieldCheck size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Super Admin Restricted Area</h2>
        <p className="text-sm text-slate-500 mt-1">
          Only the primary platform owner (Sameer Ahmad - mohd6396889713@gmail.com) can manage staff roles and appointments.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} animate-in slide-in-from-top duration-200`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sub-Admin & Staff Privileges</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage administrative delegates and role appointments</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdmins}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all"
          >
            <UserPlus size={16} />
            <span>Appoint Sub-Admin by Gmail</span>
          </button>
        </div>
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subAdmins.map((adm) => {
          const isPrimary = adm.email?.toLowerCase() === 'mohd6396889713@gmail.com';
          return (
            <div 
              key={adm.id}
              className={`p-6 rounded-2xl border transition-all ${
                isPrimary 
                  ? 'bg-gradient-to-tr from-slate-900 to-indigo-950 text-white border-indigo-500/30 shadow-lg' 
                  : 'bg-white text-slate-900 border-slate-200 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm ${
                    isPrimary ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/40' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {adm.name?.charAt(0) || 'A'}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-snug">{adm.name || 'Admin'}</h3>
                    <p className={`text-xs ${isPrimary ? 'text-indigo-300' : 'text-slate-400'}`}>{adm.email}</p>
                  </div>
                </div>

                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isPrimary ? 'bg-amber-400 text-slate-950 font-black' : 'bg-purple-100 text-purple-700 font-bold'
                }`}>
                  {isPrimary ? 'Super Admin' : 'Sub-Admin'}
                </span>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100/10 flex items-center justify-between text-xs font-semibold">
                <span className={isPrimary ? 'text-slate-400' : 'text-slate-500'}>
                  {isPrimary ? 'Unrestricted Root Access' : 'Academic & Verification Delegate'}
                </span>
                {!isPrimary && (
                  <button
                    onClick={() => handleRevokeAdmin(adm)}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Revoke Admin"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Appoint Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Appoint Sub-Admin</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter the registered Gmail of the student or staff member you wish to grant administrative privileges.
            </p>

            <form onSubmit={handleAddSubAdmin} className="space-y-4 text-xs font-semibold text-slate-700">
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

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Confirm Appointment</span>}
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
