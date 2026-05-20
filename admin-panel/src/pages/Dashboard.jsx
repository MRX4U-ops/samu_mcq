import React, { useEffect, useState } from 'react';
import { 
  Users, ShieldCheck, CreditCard, 
  TrendingUp, Activity, UserPlus
} from 'lucide-react';
import StatCard from '../components/StatCard';
import axios from 'axios';
import useAuthStore from '../store/authStore';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const token = useAuthStore(state => state.token);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMCQs: 0,
    pendingPayments: 0,
    activeSubscriptions: 0,
    activeQuizRooms: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/admin/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (err) {
        console.error('Failed to fetch stats', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [token]);

  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'New Users',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        borderColor: '#6366F1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const barData = {
    labels: ['Bio', 'Anat', 'Physio', 'Biochem', 'Patho', 'Pharma'],
    datasets: [
      {
        label: 'MCQ Attempts',
        data: [1200, 1900, 1500, 800, 1100, 1300],
        backgroundColor: '#0F172A',
        borderRadius: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { grid: { display: false }, border: { display: false } },
      x: { grid: { display: false }, border: { display: false } },
    },
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">System Overview</h2>
          <p className="text-slate-500 font-medium mt-1">Real-time performance metrics</p>
        </div>
        <button className="btn-primary">
          <Activity size={18} />
          View Live Feed
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Users" 
          value={stats.totalUsers.toLocaleString()} 
          icon={Users} 
          trend={12} 
          color="bg-indigo-500" 
        />
        <StatCard 
          title="Active Subs" 
          value={stats.activeSubscriptions.toLocaleString()} 
          icon={ShieldCheck} 
          trend={8} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Pending Payments" 
          value={stats.pendingPayments} 
          icon={CreditCard} 
          color="bg-rose-500" 
        />
        <StatCard 
          title="Avg. Engagement" 
          value="84%" 
          icon={TrendingUp} 
          trend={5} 
          color="bg-amber-500" 
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">User Growth</h3>
            <select className="bg-slate-100 border-none rounded-xl text-xs font-bold p-2 focus:ring-0">
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          <div className="h-80">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        <div className="glass-card p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Content Popularity</h3>
            <div className="flex gap-2">
               <span className="w-3 h-3 bg-slate-900 rounded-full"></span>
               <span className="text-xs font-bold text-slate-400 uppercase">Attempts</span>
            </div>
          </div>
          <div className="h-80">
            <Bar data={barData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
