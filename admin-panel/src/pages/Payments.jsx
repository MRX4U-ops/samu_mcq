import React, { useState, useEffect } from 'react';
import { 
  Check, X, CreditCard, Search, 
  ExternalLink, Clock, AlertCircle, RefreshCw,
  Download, Loader2, Plus, ShieldCheck, IndianRupee
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const Payments = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected
  const [notification, setNotification] = useState(null);

  // Reject Modal
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);
  const [rejectReason, setRejectReason] = useState('Transaction ID not found in bank statement');

  // Manual Payment Modal
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({ userId: '', amount: 49, transactionId: '', validityDays: 90 });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/payment-requests');
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Approve Payment
  const handleApprove = async (req) => {
    if (!window.confirm(`Approve transaction ${req.transaction_id || req.payment_reference} for ${req.profiles?.name || req.profiles?.email}? This will activate 90-day premium access.`)) {
      return;
    }
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/payment-approve/${req.id}`, { validityDays: 90 });
      setRequests(requests.map(r => r.id === req.id ? { ...r, status: 'approved' } : r));
      showToast('Payment verified and 90-day subscription activated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to approve payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Payment
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;
    setActionLoading(true);
    try {
      await axiosInstance.post(`/admin/payment-reject/${selectedReq.id}`, { reason: rejectReason });
      setRequests(requests.map(r => r.id === selectedReq.id ? { ...r, status: 'rejected', rejection_reason: rejectReason } : r));
      setShowRejectModal(false);
      showToast('Payment marked as rejected.');
    } catch (err) {
      showToast('Failed to reject payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Manual Payment Submit
  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await axiosInstance.post('/admin/payments/manual', manualForm);
      setShowManualModal(false);
      fetchPayments();
      showToast('Offline payment recorded and subscription activated!');
    } catch (err) {
      showToast(err.response?.data?.error || 'Failed to record manual payment', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['Student Name', 'Email', 'Transaction ID', 'Reference', 'Amount (INR)', 'Status', 'Date'];
    const rows = requests.map(r => [
      `"${r.profiles?.name || ''}"`,
      `"${r.profiles?.email || ''}"`,
      `"${r.transaction_id || ''}"`,
      `"${r.payment_reference || ''}"`,
      r.amount || 49,
      r.status,
      new Date(r.created_at).toLocaleDateString()
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `samu_payments_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = requests.filter(r => {
    const matchesSearch = 
      (r.transaction_id || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.payment_reference || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === 'all' ? true : r.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const pendingCount = requests.filter(r => r.status === 'pending').length;

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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Payment Verification</h2>
          <p className="text-slate-500 text-sm mt-0.5">UPI ID: <strong className="text-indigo-600 font-bold">mrx4u@ybl</strong> • Standard Plan ₹49 / 90 Days</p>
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
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
          >
            <Plus size={15} />
            <span>Record Manual Payment</span>
          </button>
          <button 
            onClick={fetchPayments}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search transaction ID, reference, or student email..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'pending', 'approved', 'rejected'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all relative ${
                statusFilter === tab 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab}
              {tab === 'pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px]">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400 flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-indigo-600 mb-3" size={28} />
            <p className="text-sm font-bold">Querying payment records...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-bold">No payment requests found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Transaction / Ref</th>
                  <th className="px-6 py-4">Amount</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Student */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{req.profiles?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-400 font-medium">{req.profiles?.email}</p>
                      </div>
                    </td>

                    {/* Txn / Ref */}
                    <td className="px-6 py-4 font-mono text-[11px]">
                      <div>
                        <span className="font-bold text-slate-800">{req.transaction_id || '—'}</span>
                        {req.payment_reference && (
                          <p className="text-[10px] text-slate-400 mt-0.5">Ref: {req.payment_reference}</p>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-bold text-slate-900">
                      ₹{req.amount || 49}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        req.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-500 font-medium text-[11px]">
                      {new Date(req.created_at).toLocaleString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 text-right">
                      {req.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req)}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                          >
                            <Check size={14} />
                            <span>Approve & Unlock</span>
                          </button>
                          <button
                            onClick={() => { setSelectedReq(req); setShowRejectModal(true); }}
                            disabled={actionLoading}
                            className="flex items-center gap-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            <X size={14} />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] font-semibold text-slate-400">
                          {req.status === 'approved' ? '✓ Verified by Admin' : '✕ Rejected'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedReq && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Reject Payment Request</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Student: <strong>{selectedReq.profiles?.name || selectedReq.profiles?.email}</strong>
            </p>

            <form onSubmit={handleRejectSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Reason for Rejection *</label>
                <textarea
                  rows={3}
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowRejectModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-rose-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Confirm Rejection</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Manual Payment Modal */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Record Offline / Direct Payment</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Enter user ID or email to directly record verified payment and grant access.
            </p>

            <form onSubmit={handleManualSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">User ID (from User Management) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 4ed91f4c-..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={manualForm.userId}
                  onChange={(e) => setManualForm({ ...manualForm, userId: e.target.value })}
                />
              </div>

              <div>
                <label className="block mb-1">Amount (INR)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={manualForm.amount}
                  onChange={(e) => setManualForm({ ...manualForm, amount: Number(e.target.value) })}
                />
              </div>

              <div>
                <label className="block mb-1">Transaction ID / Receipt # (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. CASH_OFFLINE_01"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  value={manualForm.transactionId}
                  onChange={(e) => setManualForm({ ...manualForm, transactionId: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Record & Activate</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
