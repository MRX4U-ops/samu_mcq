import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, 
  BarChart3, LogOut, ShieldCheck,
  Settings, Bell, MessageSquare, GraduationCap
} from 'lucide-react';
import useAuthStore from '../store/authStore';

const Sidebar = () => {
  const logout = useAuthStore(state => state.logout);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Users', path: '/users', icon: Users },
    { name: 'Subscriptions', path: '/subscriptions', icon: ShieldCheck },
    { name: 'Payments', path: '/payments', icon: CreditCard },
    { name: 'Results', path: '/results', icon: GraduationCap },
    { name: 'Support', path: '/support', icon: MessageSquare },
    { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  ];

  return (
    <div className="w-72 h-screen bg-slate-950 text-white flex flex-col fixed left-0 top-0 z-50">
      {/* Logo Section */}
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center font-black text-xl">S</div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">SAMU MCQs</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Admin Control</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-4 px-4 py-4 rounded-2xl transition-all group
              ${isActive 
                ? 'bg-white/10 text-white' 
                : 'text-slate-500 hover:text-white hover:bg-white/5'}
            `}
          >
            <item.icon size={22} className="group-hover:scale-110 transition-transform" />
            <span className="font-semibold">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/5">
        <button 
          onClick={logout}
          className="flex items-center gap-4 w-full px-4 py-4 rounded-2xl text-rose-400 hover:bg-rose-500/10 transition-all group"
        >
          <LogOut size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-bold">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
