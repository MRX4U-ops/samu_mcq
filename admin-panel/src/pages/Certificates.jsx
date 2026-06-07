import React, { useEffect, useState } from 'react';
import { Award, ShieldAlert, CheckCircle, Search, ExternalLink, RefreshCw } from 'lucide-react';
import axios from 'axios';
import useAuthStore from '../store/authStore';

const Certificates = () => {
  const token = useAuthStore(state => state.token);
  const [certs, setCerts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${apiBaseUrl}/admin/certificates`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCerts(response.data);
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [token]);

  const handleRevoke = async (certificateId) => {
    if (!window.confirm(`Are you sure you want to revoke certificate ${certificateId}?`)) {
      return;
    }
    
    setActionLoading(certificateId);
    try {
      await axios.post(`${apiBaseUrl}/admin/certificates/revoke`, 
        { certificateId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state
      setCerts(prev => prev.map(c => 
        c.certificate_id === certificateId ? { ...c, revoked: true } : c
      ));
    } catch (err) {
      console.error('Failed to revoke certificate:', err);
      alert(err.response?.data?.error || 'Failed to revoke certificate.');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredCerts = certs.filter(c => 
    c.certificate_id.toLowerCase().includes(search.toLowerCase()) ||
    c.student_name.toLowerCase().includes(search.toLowerCase()) ||
    c.subject_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Academic Certificates</h2>
          <p className="text-slate-500 font-medium mt-1">Manage and verify student certificates of excellence</p>
        </div>
        <button 
          onClick={fetchCertificates}
          className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-bold transition-all"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          Refresh
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass-card p-4 flex gap-4 items-center">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by ID, student name, or subject..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-slate-700 font-semibold placeholder-slate-400"
        />
      </div>

      {/* Certificates Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 font-bold flex flex-col items-center justify-center gap-3">
            <RefreshCw className="animate-spin" size={24} />
            Loading certificate records...
          </div>
        ) : filteredCerts.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-bold">
            No certificates found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-widest">
                  <th className="p-6">Certificate ID</th>
                  <th className="p-6">Student Name</th>
                  <th className="p-6">Subject</th>
                  <th className="p-6">Score</th>
                  <th className="p-6">Distinction</th>
                  <th className="p-6">Status</th>
                  <th className="p-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCerts.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-all font-semibold text-slate-600">
                    <td className="p-6 font-mono text-sm text-slate-900">{c.certificate_id}</td>
                    <td className="p-6 text-slate-900">{c.student_name}</td>
                    <td className="p-6">{c.subject_name}</td>
                    <td className="p-6 text-emerald-600 font-bold">{Number(c.score).toFixed(1)}%</td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                        c.achievement_level === 'Platinum Scholar' ? 'bg-amber-100 text-amber-800' :
                        c.achievement_level === 'Gold Excellence' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {c.achievement_level}
                      </span>
                    </td>
                    <td className="p-6">
                      {c.revoked ? (
                        <span className="flex items-center gap-1.5 text-xs text-rose-500 font-black">
                          <ShieldAlert size={14} />
                          REVOKED
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-black">
                          <CheckCircle size={14} />
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td className="p-6 text-right space-x-3">
                      <a 
                        href={`https://mrx4u-ops.github.io/samu_mcq/#/verify/${c.certificate_id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
                      >
                        <ExternalLink size={12} />
                        Verify
                      </a>
                      
                      {!c.revoked && (
                        <button
                          onClick={() => handleRevoke(c.certificate_id)}
                          disabled={actionLoading !== null}
                          className="text-xs bg-rose-50 hover:bg-rose-100 text-rose-600 px-3 py-1.5 rounded-lg transition-all"
                        >
                          {actionLoading === c.certificate_id ? 'Revoking...' : 'Revoke'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Certificates;
