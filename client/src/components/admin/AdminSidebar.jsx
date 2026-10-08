import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  CalendarDays,
  Users,
  Image,
  Sliders,
  BarChart3,
  Activity,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

import { MelodiumLogo } from '../common/MelodiumLogo';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: "Today's Schedule", path: '/admin/today-schedule', icon: Clock },
    { name: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Calendar View', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Students & Users', path: '/admin/users', icon: Users },
    { name: 'Gallery CMS', path: '/admin/gallery', icon: Image },
    { name: 'Jam Room Settings', path: '/admin/settings', icon: Sliders },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Activity Logs', path: '/admin/logs', icon: Activity },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 bg-dark-900 border-r border-white/5 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand */}
        <div>
          <div className="h-20 px-6 flex items-center justify-between border-b border-white/5">
            <Link to="/admin" className="flex items-center gap-3 group">
              <MelodiumLogo className="w-10 h-10 group-hover:scale-105 transition-transform" showGlow={true} />
              <div>
                <span className="font-display font-black text-base tracking-wider text-white group-hover:text-amber-300 transition-colors">
                  MELODIUM
                </span>
                <span className="block text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </Link>
          </div>

          {/* Nav List */}
          <div className="p-4 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
              Jam Room & Studio Controls
            </div>

            {links.map((link) => {
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.exact}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-white font-bold border border-amber-500/30 shadow-glow-yellow'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <link.icon className="w-4 h-4 text-amber-400" />
                    <span>{link.name}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                </NavLink>
              );
            })}
          </div>
        </div>

        {/* Bottom Switch to Public Site */}
        <div className="p-4 border-t border-white/5">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Switch to Public Website</span>
          </Link>
        </div>
      </aside>
    </>
  );
};
