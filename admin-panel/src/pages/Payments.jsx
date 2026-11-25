import React, { useState, useEffect, useCallback } from 'react';
import {
  Check, X, CreditCard, Search, Eye, Flag, ShieldAlert,
  RefreshCw, Download, Loader2, Plus, IndianRupee,
  BarChart3, History, FileCheck2, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const FILTER_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'verification_in_progress', label: 'Verification in Progress' },
  { id: 'verified', label: 'Auto Verified' },
  { id: 'manually_approved', label: 'Manually Approved' },
  { id: 'rejected', label: 'Rejected' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'suspicious', label: 'Suspicious' },
];

const Payments = () => {
  const [activeTab, setActiveTab] = useState('requests'); // requests | reports | audit
  const [requests, setRequests] = useState([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingVerification: 0,
    autoVerified: 0,
    manuallyApproved: 0,
    rejected: 0,
    confirmedRevenue: 0,
    duplicateAttempts: 0,
    suspiciousAttempts: 0,
  });
  const [reports, setReports] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Modals
  const [detailReq, setDetailReq] = useState(null);
  const [screenshotBlobUrl, setScreenshotBlobUrl] = useState('');
  const [loadingShot, setLoadingShot] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('Transaction ID / UTR not found in UPI statement');

  const [showFlagModal, setShowFlagModal] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ userId: '', amount: 49, transactionId: '', validityDays: 90, reason: 'Offline UPI / Cash verified' });

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get('/admin/payments', {
        params: { status: statusFilter, search: searchTerm },
      });
      setRequests(data?.payments || []);
      if (data?.stats) setStats(data.stats);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load payment records', 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm]);

  const fetchReports = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/payments/reports');
      setReports(data);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load reports', 'error');
    }
  };

  const fetchAudit = async () => {
    try {
      const { data } = await axiosInstance.get('/admin/audit-logs', { params: { category: 'PAYMENT' } });
      setAuditLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to load audit logs', 'error');
    }
  };

  useEffect(() => {
    if (activeTab === 'requests') fetchPayments();
    else if (activeTab === 'reports') fetchReports();
    else if (activeTab === 'audit') fetchAudit();
  }, [activeTab, fetchPayments]);

  const openDetailModal = async (req) => {
    setDetailReq(req);
    setScreenshotBlobUrl('');
    if (req.hasScreenshot) {
      setLoadingShot(true);
      try {
        const res = await axiosInstance.get(`/admin/payments/${req.id}/screenshot`, { responseType: 'blob' });
        const url = URL.createObjectURL(res.data);
        setScreenshotBlobUrl(url);
      } catch {
        setScreenshotBlobUrl('');
      } finally {
        setLoadingShot(false);
      }
    }
  };

  const closeDetailModal = () => {
    if (screenshotBlobUrl) URL.revokeObjectURL(screenshotBlobUrl);
    setScreenshotBlobUrl('');
    setDetailReq(null);
  };

  const handleApprove = async (req) => {
    const studentName = req.profiles?.name || req.profiles?.email || 'Student';
    if (!window.confirm(`Confirm APPROVAL of UTR ${req.transaction_id} (₹${req.amount}) for ${studentName}?\nThis activates ${req.validityDays || 90} days of premium access.`)) {
      return;
    }
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/admin/payments/${req.id}/approve`, {
        validityDays: req.validityDays || 90,
      });
      showToast(data.message || 'Payment approved and subscription activated!');
      await fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/payments/${selectedReq.id}/reject`, { reason: rejectReason.trim() });
      setShowRejectModal(false);
      showToast('Payment marked as rejected.');
      await fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to reject payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyProvider = async (req) => {
    setActionLoading(true);
    try {
      const { data } = await axiosInstance.post(`/admin/payments/${req.id}/verify-provider`);
      showToast(data.message || (data.verified ? 'Provider verified transaction!' : 'Provider verification returned non-verified'), data.verified ? 'success' : 'error');
    } catch (err) {
      showToast(err.response?.data?.error || 'Verification check failed', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFlagSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/payments/${selectedReq.id}/flag`, {
        isSuspicious: !selectedReq.isSuspicious,
        reason: flagReason.trim(),
        adminNotes: internalNotes.trim(),
      });
      setShowFlagModal(false);
      setFlagReason('');
      showToast('Payment flag / internal notes updated.');
      await fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to flag payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axiosInstance.post('/admin/payments/manual', manualForm);
      setShowManualModal(false);
      showToast('Manual payment recorded and subscription activated!');
      await fetchPayments();
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to record manual payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Order ID', 'Student Name', 'Email', 'Mobile', 'UTR', 'Reference', 'Amount', 'Plan Days', 'Verification Status', 'Sub Status', 'Date'];
    const rows = requests.map(r => [
      `"${r.orderId || ''}"`,
      `"${r.profiles?.name || ''}"`,
      `"${r.profiles?.email || ''}"`,
      `"${r.profiles?.phone || ''}"`,
      `"${r.transaction_id || ''}"`,
      `"${r.payment_reference || ''}"`,
      r.amount || 49,
      r.validityDays || 90,
      r.verificationStatus,
      r.subscriptionStatus,
      new Date(r.created_at).toLocaleDateString(),
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `ssmu_payments_${new Date().toISOString().split('T')[0]}.csv`);
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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Verification & Revenue</h2>
          <p className="text-slate-500 text-sm mt-0.5">Backend-verified Direct UPI orders, private proofs, anti-fraud checks & audit logs</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={exportCSV} className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs">
            <Download size={15} /><span>Export CSV</span>
          </button>
          <button onClick={() => setShowManualModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs">
            <Plus size={15} /><span>Manual Payment</span>
          </button>
          <button onClick={fetchPayments} className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs" title="Refresh">
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'requests', label: 'Payment Requests', icon: CreditCard },
          { id: 'reports', label: 'Revenue & Reports', icon: BarChart3 },
          { id: 'audit', label: 'Audit Trail', icon: History },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === t.id ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <t.icon size={15} /><span>{t.label}</span>
          </button>
        ))}
      </div>

      {activeTab === 'requests' && (
        <>
          {/* 8 KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-4 rounded-2xl border border-slate-200"><div className="text-[11px] font-bold text-slate-400 uppercase">Total Requests</div><div className="text-2xl font-black text-slate-900 mt-1">{stats.totalRequests}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200 bg-amber-50/30"><div className="text-[11px] font-bold text-amber-700 uppercase">Pending Verification</div><div className="text-2xl font-black text-amber-700 mt-1">{stats.pendingVerification}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200"><div className="text-[11px] font-bold text-emerald-700 uppercase">Confirmed Revenue</div><div className="text-2xl font-black text-emerald-700 mt-1">₹{stats.confirmedRevenue}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-indigo-200"><div className="text-[11px] font-bold text-indigo-600 uppercase">Manually Approved</div><div className="text-2xl font-black text-indigo-700 mt-1">{stats.manuallyApproved}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200"><div className="text-[11px] font-bold text-slate-500 uppercase">Auto Verified</div><div className="text-xl font-black text-slate-800 mt-1">{stats.autoVerified}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-rose-200"><div className="text-[11px] font-bold text-rose-600 uppercase">Rejected</div><div className="text-xl font-black text-rose-700 mt-1">{stats.rejected}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-orange-200"><div className="text-[11px] font-bold text-orange-600 uppercase">Duplicate Attempts</div><div className="text-xl font-black text-orange-700 mt-1">{stats.duplicateAttempts}</div></div>
            <div className="bg-white p-4 rounded-2xl border border-red-200"><div className="text-[11px] font-bold text-red-600 uppercase">Suspicious Flagged</div><div className="text-xl font-black text-red-700 mt-1">{stats.suspiciousAttempts}</div></div>
          </div>

          {/* Filter & Search Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="relative w-full sm:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
              <input
                type="text"
                placeholder="Search student, email, mobile, order ID, UTR..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    statusFilter === tab.id ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Payments Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-16 text-center text-slate-400">
                <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
                <p className="text-sm font-bold">Loading payment requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-16 text-center text-slate-400">
                <p className="text-sm font-bold">No payment requests match your filter.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Student</th>
                      <th className="px-4 py-3">Order / UTR</th>
                      <th className="px-4 py-3">Amount / Plan</th>
                      <th className="px-4 py-3">Dates</th>
                      <th className="px-4 py-3">Method &amp; Status</th>
                      <th className="px-4 py-3">Sub / Admin</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {requests.map((req) => (
                      <tr key={req.id} className={`hover:bg-slate-50/70 ${req.isSuspicious ? 'bg-rose-50/30' : ''}`}>
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-900">{req.profiles?.name || 'Student'}</p>
                          <p className="text-[11px] text-slate-500">{req.profiles?.email}</p>
                          {req.profiles?.phone && <p className="text-[10.5px] text-slate-400">{req.profiles.phone}</p>}
                        </td>
                        <td className="px-4 py-3 font-mono text-[11px]">
                          <div className="font-bold text-indigo-700">{req.orderId}</div>
                          <div className="font-bold text-slate-800">{req.isTempOrder ? 'Awaiting UTR' : req.transaction_id}</div>
                          <div className="text-[10px] text-slate-400">Payer: {req.payerName}</div>
                          {req.isSuspicious && (
                            <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded bg-rose-100 text-rose-700 text-[10px] font-sans font-bold">
                              <AlertTriangle size={10} /> Suspicious
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-black text-slate-900">₹{req.amount}</div>
                          <div className="text-[10.5px] text-slate-500">{req.planName} ({req.validityDays}d)</div>
                        </td>
                        <td className="px-4 py-3 text-[11px] text-slate-500">
                          <div>Pay: {new Date(req.transactionDate).toLocaleDateString()}</div>
                          {req.submittedAt && <div>Sub: {new Date(req.submittedAt).toLocaleDateString()}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                            req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                            req.isTempOrder ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {req.verificationStatus}
                          </span>
                          <div className="text-[10px] text-slate-400 mt-1">{req.verificationMethod}</div>
                        </td>
                        <td className="px-4 py-3 text-[11px]">
                          <div className="font-bold text-slate-700">Sub: {req.subscriptionStatus}</div>
                          <div className="text-slate-400 truncate max-w-[120px]">{req.assignedAdmin}</div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            <button
                              onClick={() => openDetailModal(req)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg"
                              title="Inspect Details & Screenshot"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedReq(req); setInternalNotes(req.adminNotes || ''); setShowFlagModal(true); }}
                              className={`p-1.5 rounded-lg ${req.isSuspicious ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                              title="Flag / Notes"
                            >
                              <Flag size={14} />
                            </button>
                            {req.status === 'pending' && !req.isTempOrder && (
                              <>
                                <button
                                  onClick={() => handleVerifyProvider(req)}
                                  disabled={actionLoading}
                                  className="px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-[11px]"
                                  title="Check Bank/UPI Provider API"
                                >
                                  Verify API
                                </button>
                                <button
                                  onClick={() => handleApprove(req)}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold text-[11px]"
                                >
                                  <Check size={13} /> Approve
                                </button>
                                <button
                                  onClick={() => { setSelectedReq(req); setShowRejectModal(true); }}
                                  disabled={actionLoading}
                                  className="flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg font-bold text-[11px]"
                                >
                                  <X size={13} /> Reject
                                </button>
                              </>
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
        </>
      )}

      {activeTab === 'reports' && reports && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Daily Confirmed Revenue</div><div className="text-3xl font-black text-emerald-700 mt-2">₹{reports.dailyRevenue}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Monthly Confirmed Revenue</div><div className="text-3xl font-black text-indigo-700 mt-2">₹{reports.monthlyRevenue}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Total Confirmed Revenue</div><div className="text-3xl font-black text-slate-900 mt-2">₹{reports.totalRevenue}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Confirmed / Pending / Rejected</div><div className="text-xl font-black text-slate-900 mt-2">{reports.confirmedPayments} / {reports.pendingPayments} / {reports.rejectedPayments}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Subscription Renewals</div><div className="text-2xl font-black text-slate-900 mt-2">{reports.renewalsCount}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200"><div className="text-xs font-bold text-slate-400">Expiring Within 7 Days</div><div className="text-2xl font-black text-amber-600 mt-2">{reports.expiringSoon}</div></div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 sm:col-span-2">
            <div className="text-xs font-bold text-slate-400 mb-2">Confirmed Verification Sources</div>
            <div className="flex flex-wrap gap-3 text-xs font-bold">
              {Object.entries(reports.byVerificationSource || {}).map(([k, v]) => (
                <span key={k} className="px-3 py-1.5 bg-slate-100 rounded-xl text-slate-800">{k}: {v}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 font-bold text-sm text-slate-800">Immutable Payment Audit Trail</div>
          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold mr-2">{log.action}</span>
                  <span className="font-semibold text-slate-800">Target: {log.targetId}</span>
                  {log.reason && <p className="text-slate-500 mt-1">Reason: {log.reason}</p>}
                </div>
                <div className="text-right text-slate-400">
                  <div>{log.adminEmail || log.userId || 'System'}</div>
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail & Private Screenshot Modal */}
      {detailReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-black text-slate-900 text-base">Payment Inspection · {detailReq.orderId}</h3>
              <button onClick={closeDetailModal} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
              <div><span className="text-slate-400">Student:</span> <strong>{detailReq.profiles?.name}</strong></div>
              <div><span className="text-slate-400">Email:</span> <strong>{detailReq.profiles?.email}</strong></div>
              <div><span className="text-slate-400">UTR:</span> <strong className="font-mono">{detailReq.transaction_id}</strong></div>
              <div><span className="text-slate-400">Payer:</span> <strong>{detailReq.payerName}</strong></div>
              <div><span className="text-slate-400">Amount:</span> <strong>₹{detailReq.amount}</strong></div>
              <div><span className="text-slate-400">Plan:</span> <strong>{detailReq.planName} ({detailReq.validityDays}d)</strong></div>
              <div><span className="text-slate-400">Ref:</span> <strong className="font-mono">{detailReq.payment_reference}</strong></div>
              <div><span className="text-slate-400">Status:</span> <strong>{detailReq.verificationStatus}</strong></div>
            </div>
            {detailReq.suspiciousReasons?.length > 0 && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-semibold">
                Suspicious Flags: {detailReq.suspiciousReasons.join('; ')}
              </div>
            )}
            {detailReq.hasScreenshot ? (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-600">Private Uploaded Payment Screenshot (Authenticated View Only):</div>
                {loadingShot ? (
                  <div className="p-8 text-center text-xs text-slate-400">Decrypting & loading private image...</div>
                ) : screenshotBlobUrl ? (
                  <img src={screenshotBlobUrl} alt="Payment proof" className="w-full max-h-80 object-contain rounded-xl border border-slate-200" />
                ) : (
                  <div className="p-4 text-xs text-rose-600">Failed to load private screenshot.</div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-400">No screenshot uploaded with this submission.</div>
            )}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">Reject Payment Request</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">Student: <strong>{selectedReq.profiles?.name || selectedReq.profiles?.email}</strong></p>
            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Rejection Reason *</label>
                <textarea rows={3} required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="w-1/2 py-2.5 bg-rose-600 text-white rounded-xl font-bold">Confirm Rejection</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Flag / Notes Modal */}
      {showFlagModal && selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base">{selectedReq.isSuspicious ? 'Update Notes / Unflag' : 'Flag Suspicious Payment'}</h3>
            <form onSubmit={handleFlagSubmit} className="space-y-4 text-xs font-semibold text-slate-700 mt-3">
              <div>
                <label className="block mb-1">Flag Reason</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="e.g. Altered screenshot or mismatched amount" value={flagReason} onChange={(e) => setFlagReason(e.target.value)} />
              </div>
              <div>
                <label className="block mb-1">Internal Admin Notes</label>
                <textarea rows={3} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={internalNotes} onChange={(e) => setInternalNotes(e.target.value)} />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowFlagModal(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="w-1/2 py-2.5 bg-slate-900 text-white rounded-xl font-bold">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100">
            <h3 className="font-bold text-slate-900 text-base mb-3">Record Manual / Offline Payment</h3>
            <form onSubmit={handleManualSubmit} className="space-y-3 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Student User ID (UUID) *</label>
                <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono" value={manualForm.userId} onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1">Amount (INR) *</label>
                  <input type="number" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={manualForm.amount} onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="block mb-1">Validity Days *</label>
                  <input type="number" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={manualForm.validityDays} onChange={(e) => setManualForm({ ...manualForm, validityDays: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="block mb-1">Transaction Reference / UTR</label>
                <input type="text" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={manualForm.transactionId} onChange={(e) => setManualForm({ ...manualForm, transactionId: e.target.value })} />
              </div>
              <div>
                <label className="block mb-1">Audit Reason *</label>
                <input type="text" required className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" value={manualForm.reason} onChange={(e) => setManualForm({ ...manualForm, reason: e.target.value })} />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowManualModal(false)} className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={actionLoading} className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold">Record &amp; Activate</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
