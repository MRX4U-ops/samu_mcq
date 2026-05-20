import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Clock, AlertCircle, CheckCircle, Search, Filter } from 'lucide-react';
import axiosInstance from '../services/axiosInstance';

const SupportTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/support/admin/all');
      setTickets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching support tickets:', err);
      setError('Could not connect to the support server.');
      // Fallback
      setTickets([
        { id: '1', title: 'Payment not reflecting', category: 'Payment Issue', status: 'PENDING', priority: 'High', profiles: { name: 'Jasur Toshmatov' }, created_at: '2024-04-21T12:00:00Z' },
        { id: '2', title: 'MCQ #45 has wrong answer', category: 'MCQ Error', status: 'IN_PROGRESS', priority: 'Medium', profiles: { name: 'Sarah' }, created_at: '2024-04-20T12:00:00Z' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Support Help Desk</h2>
          <p className="text-sm text-gray-500 mt-1">Manage student issues and technical support tickets</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input type="text" placeholder="Search tickets..." className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg w-64" />
            </div>
            <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-100">
              <Filter size={14} />
              <span>Filter Status</span>
            </button>
          </div>
          {error && <span className="text-xs text-rose-500 font-bold">{error}</span>}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading support tickets...</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-sm font-bold text-gray-600">User</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Category</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Title</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Priority</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
                <th className="px-6 py-4 text-sm font-bold text-gray-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-800">{ticket.profiles?.name || 'Unknown User'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{ticket.category}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-indigo-600">{ticket.title}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${ticket.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2 h-2 rounded-full ${ticket.status === 'PENDING' ? 'bg-orange-500' : ticket.status === 'RESOLVED' ? 'bg-emerald-500' : 'bg-blue-500'}`} />
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">{ticket.status}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => navigate(`/support/${ticket.id}`)}
                      className="text-xs font-bold text-indigo-600 hover:underline flex items-center"
                    >
                      <MessageSquare size={14} className="mr-1" /> View Thread
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SupportTickets;
