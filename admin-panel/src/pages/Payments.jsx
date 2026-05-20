import React, { useState, useEffect } from 'react';
import { 
  Check, X, CreditCard, Search, 
  ExternalLink, Clock, AlertCircle
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Payments = () => {
  const token = useAuthStore(state => state.token);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, [token]);

  const fetchPayments = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/payment-requests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(response.data);
    } catch (err) {
      console.error('Error fetching payments', err);
      // Mock for demo
      setRequests([
        { id: 1, user: 'John Doe', amount: 49.00, transaction_id: 'TXN123456789', status: 'pending', created_at: '2024-03-20T10:30:00Z' },
        { id: 2, user: 'Jane Smith', amount: 49.00, transaction_id: 'TXN987654321', status: 'pending', created_at: '2024-03-20T11:15:00Z' },
        { id: 3, user: 'Bob Johnson', amount: 49.00, transaction_id: 'TXN456123789', status: 'approved', created_at: '2024-03-19T09:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleStatus = async (id, status) => {
    try {
      await axios.post(`http://localhost:5000/api/admin/payment-${status}/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRequests(requests.map(r => r.id === id ? { ...r, status: status === 'approve' ? 'approved' : 'rejected' } : r));
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Payment Verification</h2>
          <p className="text-slate-500 font-medium mt-1">Process manual UPI transaction requests</p>
        </div>
        <div className="flex gap-4">
           <div className="glass-card px-6 py-2 flex items-center gap-3">
              <Clock size={16} className="text-amber-500" />
              <span className="text-sm font-bold text-slate-600">
                {requests.filter(r => r.status === 'pending').length} Pending Requests
              </span>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {requests.map((request) => (
          <div key={request.id} className={`glass-card p-6 flex items-center justify-between transition-all ${
            request.status === 'pending' ? 'border-l-4 border-l-amber-500' : ''
          }`}>
            <div className="flex items-center gap-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                request.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
              }`}>
                <CreditCard size={28} />
              </div>
              
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-lg font-black text-slate-900">{request.user}</h4>
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md ${
                    request.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
                    request.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                  }`}>
                    {request.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    TXN: <span className="text-slate-600 select-all">{request.transaction_id}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    Amount: <span className="text-slate-900">₹{request.amount}</span>
                  </p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-tighter">
                    Date: <span className="text-slate-600">{new Date(request.created_at).toLocaleString()}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {request.status === 'pending' ? (
                <>
                  <button 
                    onClick={() => handleStatus(request.id, 'approve')}
                    className="btn-success"
                  >
                    <Check size={18} />
                    Approve
                  </button>
                  <button 
                    onClick={() => handleStatus(request.id, 'reject')}
                    className="btn-danger"
                  >
                    <X size={18} />
                    Reject
                  </button>
                </>
              ) : (
                <div className="text-sm font-bold text-slate-400 flex items-center gap-2">
                   Verified
                   <Check size={16} className="text-emerald-500" />
                </div>
              )}
            </div>
          </div>
        ))}
        
        {requests.length === 0 && (
          <div className="glass-card p-20 flex flex-col items-center justify-center text-slate-400">
             <AlertCircle size={48} className="mb-4 opacity-20" />
             <p className="font-bold text-lg">No payment requests found</p>
             <p className="text-sm">All transactions have been processed.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Payments;
