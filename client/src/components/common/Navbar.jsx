import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { cmsService } from '../../services/cmsService';
import { MelodiumLogo } from './MelodiumLogo';
import {
  Music2,
  Calendar,
  Sparkles,
  Menu,
  X,
  User,
  LogOut,
  Shield,
  Bell,
  CheckCircle,
  Radio,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileNotifOpen, setIsMobileNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hoveredPath, setHoveredPath] = useState(null);

  const notifRef = useRef(null);
  const userRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsNotifOpen(false);
    setIsMobileNotifOpen(false);
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch notifications
  const fetchNotifs = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await cmsService.getNotifications();
      if (res.success) {
        setNotifications(res.data || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const handleMarkAllRead = async () => {
    try {
      await cmsService.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  const handleNavClick = () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  const handleBookJamRoomClick = (e) => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    if (location.pathname === '/jam-room') {
      e.preventDefault();
      const el = document.getElementById('booking-calendar');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleLogout = async () => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    toast.success('You have been logged out successfully. See you next session! 🎸');
    await logout({ showLoading: true });
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'Reviews', path: '/reviews' },
    { name: 'Sound Engineer', path: '/sound-engineer' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={handleNavClick}
          className="flex items-center gap-2.5 sm:gap-3 group shrink-0 min-w-0"
        >
          <div className="relative group-hover:scale-105 transition-transform shrink-0">
            <MelodiumLogo className="w-8 h-8 sm:w-11 sm:h-11" showGlow={true} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-display font-black text-base sm:text-xl tracking-wider text-white group-hover:text-amber-300 transition-colors">
                MELODIUM
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                SJEC
              </span>
            </div>
            <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-[125px] xs:max-w-[160px] sm:max-w-none">
              St. Joseph Engineering College
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav
          onMouseLeave={() => setHoveredPath(null)}
          className="hidden md:flex items-center gap-1 lg:gap-1.5 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 shadow-lg backdrop-blur-md relative"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const isHovered = hoveredPath === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                onMouseEnter={() => setHoveredPath(link.path)}
                className={`relative px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all select-none ${
                  isActive
                    ? 'text-amber-300'
                    : isHovered
                    ? 'text-white'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {/* Magnetic Sliding Hover Pill */}
                {isHovered && !isActive && (
                  <motion.div
                    layoutId="navbar-hover-glider"
                    className="absolute inset-0 rounded-xl bg-white/[0.08] border border-white/15 shadow-sm"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                  />
                )}

                {/* Active Page Indicator */}
                {isActive && (
                  <motion.div
                    layoutId="navbar-active-indicator"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/50 shadow-inner shadow-amber-500/10"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}

                <motion.span
                  className="relative z-10 block"
                  whileHover={{ y: -1, scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {link.name}
                </motion.span>
              </Link>
            );
          })}

          {/* Jam Room Booking Direct CTA Button */}
          <motion.div
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Link
              to="/jam-room#booking-calendar"
              onClick={handleBookJamRoomClick}
              className="ml-1.5 flex items-center gap-2 px-4 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-black text-xs shadow-glow-yellow transition-all shimmer-btn cursor-pointer"
            >
              <Radio className="w-3.5 h-3.5 animate-pulse text-dark-950" />
              <span>Book Jam Room</span>
            </Link>
          </motion.div>
        </nav>

        {/* Right Action Icons & User Dropdown (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={() => setIsNotifOpen(!isNotifOpen)}
                  className="relative p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/5 transition-all"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-dark-950 text-[10px] font-bold flex items-center justify-center border-2 border-dark-950 shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                <AnimatePresence>
                  {isNotifOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-80 sm:w-96 glass-panel-elevated rounded-2xl p-4 shadow-2xl z-50 border border-amber-500/20"
                    >
                      <div className="flex items-center justify-between pb-3 border-b border-white/10">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-sm text-white">Notifications</h4>
                          {unreadCount > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                              {unreadCount} new
                            </span>
                          )}
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-amber-400 hover:underline"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto mt-2 space-y-2 pr-1">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.slice(0, 6).map((n) => (
                            <div
                              key={n._id}
                              className={`p-3 rounded-xl border text-xs transition-colors ${
                                n.isRead
                                  ? 'bg-white/5 border-white/5 text-slate-300'
                                  : 'bg-amber-950/30 border-amber-500/30 text-white'
                              }`}
                            >
                              <div className="font-semibold text-amber-400 mb-1">{n.title}</div>
                              <p className="text-slate-300 leading-relaxed">{n.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* User Avatar & Dropdown */}
              <div className="relative" ref={userRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shadow-sm">
                    <div className="w-full h-full bg-dark-900 rounded-[6px] overflow-hidden flex items-center justify-center">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                  </div>
                  <div className="hidden lg:block leading-tight">
                    <div className="text-xs font-semibold text-white max-w-[110px] truncate">
                      {user.name}
                    </div>
                    <div className="text-[10px] text-slate-400 uppercase font-medium tracking-wider">
                      {isAdmin
                        ? 'ADMIN'
                        : user.userType === 'OUTSIDER' || (!user.email?.endsWith('@sjec.ac.in') && user.role !== 'ADMIN')
                        ? 'MUSICIAN'
                        : 'STUDENT'}
                    </div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 glass-panel-elevated rounded-2xl p-2 shadow-2xl z-50 border border-amber-500/20"
                    >
                      <div className="p-3 border-b border-white/10">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-xs font-semibold text-white truncate">{user.name}</p>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                            {isAdmin
                              ? 'ADMIN'
                              : user.userType === 'OUTSIDER' || (!user.email?.endsWith('@sjec.ac.in') && user.role !== 'ADMIN')
                              ? 'MUSICIAN'
                              : 'STUDENT'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                        {user.usn ? (
                          <span className="inline-block mt-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/5">
                            {user.usn}
                          </span>
                        ) : user.organization ? (
                          <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded bg-white/5 text-amber-400 border border-white/5 truncate max-w-[190px]">
                            {user.organization}
                          </span>
                        ) : null}
                      </div>

                      <div className="py-1 space-y-1">
                        <Link
                          to="/my-bookings"
                          onClick={handleNavClick}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>My Bookings</span>
                        </Link>
                        <Link
                          to="/profile"
                          onClick={handleNavClick}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-300" />
                          <span>Musician Profile</span>
                        </Link>

                        {isAdmin && (
                          <Link
                            to="/admin"
                            onClick={handleNavClick}
                            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-amber-300 hover:text-white bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-colors"
                          >
                            <Shield className="w-4 h-4 text-amber-400" />
                            <span>Admin Dashboard</span>
                          </Link>
                        )}
                      </div>

                      <div className="pt-1 border-t border-white/10">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/5 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-sm shadow-glow-yellow transition-all"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Header Action Buttons */}
        <div className="flex md:hidden items-center gap-1.5 sm:gap-2">
          {isAuthenticated && (
            <button
              onClick={() => setIsMobileNotifOpen(!isMobileNotifOpen)}
              className="relative p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white border border-white/5 active:scale-95 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-dark-950 text-[9px] font-extrabold flex items-center justify-center border-2 border-dark-950">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          )}

          <button
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
              setIsMobileNotifOpen(false);
            }}
            className="p-2 sm:p-2.5 rounded-xl bg-white/5 text-slate-200 hover:text-white border border-white/5 active:scale-95 transition-all"
            aria-label="Toggle Menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Notifications Bottom Sheet / Overlay */}
      <AnimatePresence>
        {isMobileNotifOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass-panel-elevated border-b border-amber-500/20 px-4 py-3 shadow-2xl space-y-2.5"
          >
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-white">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-amber-400 font-semibold hover:underline"
                  >
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => setIsMobileNotifOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              {notifications.length === 0 ? (
                <div className="py-6 text-center text-slate-400 text-xs">
                  No notifications yet.
                </div>
              ) : (
                notifications.slice(0, 5).map((n) => (
                  <div
                    key={n._id}
                    className={`p-2.5 rounded-xl border text-xs ${
                      n.isRead
                        ? 'bg-white/5 border-white/5 text-slate-300'
                        : 'bg-amber-950/30 border-amber-500/30 text-white'
                    }`}
                  >
                    <div className="font-semibold text-amber-400 text-xs">{n.title}</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed mt-0.5">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'calc(100vh - 4rem)' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="md:hidden fixed top-16 sm:top-20 inset-x-0 bottom-0 z-50 glass-panel-elevated border-t border-white/10 px-4 pt-3 pb-8 space-y-4 overflow-y-auto overscroll-contain shadow-2xl bg-dark-950/98 backdrop-blur-2xl"
          >
            {/* Nav Links */}
            <div className="flex flex-col space-y-1 pt-1">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={handleNavClick}
                    className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-amber-500/20 text-white font-bold border border-amber-500/30 shadow-inner'
                        : 'text-slate-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span>{link.name}</span>
                    <ChevronRight className="w-4 h-4 opacity-50" />
                  </Link>
                );
              })}

              {/* Mobile Jam Room Big Banner */}
              <Link
                to="/jam-room#booking-calendar"
                onClick={handleBookJamRoomClick}
                className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 border border-amber-400/40 text-dark-950 font-black text-sm mt-2 shadow-glow-yellow active:scale-[0.98] transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-dark-950 animate-pulse" />
                  <span>Book Jam Room Studio</span>
                </div>
                <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-lg bg-dark-950 text-amber-300">
                  Instant Pass
                </span>
              </Link>
            </div>

            {/* User Session Section */}
            <div className="pt-3 border-t border-white/10 space-y-3">
              {isAuthenticated ? (
                <div className="space-y-3">
                  {/* User Profile Pill */}
                  <div className="p-3 bg-white/5 rounded-2xl border border-white/5 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-400 p-0.5 shrink-0 shadow-sm">
                      <div className="w-full h-full bg-dark-900 rounded-[10px] overflow-hidden flex items-center justify-center font-bold text-amber-400">
                        {user.avatar ? (
                          <img src={user.avatar} alt={user.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        ) : (
                          user.name?.[0] || 'U'
                        )}
                      </div>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-white truncate">{user.name}</p>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                          {isAdmin
                            ? 'ADMIN'
                            : user.userType === 'OUTSIDER' || (!user.email?.endsWith('@sjec.ac.in') && user.role !== 'ADMIN')
                            ? 'MUSICIAN'
                            : 'STUDENT'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">
                        {user.usn || user.organization || user.email}
                      </p>
                    </div>
                  </div>

                  {/* User Actions Grid */}
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/my-bookings"
                      onClick={handleNavClick}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span>My Passes</span>
                    </Link>
                    <Link
                      to="/profile"
                      onClick={handleNavClick}
                      className="p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-center text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-slate-300" />
                      <span>Profile</span>
                    </Link>
                  </div>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={handleNavClick}
                      className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 font-bold text-xs transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Dashboard Console</span>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full p-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 font-semibold text-xs text-center flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2.5 pt-1">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className="w-full py-3 text-center rounded-2xl bg-white/5 hover:bg-white/10 text-slate-200 font-bold text-sm border border-white/10 transition-colors"
                  >
                    Sign In to Account
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavClick}
                    className="w-full py-3 text-center rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 font-extrabold text-sm shadow-glow-yellow transition-all"
                  >
                    Create Free Student / Musician Account
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
