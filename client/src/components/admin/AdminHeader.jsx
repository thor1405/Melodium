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
    <header className="sticky top-0 z-30 min-h-[3.75rem] sm:h-20 bg-dark-900/90 backdrop-blur-xl border-b border-white/10 px-3.5 sm:px-8 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2.5 sm:gap-4 min-w-0 flex-1">
        <button
          onClick={onToggleSidebar}
          className="p-2 sm:p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white lg:hidden border border-white/10 shrink-0 transition-colors cursor-pointer"
          aria-label="Toggle Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="text-sm sm:text-base lg:text-lg font-bold font-display text-white truncate leading-tight">
            {title}
          </h1>
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 mt-0.5 truncate">
            <span className="hidden sm:inline">Melodium Jam Room •</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1 shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              Live System
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Clock IST */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 font-mono">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{timeStr || 'Loading...'} IST</span>
        </div>

        {/* Admin Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold shadow-sm">
          <Shield className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-[11px] font-extrabold uppercase tracking-wider">Admin</span>
        </div>
      </div>
    </header>
  );
};
