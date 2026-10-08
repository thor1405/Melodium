import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';
import { MelodiumLogo } from '../../components/common/MelodiumLogo';
import { Mail, ArrowRight, ArrowLeft, GraduationCap, Globe2, CheckCircle2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

export const ForgotPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState(() => searchParams.get('type') || 'SJEC_STUDENT');
  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }

    if (activeTab === 'SJEC_STUDENT' && !email.toLowerCase().endsWith('@sjec.ac.in')) {
      toast.error('SJEC Students must use their @sjec.ac.in email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.forgotPassword(email.trim());
      if (res.success) {
        setIsSubmitted(true);
        setResendCooldown(45); // 45 seconds cooldown
        toast.success('Password reset link sent! Please check your email inbox.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send reset link. Please try again.');
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
          <h2 className="text-2xl font-display font-extrabold text-white">
            {isSubmitted ? 'Reset Link Sent! ✉️' : 'Reset Your Password'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSubmitted
              ? 'Verification email has been dispatched to your inbox.'
              : 'Enter your registered email to receive a secure password reset link.'}
          </p>
        </div>

        {isSubmitted ? (
          /* ================= SUCCESS CONFIRMATION STATE ================= */
          <div className="space-y-5">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-dark-900 to-amber-500/10 border border-emerald-500/30 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-glow-emerald">
                <CheckCircle2 className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Check Your Email</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  We sent a verification link to{' '}
                  <strong className="text-amber-300 font-mono break-all">{email}</strong>
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-slate-400 space-y-1.5 leading-relaxed">
              <p>• The reset link is valid for <strong>30 minutes</strong>.</p>
              <p>• Check your <strong>Spam / Junk</strong> folder if you don't see it in a few minutes.</p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={loading || resendCooldown > 0}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>
                  {resendCooldown > 0
                    ? `Resend Email in ${resendCooldown}s`
                    : 'Resend Reset Link'}
                </span>
              </button>

              <Link
                to="/login"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01]"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= REQUEST FORM STATE ================= */
          <div className="space-y-5">
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

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">
                  {activeTab === 'SJEC_STUDENT' ? 'SJEC Email Address' : 'Registered Email Address'}
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

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Password Reset Link</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2 text-xs text-slate-400">
              Remember your password?{' '}
              <Link to="/login" className="text-amber-400 hover:underline font-semibold">
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
