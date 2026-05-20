import React from 'react';
import { ShieldCheck, Search, Calendar, UserCheck } from 'lucide-react';

const Subscriptions = () => {
  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Subscriptions</h2>
        <p className="text-slate-500 font-medium mt-1">Monitor and manage premium user access</p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-500 mb-6">
            <ShieldCheck size={40} />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Subscription Insights Coming Soon</h3>
          <p className="text-slate-500 mt-2 max-w-sm">
            We are working on a dedicated management interface for subscription tiers and automated billing cycles.
          </p>
          <button className="btn-secondary mt-8">
             <Calendar size={18} />
             View Renewal Calendar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;
