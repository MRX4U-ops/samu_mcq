import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  ShieldCheck, MessageSquare, BookOpen, 
  Edit3, UploadCloud, UsersRound, Settings, 
  LogOut, Sparkles
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);
  const admin = useAuthStore(state => state.admin);
  const isSuper = admin?.isSuperAdmin || admin?.email?.toLowerCase() === 'mohd6396889713@gmail.com';

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'User Management', path: '/users', icon: Users },
    { name: 'Subscriptions', path: '/subscriptions', icon: ShieldCheck },
    { name: 'Payment Requests', path: '/payments', icon: CreditCard },
    { name: 'Academic Hierarchy', path: '/academic', icon: BookOpen },
    { name: 'Live MCQ Editor', path: '/mcq-editor', icon: Edit3 },
    { name: 'Bulk Import', path: '/bulk-import', icon: UploadCloud },
    { name: 'Help Desk', path: '/support', icon: MessageSquare },
    ...(isSuper ? [{ name: 'Sub-Admins', path: '/sub-admins', icon: UsersRound }] : []),
    { name: 'App Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside className="w-72 h-screen bg-slate-950 text-white flex flex-col fixed left-0 top-0 z-50 border-r border-white/5">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-tr from-indigo-600 to-sky-400 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">
            S
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-black tracking-tight text-white">SAMU MCQs</h1>
              <span className="px-1.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded">PRO</span>
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
              {isSuper ? 'Super Admin Portal' : 'Admin Control'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `
              flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all group
              ${isActive 
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' 
                : 'text-slate-400 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={19} className="group-hover:scale-110 transition-transform shrink-0" />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Super Admin Badge & Logout Footer */}
      <div className="p-4 border-t border-white/5 bg-slate-950/60">
        <div className="mb-3 px-3 py-2 bg-white/5 rounded-xl border border-white/5 flex items-center justify-between">
          <div className="overflow-hidden pr-2">
            <p className="text-xs font-bold text-white truncate">{admin?.name || 'Sameer Ahmad'}</p>
            <p className="text-[10px] text-indigo-400 font-semibold truncate">{admin?.email || 'mohd6396889713@gmail.com'}</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse shrink-0" />
        </div>

        <button 
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-xl text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 text-sm font-bold transition-all group"
        >
          <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
          <span>Exit / Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
