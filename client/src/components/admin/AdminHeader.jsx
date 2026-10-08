import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Shield, Radio, Clock, User } from 'lucide-react';
import { format } from 'date-fns';

export const AdminHeader = ({ onToggleSidebar, title = 'Dashboard Overview' }) => {
  const { user } = useAuth();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(format(now, 'hh:mm:ss a'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-20 bg-dark-900/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          onClick={onToggleSidebar}
          className="p-2.5 rounded-xl bg-white/5 text-slate-300 hover:text-white lg:hidden border border-white/5"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold font-display text-white">{title}</h1>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Melodium Jam Room Studio 1</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Live System
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Clock IST */}
        <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-brand-gold" />
          <span>{timeStr || 'Loading...'} IST</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-950/40 border border-purple-500/20 text-xs">
          <Shield className="w-3.5 h-3.5 text-brand-purple" />
          <span className="font-semibold text-purple-200 hidden sm:inline">{user?.name}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 uppercase">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
};
