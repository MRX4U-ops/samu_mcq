import React from 'react';
import { Search, Bell, User as UserIcon, Settings } from 'lucide-react';
import useAuthStore from '../store/authStore';

const Topbar = () => {
  const admin = useAuthStore(state => state.admin);

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Search Bar */}
      <div className="relative w-96">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input 
          type="text" 
          placeholder="Search for users, payments..." 
          className="w-full pl-12 pr-4 py-2.5 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-slate-900 transition-all text-sm font-medium"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6">
        <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden md:block">
            <p className="text-sm font-bold text-slate-900">{admin?.name || 'Admin'}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-tighter">Super Admin</p>
          </div>
          <div className="w-10 h-10 bg-slate-900 rounded-2xl flex items-center justify-center text-white font-bold">
            <UserIcon size={20} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
