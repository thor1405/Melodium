import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
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
  Headphones,
  Star,
  LogOut,
} from 'lucide-react';

import { MelodiumLogo } from '../common/MelodiumLogo';

export const AdminSidebar = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (onClose) onClose();
    toast.success('Admin signed out successfully.');
    await logout({ showLoading: true });
    navigate('/');
  };

  const links = [
    { name: 'Overview', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: "Today's Schedule", path: '/admin/today-schedule', icon: Clock },
    { name: 'All Bookings', path: '/admin/bookings', icon: CalendarCheck },
    { name: 'Calendar View', path: '/admin/calendar', icon: CalendarDays },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { name: 'Sound Engineer CMS', path: '/admin/team', icon: Headphones },
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
        className={`fixed top-0 left-0 bottom-0 z-50 w-64 h-screen max-h-screen bg-dark-900 border-r border-white/5 flex flex-col transition-transform duration-300 lg:translate-x-0 overflow-hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Brand Header (Fixed) */}
        <div className="h-16 shrink-0 px-5 flex items-center justify-between border-b border-white/5 bg-dark-900">
          <Link to="/admin" className="flex items-center gap-3 group">
            <MelodiumLogo className="w-8 h-8 group-hover:scale-105 transition-transform" showGlow={true} />
            <div>
              <span className="font-display font-black text-sm tracking-wider text-white group-hover:text-amber-300 transition-colors">
                MELODIUM
              </span>
              <span className="block text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
          </Link>
        </div>

        {/* Scrollable Navigation List (Flex-1) */}
        <div className="flex-1 overflow-y-auto p-3.5 space-y-1 min-h-0 custom-scrollbar overscroll-contain">
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
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/20 text-white font-bold border border-amber-500/30 shadow-glow-yellow'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <div className="flex items-center gap-2.5">
                  <link.icon className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">{link.name}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-40 shrink-0" />
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions: Public Site & Logout (Fixed at Bottom with Proper Margins) */}
        <div className="shrink-0 p-3.5 border-t border-white/5 space-y-2 bg-dark-900/95 backdrop-blur-md">
          <Link
            to="/"
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all border border-white/5 cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Switch to Public Website</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default AdminSidebar;
