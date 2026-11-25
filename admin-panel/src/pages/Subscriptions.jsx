import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, RefreshCw, Clock, Ban, RotateCcw, Loader2, Download, History
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const Subscriptions = () => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [showAudit, setShowAudit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, expired, suspended, cancelled
  const [notification, setNotification] = useState(null);

  // Action Modal (Extend / Suspend / Reinstate / Revoke / Custom Expiry)
  const [showModal, setShowModal] = useState(false);
  const [selectedSub, setSelectedSub] = useState(null);
  const [modalAction, setModalAction] = useState('extend');
  const [formDays, setFormDays] = useState(90);
  const [customDate, setCustomDate] = useState('');
  const [reason, setReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/subscriptions', {
        params: { search: searchTerm, status: filter },
      });
      setSubscriptions(data?.subscriptions || []);
    } catch (err) {
      showToast(err.response?.data?.error || err.message || 'Failed to fetch subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [filter, searchTerm]);

  const fetchAudit = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/audit-logs', { params: { category: 'SUBSCRIPTION' } });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch {}
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const openActionModal = (sub, action) => {
    setSelectedSub(sub);
    setModalAction(action);
    setFormDays(90);
    setCustomDate('');
    setReason(
      action === 'suspend' ? 'Suspicious activity / account review'
      : action === 'revoke' ? 'Subscription revoked by admin'
      : action === 'reinstate' ? 'Verified and reinstated by admin'
      : 'Admin validity adjustment'
    );
    setShowModal(true);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSub || !reason.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/subscriptions/${selectedSub.id}/status`, {
        action: customDate && modalAction === 'extend' ? 'set_expiry' : modalAction,
        days: formDays,
        customDate: customDate || undefined,
        reason: reason.trim(),
      });
      setShowModal(false);
      showToast(`Subscription ${modalAction} completed & logged!`);
      await fetchSubscriptions();
    } catch (err) {
      showToast(err.response?.data?.error || 'Action failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['User Name', 'Email', 'Mobile', 'Status', 'Plan', 'Start Date', 'Expiry Date', 'Remaining Days'];
    const rows = subscriptions.map(s => [
      `"${s.profiles?.name || ''}"`,
      `"${s.profiles?.email || ''}"`,
      `"${s.profiles?.phone || ''}"`,
      s.lifecycleStatus || s.displayStatus,
      `"${s.planName || ''}"`,
      new Date(s.start_date).toLocaleDateString(),
      new Date(s.end_date).toLocaleDateString(),
      s.remainingDays,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ssmu_subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-6">
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 text-sm font-bold ${notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'}`}>
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Subscription Control Center</h2>
          <p className="text-slate-500 text-sm mt-0.5">Search by name/email/mobile, extend, suspend, reinstate, or revoke with mandatory audit logging</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowAudit((v) => !v); if (!showAudit) fetchAudit(); }}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs"
          >
            <History size={15} /><span>{showAudit ? 'Hide Audit Log' : 'Subscription Audit Log'}</span>
          </button>
          <button onClick={exportCSV} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs">
            <Download size={15} /><span>Export CSV</span>
          </button>
          <button onClick={fetchSubscriptions} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {showAudit && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 max-h-72 overflow-y-auto">
          <div className="text-xs font-black text-slate-700 uppercase">Subscription Audit Trail</div>
          {auditLogs.length === 0 ? (
            <div className="text-xs text-slate-400">No subscription audit logs yet.</div>
          ) : (
            auditLogs.map((l) => (
              <div key={l.id} className="p-2.5 rounded-xl bg-slate-50 text-xs flex justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold mr-2">{l.action}</span>
                  <span className="text-slate-700 font-semibold">{l.reason}</span>
                </div>
                <div className="text-slate-400 text-right shrink-0">{l.adminEmail || 'System'} · {new Date(l.timestamp).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search name, email, or mobile..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {['all', 'active', 'expired', 'suspended', 'cancelled'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                filter === tab ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
          <span className="text-xs font-bold text-slate-400 ml-2">({subscriptions.length})</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
            <p className="text-sm font-bold">Loading subscriptions...</p>
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-bold">No subscriptions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-4">Student</th>
                  <th className="px-5 py-4">Status &amp; Plan</th>
                  <th className="px-5 py-4">Validity Range</th>
                  <th className="px-5 py-4">Remaining</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {subscriptions.map((sub) => {
                  const st = sub.lifecycleStatus || (sub.displayStatus === 'active' ? 'ACTIVE' : 'EXPIRED');
                  const isActive = st === 'ACTIVE';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <p className="font-bold text-slate-900">{sub.profiles?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-500">{sub.profiles?.email}</p>
                        {sub.profiles?.phone && <p className="text-[10.5px] text-slate-400">{sub.profiles.phone}</p>}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                          isActive ? 'bg-emerald-100 text-emerald-800' :
                          st === 'SUSPENDED' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {st}
                        </span>
                        <div className="text-[10.5px] text-slate-500 mt-1">{sub.planName} · {sub.activationSource}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600 text-[11px]">
                        <div>From: {new Date(sub.start_date).toLocaleDateString()}</div>
                        <div className="text-slate-400 font-semibold">To: {new Date(sub.end_date).toLocaleDateString()}</div>
                      </td>
                      <td className="px-5 py-4">
                        {isActive ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 font-bold">
                            <Clock size={13} /><span>{sub.remainingDays} days left</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 font-medium">0 days</span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => openActionModal(sub, 'extend')}
                            className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-bold"
                          >
                            {isActive ? '+ Extend / Date' : 'Renew'}
                          </button>
                          {isActive ? (
                            <>
                              <button
                                onClick={() => openActionModal(sub, 'suspend')}
                                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-lg font-bold"
                              >
                                Suspend
                              </button>
                              <button
                                onClick={() => openActionModal(sub, 'revoke')}
                                className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg"
                                title="Revoke Subscription"
                              >
                                <Ban size={15} />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => openActionModal(sub, 'reinstate')}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg font-bold"
                            >
                              <RotateCcw size={13} /> Reinstate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Action Modal */}
      {showModal && selectedSub && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base capitalize">{modalAction} Subscription</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Student: <strong>{selectedSub.profiles?.name || selectedSub.profiles?.email}</strong>
            </p>

            <form onSubmit={handleActionSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              {(modalAction === 'extend' || modalAction === 'reinstate') && (
                <>
                  <div>
                    <label className="block mb-1.5">Duration (Days)</label>
                    <div className="grid grid-cols-5 gap-1.5 mb-2">
                      {[7, 30, 90, 180, 365].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => { setFormDays(d); setCustomDate(''); }}
                          className={`py-2 rounded-xl font-bold border ${formDays === d && !customDate ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-200'}`}
                        >
                          +{d}d
                        </button>
                      ))}
                    </div>
                    <input
                      type="number"
                      min="1"
                      max="3650"
                      className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                      value={formDays}
                      onChange={(e) => { setFormDays(Number(e.target.value)); setCustomDate(''); }}
                    />
                  </div>

                  {modalAction === 'extend' && (
                    <div>
                      <label className="block mb-1">Or Specific Expiry Date</label>
                      <input
                        type="date"
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                        value={customDate}
                        onChange={(e) => setCustomDate(e.target.value)}
                      />
                    </div>
                  )}
                </>
              )}

              <div>
                <label className="block mb-1">Audit Reason (Mandatory) *</label>
                <textarea
                  rows={2}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center">
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Confirm Action</span>}
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
