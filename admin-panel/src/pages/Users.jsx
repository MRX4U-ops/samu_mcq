import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, MoreVertical, 
  ShieldCheck, Ban, Trash2, UserPlus,
  Mail, Phone, Calendar
} from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Users = () => {
  const token = useAuthStore(state => state.token);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const fetchUsers = async () => {
    try {
      // Note: We'll need to ensure the backend has this endpoint
      const response = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (err) {
      console.error('Error fetching users', err);
      // Fallback for demo
      setUsers([
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active', sub: 'Premium', joined: '2024-03-10' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'blocked', sub: 'Free', joined: '2024-03-12' },
        { id: 3, name: 'Mike Ross', email: 'mike@example.com', status: 'active', sub: 'Premium', joined: '2024-03-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (userId, action) => {
    // Implement API calls for actions
    console.log(`User ${userId} - ${action}`);
    // Optimistic update
    if (action === 'block') {
      setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'blocked' : 'active' } : u));
    }
  };

  return (
    <div className="p-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">User Management</h2>
          <p className="text-slate-500 font-medium mt-1">Manage system accounts and access</p>
        </div>
        <button className="btn-primary">
          <UserPlus size={18} />
          Create New User
        </button>
      </div>

      <div className="glass-card overflow-hidden">
        {/* Table Header / Toolbar */}
        <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
          <div className="relative w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <button className="btn-secondary py-2 px-4 text-sm">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-50">
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">User Details</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Subscription</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-bold text-slate-600">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{user.name}</p>
                        <p className="text-xs font-medium text-slate-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.status === 'active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-600">
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={16} className={user.sub === 'Premium' ? 'text-indigo-500' : 'text-slate-300'} />
                      {user.sub}
                    </div>
                  </td>
                  <td className="p-6 text-sm font-bold text-slate-400">
                    {user.joined}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => handleAction(user.id, 'activate')}
                        className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-all"
                        title="Activate Premium"
                      >
                        <ShieldCheck size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(user.id, 'block')}
                        className={`p-2 rounded-lg transition-all ${user.status === 'active' ? 'text-amber-500 hover:bg-amber-50' : 'text-slate-400 hover:bg-slate-100'}`}
                        title={user.status === 'active' ? 'Block User' : 'Unblock User'}
                      >
                        <Ban size={18} />
                      </button>
                      <button 
                        onClick={() => handleAction(user.id, 'delete')}
                        className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
