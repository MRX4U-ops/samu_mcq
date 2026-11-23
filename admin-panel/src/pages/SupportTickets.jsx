import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Clock, AlertCircle, CheckCircle, 
  Search, Filter, RefreshCw, Loader2, ChevronRight, Edit3
} from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const SupportTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Selected ticket for modal
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [ticketStatus, setTicketStatus] = useState('IN_PROGRESS');
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/admin/support');
      if (Array.isArray(res.data)) {
        setTickets(res.data);
      }
    } catch (err) {
      console.error('Error fetching support tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setActionLoading(true);
    try {
      await axiosInstance.put(`/admin/support/${selectedTicket.id}`, {
        status: ticketStatus,
        adminNotes
      });
      setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: ticketStatus, admin_notes: adminNotes } : t));
      setSelectedTicket(null);
      showToast('Support ticket updated successfully!');
    } catch (err) {
      showToast('Failed to update ticket', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = tickets.filter(t => {
    const matchesSearch = 
      (t.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.profiles?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.profiles?.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Student Help Desk & Support</h2>
          <p className="text-slate-500 text-sm mt-0.5">Track, respond to, and resolve student inquiries and bug tickets</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchTickets}
            className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 shadow-xs"
            title="Refresh"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={17} />
          <input
            type="text"
            placeholder="Search tickets, issue description, or student..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          {['all', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                statusFilter === tab 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <Loader2 className="animate-spin text-indigo-600 mx-auto mb-3" size={28} />
            <p className="text-sm font-bold">Loading support tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <p className="text-sm font-bold">No support tickets found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-black text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Ticket Issue</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-bold text-slate-900">{ticket.profiles?.name || 'Student'}</p>
                        <p className="text-[11px] text-slate-400">{ticket.profiles?.email}</p>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {ticket.category || 'General'}
                      </span>
                    </td>

                    <td className="px-6 py-4 max-w-md">
                      <p className="font-bold text-slate-900 truncate">{ticket.title}</p>
                      <p className="text-[11px] text-slate-500 truncate">{ticket.description}</p>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ticket.priority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {ticket.priority || 'Normal'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase ${
                        ticket.status === 'RESOLVED' ? 'bg-emerald-100 text-emerald-800' :
                        ticket.status === 'IN_PROGRESS' ? 'bg-indigo-100 text-indigo-800' :
                        ticket.status === 'CLOSED' ? 'bg-slate-100 text-slate-700' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ticket.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedTicket(ticket);
                          setTicketStatus(ticket.status || 'IN_PROGRESS');
                          setAdminNotes(ticket.admin_notes || '');
                        }}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                      >
                        Respond
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-slate-900 text-base">Respond to Ticket</h3>
            <p className="text-xs text-slate-500 mt-1">From: {selectedTicket.profiles?.name} ({selectedTicket.profiles?.email})</p>

            <div className="my-4 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
              <p className="font-bold text-slate-900 mb-1">{selectedTicket.title}</p>
              <p className="text-slate-600">{selectedTicket.description}</p>
            </div>

            <form onSubmit={handleUpdateTicket} className="space-y-4 text-xs font-semibold text-slate-700">
              <div>
                <label className="block mb-1">Update Status</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                  value={ticketStatus}
                  onChange={(e) => setTicketStatus(e.target.value)}
                >
                  <option value="PENDING">PENDING</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="RESOLVED">RESOLVED</option>
                  <option value="CLOSED">CLOSED</option>
                </select>
              </div>

              <div>
                <label className="block mb-1">Admin Response / Internal Notes</label>
                <textarea
                  rows={4}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-normal"
                  placeholder="Enter response sent to student or resolution notes..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedTicket(null)}
                  className="w-1/2 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-1/2 py-2.5 bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center"
                >
                  {actionLoading ? <Loader2 size={14} className="animate-spin" /> : <span>Save Update</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportTickets;
