import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { authService } from '../../services/authService';
import { formatDate } from '../../utils/dateUtils';
import {
  User,
  Mail,
  BookOpen,
  GraduationCap,
  Music,
  Lock,
  Phone,
  Calendar,
  Shield,
  Save,
  CheckCircle2,
  Camera,
  Upload,
  RefreshCw,
  Building2,
  MapPin,
  Link2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const ProfilePage = () => {
  const { user, updateProfile, updateAvatar } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const isOutsider =
    user?.userType === 'OUTSIDER' ||
    (!user?.email?.endsWith('@sjec.ac.in') && user?.role !== 'ADMIN');

  const userRoleLabel =
    user?.role === 'ADMIN'
      ? 'ADMIN'
      : isOutsider
      ? 'EXTERNAL MUSICIAN'
      : 'SJEC STUDENT';

  const [formData, setFormData] = useState({
    name: user?.name || '',
    usn: user?.usn || '',
    organization: user?.organization || '',
    city: user?.city || 'Mangaluru',
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || 3,
    phone: user?.phone || '',
    instrument: user?.instrument || 'Acoustic Guitar / Vocals',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarInputMode, setAvatarInputMode] = useState('upload'); // 'upload' | 'url'

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        usn: user.usn || '',
        organization: user.organization || '',
        city: user.city || 'Mangaluru',
        department: user.department || 'Computer Science & Engineering',
        year: user.year || 3,
        phone: user.phone || '',
        instrument: user.instrument || 'Acoustic Guitar / Vocals',
        bio: user.bio || '',
        avatar: user.avatar || '',
      });
    }
  }, [user]);

  const handleAvatarFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Profile image must be less than 10 MB.');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('avatar', file);

    setIsUploadingAvatar(true);
    try {
      const res = await authService.uploadAvatar(uploadFormData);
      if (res.success) {
        setFormData((prev) => ({ ...prev, avatar: res.avatarUrl }));
        if (updateAvatar) updateAvatar(res.avatarUrl, res.user);
        toast.success('Profile picture updated successfully! 📸');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload profile picture.');
    } finally {
      setIsUploadingAvatar(false);
      if (e.target) e.target.value = '';
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const res = await updateProfile(formData);
      if (res.success) {
        toast.success(
          isOutsider
            ? 'Musician profile updated successfully! 🎸'
            : 'Student profile updated successfully! 🎵'
        );
      }
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setIsChangingPass(true);
    try {
      const res = await authService.changePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success('Password changed successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally {
      setIsChangingPass(false);
    }
  };

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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 pb-28">
      {/* Hidden File Input for Avatar */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        onChange={handleAvatarFileSelect}
        className="hidden"
      />

      {/* Header Banner */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-white/10 relative overflow-hidden flex flex-col sm:flex-row items-center gap-6">
        {/* Avatar with Camera Overlay */}
        <div className="relative group shrink-0">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 p-0.5 shadow-glow-yellow">
            <div className="w-full h-full bg-dark-950 rounded-[22px] overflow-hidden flex items-center justify-center relative">
              {formData.avatar ? (
                <img
                  src={formData.avatar}
                  alt={user?.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/gallery/sound_engineer_console.png';
                  }}
                />
              ) : (
                <User className="w-10 h-10 text-amber-400" />
              )}

              {/* Uploading Overlay */}
              {isUploadingAvatar && (
                <div className="absolute inset-0 bg-dark-950/80 backdrop-blur-sm flex items-center justify-center">
                  <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
                </div>
              )}
            </div>
          </div>

          {/* Camera upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploadingAvatar}
            title="Upload Profile Picture"
            className="absolute -bottom-1.5 -right-1.5 p-2 rounded-xl bg-amber-500 hover:bg-yellow-400 text-dark-950 shadow-lg border-2 border-dark-950 transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <Camera className="w-4 h-4 stroke-[2.5]" />
          </button>
        </div>

        <div className="space-y-1.5 text-center sm:text-left flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-display font-black text-white">{user?.name}</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              {userRoleLabel}
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono">{user?.email}</p>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-xs text-slate-300">
            {isOutsider ? (
              <>
                <span className="inline-flex items-center gap-1 font-medium text-amber-300">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{user?.organization || 'Independent Musician'}</span>
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user?.city || 'Mangaluru'}</span>
                </span>
                <span>•</span>
                <span className="text-slate-400">{user?.instrument || 'Artist'}</span>
              </>
            ) : (
              <>
                {user?.usn && (
                  <span className="font-mono px-2 py-0.5 rounded bg-white/5 border border-white/5 text-amber-300 font-bold">
                    {user.usn}
                  </span>
                )}
                <span>{user?.department}</span>
                <span>• Year {user?.year}</span>
              </>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploadingAvatar}
          className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-semibold transition-all shrink-0 cursor-pointer"
        >
          {isUploadingAvatar ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
          ) : (
            <Upload className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span>{isUploadingAvatar ? 'Uploading...' : 'Change Photo'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Edit Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
              <User className="w-4 h-4 text-amber-400" />
              <span>{isOutsider ? 'Edit Musician Profile' : 'Edit Student Profile'}</span>
            </h2>

            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-amber-400" />
                    <span>Profile Picture</span>
                  </label>
                  <div className="flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setAvatarInputMode('upload')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        avatarInputMode === 'upload'
                          ? 'bg-amber-400 text-dark-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvatarInputMode('url')}
                      className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                        avatarInputMode === 'url'
                          ? 'bg-amber-400 text-dark-950 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Image URL
                    </button>
                  </div>
                </div>

                {avatarInputMode === 'upload' ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 rounded-xl border-2 border-dashed border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10 transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                      {isUploadingAvatar ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <Upload className="w-5 h-5" />
                      )}
                    </div>
                    <div className="text-xs font-bold text-white">
                      {isUploadingAvatar ? 'Uploading Image...' : 'Click to Upload Photo from Device'}
                    </div>
                    <p className="text-[10px] text-slate-400">
                      Supports JPG, PNG, WEBP, GIF up to 10 MB.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="url"
                      value={formData.avatar}
                      onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                      placeholder="https://example.com/your-photo.jpg"
                      className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Name & Identifier */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                {isOutsider ? (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">
                      Band / Studio / Organization
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="e.g. The SJEC Collective / Independent"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                ) : (
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">USN / Student ID</label>
                    <input
                      type="text"
                      value={formData.usn}
                      onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs uppercase font-mono focus:outline-none focus:border-amber-400"
                    />
                  </div>
                )}
              </div>

              {/* Department & Year (Students) OR City & Contact (Musicians) */}
              {!isOutsider ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Department</label>
                    <select
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      {departments.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Year of Study</label>
                    <select
                      value={formData.year}
                      onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    >
                      <option value={1}>1st Year</option>
                      <option value={2}>2nd Year</option>
                      <option value={3}>3rd Year</option>
                      <option value={4}>4th Year</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">City / Location</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Mangaluru / Udupi"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              )}

              {/* Instrument & Phone (Students) */}
              {!isOutsider ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Primary Instrument</label>
                    <input
                      type="text"
                      value={formData.instrument}
                      onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                      placeholder="e.g. Lead Guitar / Vocals"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-200">Phone Number</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-200">Primary Instrument</label>
                  <input
                    type="text"
                    value={formData.instrument}
                    onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                    placeholder="e.g. Drums / Bass / Lead Guitar / Vocals"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">Musician Bio</label>
                <textarea
                  rows={3}
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Share your musical journey, genres, band experience, or studio background..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isUpdating ? 'Saving...' : 'Save Profile Changes'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="space-y-6">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-4">
            <h3 className="font-display font-bold text-base text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Change Password</span>
            </h3>

            <form onSubmit={handlePasswordSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Current Password</label>
                <input
                  type="password"
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">New Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isChangingPass}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all mt-2 cursor-pointer"
              >
                {isChangingPass ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
