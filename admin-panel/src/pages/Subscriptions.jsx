import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Search, Calendar, RefreshCw, 
  Clock, AlertCircle, CheckCircle2, Plus, Ban, RotateCcw,
  Loader2, Download
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired
  const [notification, setNotification] = useState(null);

  // Extend Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [formDays, setFormDays] = useState(90);
  const [customDate, setCustomDate] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/subscriptions');
      if (res.data?.subscriptions) {
        setSubscriptions(res.data.subscriptions);
      }
    } catch (err) {
      console.error('Failed to fetch subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleRevoke = async (sub) => {
    if (!window.confirm(`Revoke premium subscription for ${sub.profiles?.name || sub.profiles?.email}?`)) {
      return;
    }
    try {
      await axiosInstance.post(`/admin/subscriptions/revoke/${sub.id}`);
      fetchSubscriptions();
      showToast('Subscription revoked.');
    } catch (err) {
      showToast('Failed to revoke subscription', 'error');
    }
  };

  const handleExtendSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub) return;
    setActionLoading(true);
    try {
      await axiosInstance.post('/admin/subscriptions/manual', {
        userId: selectedSub.user_id,
        days: formDays,
        customDate: customDate
      });
      setShowModal(false);
      fetchSubscriptions();
      showToast('Subscription extended successfully!');
    } catch (err) {
      showToast('Failed to extend subscription', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // CSV Export
  const exportCSV = () => {
    const headers = ['User Name', 'Email', 'Status', 'Start Date', 'Expiry Date', 'Remaining Days'];
    const rows = subscriptions.map(s => [
      `"${s.profiles?.name || ''}"`,
      `"${s.profiles?.email || ''}"`,
      s.displayStatus,
      new Date(s.start_date).toLocaleDateString(),
      new Date(s.end_date).toLocaleDateString(),
      s.remainingDays
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `samu_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSubs = subscriptions.filter(s => {
    const matchesSearch = 
      (s.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'active' ? s.displayStatus === 'active' :
      filter === 'expired' ? s.displayStatus === 'expired' : true;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="p-8 space-y-6">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'} animate-in slide-in-from-top duration-200`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Control Center</h2>
          <p className="text-slate-500 text-sm mt-0.5">Manage premium 6-course curriculum licenses and validity</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors shadow-xs"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
          <button 
            onClick={fetchSubscriptions}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search student or email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'active', 'expired'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === tab 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="text-xs font-bold text-slate-400 ml-2">
            ({filteredSubs.length} Subscriptions)
          </span>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={28} />
            <p className="text-sm font-bold">Querying subscription records...</p>
          </div>
        ) : filteredSubs.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-bold">No subscriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Validity Range</th>
                  <th className="px-6 py-4">Remaining Days</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredSubs.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{sub.profiles?.name || 'Anonymous'}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{sub.profiles?.email}</p>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        sub.displayStatus === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {sub.displayStatus === 'active' ? '● Active' : '○ Expired'}
                      </span>
                    </td>

                    {/* Validity Range */}
                    <td className="px-6 py-4 text-slate-600 text-[11px] font-medium">
                      <div>
                        <span>From: {new Date(sub.start_date).toLocaleDateString()}</span>
                        <p className="text-slate-400 font-semibold">
                          To: {new Date(sub.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    </td>

                    {/* Remaining Days */}
                    <td className="px-6 py-4">
                      {sub.displayStatus === 'active' ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                          <Clock size={13} />
                          <span>{sub.remainingDays} days left</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 font-medium">Expired</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => { setSelectedSub(sub); setShowModal(true); }}
                          className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          {sub.displayStatus === 'active' ? '+ Extend Days' : 'Renew License'}
                        </button>
                        {sub.displayStatus === 'active' && (
                          <button
                            onClick={() => handleRevoke(sub)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Revoke / Suspend"
                          >
                            <Ban size={15} />
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

      {/* Extend Modal */}
      {showModal && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Extend or Renew Subscription</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Student: <strong>{selectedSub.profiles?.name || selectedSub.profiles?.email}</strong>
            </p>

            <form onSubmit={handleExtendSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1.5">Preset Duration</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {[7, 30, 90, 180, 365].map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => { setFormDays(d); setCustomDate(''); }}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        formDays === d && !customDate
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      +{d}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block mb-1">Custom Additional Days</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={formDays}
                  onChange={(e) => { setFormDays(Number(e.target.value)); setCustomDate(''); }}
                />
              </div>

              <div>
                <label className="block mb-1">Or Specific End Date</label>
                <input
                  type="date"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                />
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
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Update License</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
