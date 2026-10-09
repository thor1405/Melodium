import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MelodiumLogo } from '../../components/common/MelodiumLogo';
import { Lock, Mail, ArrowRight, GraduationCap, Globe2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const LoginPage = () => {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState('SJEC_STUDENT'); // 'SJEC_STUDENT' | 'OUTSIDER'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/jam-room';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    if (activeTab === 'SJEC_STUDENT' && !email.toLowerCase().endsWith('@sjec.ac.in')) {
      toast.error('SJEC Students must log in with an @sjec.ac.in email. If you are an external musician, switch to the External Musician tab.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        const isOutsider = res.user.userType === 'OUTSIDER';
        toast.success(`Welcome back, ${res.user.name}! ${isOutsider ? '🎸 (External Musician)' : '🎵 (SJEC Member)'}`);
        navigate(res.user.role === 'ADMIN' && from === '/jam-room' ? '/admin' : from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-amber-500/20 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <MelodiumLogo className="w-14 h-14" showGlow={true} />
          </div>
          <h2 className="text-2xl font-display font-extrabold text-white">Sign In to Melodium</h2>
          <p className="text-xs text-slate-400">
            Access Jam Room reservations and rehearsal bookings
          </p>
        </div>

        {/* Member Type Selection Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => {
              setActiveTab('SJEC_STUDENT');
              if (email === 'band.lead@gmail.com') setEmail('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SJEC_STUDENT'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>SJEC Student</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('OUTSIDER');
              if (email.endsWith('@sjec.ac.in')) setEmail('');
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OUTSIDER'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>External Musician</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-200">
              {activeTab === 'SJEC_STUDENT' ? 'SJEC Email Address' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={
                  activeTab === 'SJEC_STUDENT' ? 'student@sjec.ac.in' : 'yourname@gmail.com'
                }
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">Password</label>
              <Link
                to={`/forgot-password?type=${activeTab}${email ? `&email=${encodeURIComponent(email)}` : ''}`}
                className="text-[11px] font-semibold text-amber-400 hover:text-yellow-300 hover:underline transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {activeTab === 'SJEC_STUDENT' ? 'Sign In as SJEC Student' : 'Sign In as External Musician'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Link to Register with Tab Preset */}
        <div className="text-center pt-2 text-xs text-slate-400">
          Not registered with Melodium yet?{' '}
          <Link
            to={`/register?type=${activeTab}`}
            className="text-amber-400 hover:underline font-semibold"
          >
            Create an Account
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
