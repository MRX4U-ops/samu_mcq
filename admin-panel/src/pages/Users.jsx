import React, { useState, useEffect } from 'react';
import { 
  Search, ShieldCheck, Ban, Trash2, UserPlus,
  Mail, Phone, Calendar, Check, X, ShieldAlert,
  Loader2, RefreshCw, Clock, Edit2
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';
import adminService from '../services/adminService';
import useAuthStore from '../store/authStore';

const Users = () => {
  const admin = useAuthStore(state => state.admin);
  const isSuper = admin?.isSuperAdmin || admin?.email?.toLowerCase() === 'mohd6396889713@gmail.com';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [addForm, setAddForm] = useState({ email: '', name: '', phone: '', grantDays: 90 });
  const [subForm, setSubForm] = useState({ days: 90, customDate: '', reason: 'Admin Manual Grant' });
  const [notesForm, setNotesForm] = useState({ notes: '' });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ search: searchTerm, status: statusFilter });
      if (res.users) {
        setUsers(res.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [statusFilter]);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Toggle Block / Unblock
  const handleToggleBlock = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    if (!window.confirm(`Are you sure you want to ${nextStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} ${user.name || user.email}?`)) {
      return;
    }
    try {
      await adminService.updateUser(user.id, { status: nextStatus });
      setUsers(users.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
      showToast(`User ${nextStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully.`);
    } catch (err) {
      showToast(err.message || 'Failed to update user status', 'error');
    }
  };

  // Delete User
  const handleDeleteUser = async (user) => {
    if (!isSuper) {
      alert('Only Super Admin (Sameer Ahmad) has privileges to delete accounts.');
      return;
    }
    if (!window.confirm(`PERMANENT ACTION: Delete user ${user.email} and all corresponding data? This cannot be undone.`)) {
      return;
    }
    try {
      await adminService.deleteUser(user.id);
      setUsers(users.filter(u => u.id !== user.id));
      showToast('User permanently removed.');
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // Submit Add User
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await adminService.createUser(addForm);
      setShowAddModal(false);
      setAddForm({ email: '', name: '', phone: '', grantDays: 90 });
      fetchUsers();
      showToast('User account successfully created and verified!');
    } catch (err) {
      showToast(err.message || 'Failed to create user', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Subscription Grant
  const handleSubSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.grantSubscription(selectedUser.id, {
        days: subForm.days,
        customDate: subForm.customDate,
        reason: subForm.reason
      });
      setShowSubModal(false);
      fetchUsers();
      showToast(`Granted subscription to ${selectedUser.name || selectedUser.email}`);
    } catch (err) {
      showToast(err.message || 'Failed to grant subscription', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Submit Notes
  const handleNotesSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await adminService.updateUser(selectedUser.id, { admin_notes: notesForm.notes });
      setShowNotesModal(false);
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, admin_notes: notesForm.notes } : u));
      showToast('Private admin notes updated.');
    } catch (err) {
      showToast(err.message || 'Failed to save notes', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Filtering
  const filteredUsers = users.filter(u => {
    const matchesSearch = 
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.phone || '').includes(searchTerm);
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? u.status === 'active' :
      statusFilter === 'blocked' ? u.status === 'blocked' :
      statusFilter === 'subscribed' ? u.hasActiveSubscription : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} animate-in slide-in-from-top duration-200`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 text-sm mt-0.5">Control 300+ registered medical students and platform access</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchUsers}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh Users"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide shadow-md shadow-indigo-600/20 transition-all"
          >
            <UserPlus size={16} />
            <span>Add Student by Gmail</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search by Gmail, full name, or phone..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['all', 'active', 'subscribed', 'blocked'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === tab 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab === 'subscribed' ? '★ Premium' : tab}
            </button>
          ))}
          <span className="text-xs font-bold text-slate-400 ml-2">
            ({filteredUsers.length} Users)
          </span>
        </div>
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={28} />
            <p className="text-sm font-bold">Querying live student registry...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-bold">No students match your filter criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student Profile</th>
                  <th className="px-6 py-4">Status & Role</th>
                  <th className="px-6 py-4">Subscription</th>
                  <th className="px-6 py-4">Quiz Metrics</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 text-indigo-600 font-bold flex items-center justify-center shrink-0 border border-indigo-200/50">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-slate-900 truncate">{user.name || 'Anonymous Student'}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate flex items-center gap-1">
                            <Mail size={11} />
                            <span>{user.email}</span>
                          </p>
                          {user.phone && (
                            <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                              <Phone size={10} />
                              <span>{user.phone}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Status & Role */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          user.status === 'blocked' 
                            ? 'bg-rose-100 text-rose-700' 
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {user.status || 'active'}
                        </span>
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-700">
                            Admin
                          </span>
                        )}
                        {user.email?.toLowerCase() === 'mohd6396889713@gmail.com' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-300">
                            ★ Super Admin
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Subscription */}
                    <td className="px-6 py-4">
                      {user.hasActiveSubscription ? (
                        <div className="space-y-0.5">
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                            <ShieldCheck size={13} />
                            <span>Active Premium</span>
                          </span>
                          <p className="text-[10px] text-slate-400">
                            Expires: {new Date(user.subscriptionEndDate).toLocaleDateString()}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          Free Mode
                        </span>
                      )}
                    </td>

                    {/* Quiz Metrics */}
                    <td className="px-6 py-4">
                      <div className="text-[11px] font-medium text-slate-600">
                        <span className="font-bold text-slate-900">{user.total_attempted || 0}</span> questions attempted
                        <p className="text-[10px] text-slate-400">
                          Accuracy: {Math.round(user.accuracy || 0)}%
                        </p>
                      </div>
                    </td>

                    {/* Registered Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium text-[11px]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Grant / Extend Sub */}
                        <button
                          onClick={() => { setSelectedUser(user); setShowSubModal(true); }}
                          className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold transition-colors"
                          title="Grant / Extend Subscription"
                        >
                          + Sub
                        </button>

                        {/* Notes */}
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setNotesForm({ notes: user.admin_notes || '' });
                            setShowNotesModal(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Admin Notes"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Block / Unblock */}
                        <button
                          onClick={() => handleToggleBlock(user)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            user.status === 'blocked'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                          title={user.status === 'blocked' ? 'Unblock Account' : 'Block Account'}
                        >
                          <Ban size={14} />
                        </button>

                        {/* Delete (Super Admin only) */}
                        {isSuper && user.email?.toLowerCase() !== 'mohd6396889713@gmail.com' && (
                          <button
                            onClick={() => handleDeleteUser(user)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove Account"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── MODAL: ADD STUDENT BY GMAIL ── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-lg">Add New Student Account</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Student Gmail Address *</label>
                <input
                  type="email"
                  required
                  placeholder="student@gmail.com"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Jasur Toshmatov"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Phone Number (Optional)</label>
                <input
                  type="text"
                  placeholder="+91..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Grant Subscription Upon Creation</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={addForm.grantDays}
                  onChange={(e) => setAddForm({ ...addForm, grantDays: Number(e.target.value) })}
                >
                  <option value={0}>Free Account (No Subscription)</option>
                  <option value={30}>30 Days Access</option>
                  <option value={90}>90 Days Access (Standard ₹49 Plan)</option>
                  <option value={180}>180 Days Access</option>
                  <option value={365}>365 Days Access (1 Year)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Create Account</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: GRANT / EXTEND SUBSCRIPTION ── */}
      {showSubModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">Manage Subscription</h3>
                <p className="text-xs text-slate-500 mt-0.5">{selectedUser.name} ({selectedUser.email})</p>
              </div>
              <button onClick={() => setShowSubModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubSubmit} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5">Quick Validity Presets</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[7, 30, 90, 180, 365].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSubForm({ ...subForm, days: d, customDate: '' })}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        subForm.days === d && !subForm.customDate
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">Custom Days</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  placeholder="e.g. 60"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subForm.days}
                  onChange={(e) => setSubForm({ ...subForm, days: Number(e.target.value), customDate: '' })}
                />
              </div>

              <div>
                <label className="block mb-1">Or Specific Expiration Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subForm.customDate}
                  onChange={(e) => setSubForm({ ...subForm, customDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Administrative Reason</label>
                <input
                  type="text"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={subForm.reason}
                  onChange={(e) => setSubForm({ ...subForm, reason: e.target.value })}
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowSubModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Apply Validity</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL: PRIVATE ADMIN NOTES ── */}
      {showNotesModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-base">Private Admin Notes</h3>
              <button onClick={() => setShowNotesModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleNotesSubmit} className="space-y-4 mt-4 text-xs font-semibold text-slate-700">
              <p className="text-slate-500 font-normal">
                Notes for <strong>{selectedUser.name || selectedUser.email}</strong>. Only visible to university admins.
              </p>

              <textarea
                rows={4}
                placeholder="Enter internal comments, payment verifications, or student flags..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-normal"
                value={notesForm.notes}
                onChange={(e) => setNotesForm({ notes: e.target.value })}
              />

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNotesModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Save Notes</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
