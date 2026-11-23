import React from 'react';
import { Search, Bell, Shield, CheckCircle, ExternalLink } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Topbar = () => {
  const admin = useAuthStore(state => state.admin);
  const isSuper = admin?.isSuperAdmin || admin?.email?.toLowerCase() === 'mohd6396889713@gmail.com';

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-40 px-8 flex items-center justify-between shadow-xs">
      <div className="flex items-center gap-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
          Production DB Live
        </span>
        <span className="text-xs text-slate-400 font-medium hidden md:inline">
          Supabase PostgreSQL • Dual Auth Connected
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a 
          href="https://mrx4u-ops.github.io/samu_mcq/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
        >
          <span>Open Student Portal</span>
          <ExternalLink size={13} />
        </a>

        <div className="h-5 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 pl-1">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-900 leading-tight">{admin?.name || 'Sameer Ahmad'}</p>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
              {isSuper ? '★ Super Admin' : 'Admin'}
            </p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-tr from-slate-900 to-indigo-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {admin?.name?.charAt(0) || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
