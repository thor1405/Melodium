import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { MelodiumLogo } from '../../components/common/MelodiumLogo';
import {
  Lock,
  Mail,
  User,
  BookOpen,
  GraduationCap,
  ArrowRight,
  Globe2,
  MapPin,
  Phone,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const RegisterPage = () => {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(() => {
    const type = searchParams.get('type');
    return type === 'OUTSIDER' ? 'OUTSIDER' : 'SJEC_STUDENT';
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    usn: '',
    organization: '',
    city: 'Mangaluru',
    department: 'Computer Science & Engineering',
    year: 3,
    phone: '',
    instrument: 'Acoustic Guitar / Vocals',
    bio: '',
  });

  const [loading, setLoading] = useState(false);

  // Sync tab from query param if changed
  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'OUTSIDER' || type === 'SJEC_STUDENT') {
      setActiveTab(type);
    }
  }, [searchParams]);

  const departments = [
    'Computer Science & Engineering',
    'Electronics & Communication Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical & Electronics Engineering',
    'Artificial Intelligence & ML',
    'Computer Science (Data Science)',
    'Master of Business Administration (MBA)',
    'Master of Computer Applications (MCA)',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.password || !formData.phone.trim()) {
      toast.error('Please complete all required fields including your phone number.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    if (activeTab === 'SJEC_STUDENT') {
      if (!formData.email.toLowerCase().endsWith('@sjec.ac.in')) {
        toast.error('SJEC Students must register with their official @sjec.ac.in email address.');
        return;
      }
      if (!formData.usn.trim()) {
        toast.error('Please enter your USN / Student ID.');
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        userType: activeTab,
      };

      const res = await register(payload);
      if (res.success) {
        if (activeTab === 'SJEC_STUDENT') {
          toast.success(`Welcome to Melodium SJEC, ${res.user.name}! 🎸 (Free Jam Room Active)`);
        } else {
          toast.success(`Welcome, ${res.user.name}! 🎵 (External Musician Pass: Flat ₹500/day)`);
        }
        navigate('/jam-room');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-amber-500/20 shadow-2xl space-y-6 relative overflow-hidden"
      >
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-1">
            <MelodiumLogo className="w-14 h-14" showGlow={true} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
            Create an Account
          </h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Reserve Jam Room rehearsal passes and studio sessions
          </p>
        </div>

        {/* Category Switcher Tabs */}
        <div className="flex rounded-2xl bg-white/5 p-1 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab('SJEC_STUDENT')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'SJEC_STUDENT'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>SJEC Student / Faculty</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('OUTSIDER')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'OUTSIDER'
                ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe2 className="w-4 h-4" />
            <span>External Musician / Guest Band</span>
          </button>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Name *</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Johan Monteiro"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                {activeTab === 'SJEC_STUDENT' ? 'SJEC Email Address *' : 'Email Address *'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={
                    activeTab === 'SJEC_STUDENT' ? 'student@sjec.ac.in' : 'band@gmail.com'
                  }
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Conditional Fields based on User Type */}
          {activeTab === 'SJEC_STUDENT' ? (
            /* SJEC Student Fields */
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">USN / Student ID *</label>
                  <div className="relative">
                    <BookOpen className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      name="usn"
                      value={formData.usn}
                      onChange={handleChange}
                      placeholder="e.g. 4SO22CS089"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 uppercase focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-200">Year of Study</label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                >
                  {departments.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : (
            /* External Musician Fields */
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">City / Location *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Mangaluru / Udupi"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Number (Mandatory) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Phone Number *</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-dark-950/30 border-t-dark-950 rounded-full animate-spin" />
            ) : (
              <>
                <span>
                  {activeTab === 'SJEC_STUDENT'
                    ? 'Register as SJEC Student'
                    : 'Register as External Musician'}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-400">
          Already registered?{' '}
          <Link
            to={`/login?type=${activeTab}`}
            className="text-amber-400 hover:underline font-semibold"
          >
            Sign In here
          </Link>
        </div>
      </motion.div>
    </div>
  );
};
