import React, { useState, useEffect, useRef } from 'react';
import { cmsService } from '../../services/cmsService';
import { useToast } from '../../context/ToastContext';
import {
  Upload,
  Link2,
  Camera,
  CheckCircle2,
  X,
  Sliders,
  Sparkles,
  Headphones,
  ExternalLink,
  Save,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminTeamPage = () => {
  const toast = useToast();
  const [engineer, setEngineer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'url'
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: 'Lionel',
    role: 'Chief Sound Engineer & Studio Custodian',
    instrument: 'Live Sound Mixing, Multitrack DAW & Studio Acoustics',
    bio: 'Lionel oversees all audio engineering, sound checks, and studio operations at Melodium SJEC. From calibrating 16-channel digital consoles and dialing in studio monitor acoustics to running multitrack DAW recording sessions for student bands and external artists, Lionel ensures every performance is captured with studio clarity.',
    photo: '/team/lionel.jpg',
  });

  const fetchEngineer = async () => {
    setLoading(true);
    try {
      const res = await cmsService.getTeam();
      if (res.success && res.data && res.data.length > 0) {
        const found =
          res.data.find(
            (m) =>
              m.category === 'SOUND_ENGINEER' ||
              m.name?.toLowerCase().includes('lionel') ||
              m.role?.toLowerCase().includes('sound')
          ) || res.data[0];

        if (found) {
          setEngineer(found);
          setFormData({
            name: found.name || 'Lionel',
            role: found.role || 'Chief Sound Engineer & Studio Custodian',
            instrument: found.instrument || 'Live Sound Mixing, Multitrack DAW & Studio Acoustics',
            bio: found.bio || '',
            photo: found.photo || '/team/lionel.jpg',
          });
        }
      }
    } catch (err) {
      toast.error('Failed to load sound engineer profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineer();
  }, []);

  // 1-Click Upload from Computer / Device
  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file (.jpg, .jpeg, .png, .webp, .gif)');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('photo', file);

    setIsUploading(true);
    try {
      const res = await cmsService.uploadTeamPhoto(uploadFormData);
      if (res.success && res.imageUrl) {
        setFormData((prev) => ({ ...prev, photo: res.imageUrl }));

        // Auto-save photo to database if engineer already exists
        if (engineer?._id) {
          await cmsService.updateTeamMember(engineer._id, {
            ...engineer,
            photo: res.imageUrl,
          });
          toast.success("Lionel's Sound Engineer photo updated & live on Homepage! 📸✨");
          fetchEngineer();
        } else {
          toast.success('Photo uploaded from device! Click "Save Profile Changes" to finish.');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (engineer?._id) {
        const res = await cmsService.updateTeamMember(engineer._id, {
          ...formData,
          category: 'SOUND_ENGINEER',
        });
        if (res.success) {
          toast.success('Sound Engineer profile updated successfully! 🎧');
          fetchEngineer();
        }
      } else {
        const res = await cmsService.createTeamMember({
          ...formData,
          category: 'SOUND_ENGINEER',
        });
        if (res.success) {
          toast.success('Sound Engineer profile created successfully! 🎧');
          fetchEngineer();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save Sound Engineer profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 max-w-5xl">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Headphones className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black font-display text-white">
              Sound Engineer & Studio Custodian
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage Lionel's official sound engineer spotlight photo, studio credentials, and public acoustic bio.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchEngineer}
            disabled={loading}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <Link
            to="/sound-engineer"
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
            <span>Preview Public Page</span>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading sound engineer details...</p>
        </div>
      ) : (
        <form onSubmit={handleSaveProfile} className="space-y-8">
          {/* 2. Photo & Spotlight Showcase */}
          <div className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-amber-500/30 bg-gradient-to-br from-dark-900/95 via-dark-950 to-dark-900 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Photo Card Preview */}
              <div className="lg:col-span-4 flex flex-col items-center">
                <div className="relative group shrink-0 w-48 sm:w-56 aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-dark-900 shadow-2xl">
                  <img
                    src={formData.photo || '/team/lionel.jpg'}
                    alt={formData.name || 'Lionel'}
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      e.target.src = '/team/lionel.jpg';
                    }}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950/90 via-dark-950/20 to-transparent" />

                  <div className="absolute top-3 left-3">
                    <span className="px-2.5 py-1 rounded-full bg-dark-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Sliders className="w-3 h-3 text-amber-400" />
                      Live Photo
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 text-center">
                    <span className="text-xs font-bold text-white block truncate">{formData.name}</span>
                    <span className="text-[10px] text-amber-400 block truncate">{formData.role}</span>
                  </div>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  accept="image/*"
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5 text-dark-950 stroke-[2.5]" />
                      <span>Upload Photo from Device</span>
                    </>
                  )}
                </button>
              </div>

              {/* Photo Input Controls & Live Info */}
              <div className="lg:col-span-8 space-y-5">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Homepage Spotlight & Sound Engineer Page Sync</span>
                  </div>
                  <h3 className="text-xl font-bold font-display text-white">
                    Sound Engineer Profile Picture
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Upload a high-resolution portrait of Lionel from your computer. Any update here automatically reflects on the homepage spotlight and the public Sound Engineer profile.
                  </p>
                </div>

                {/* Photo Mode Switcher */}
                <div className="space-y-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">Image Source</span>
                    <div className="flex items-center gap-1 p-0.5 rounded-lg bg-dark-900 border border-white/10 text-xs">
                      <button
                        type="button"
                        onClick={() => setPhotoMode('upload')}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          photoMode === 'upload'
                            ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Upload from Device
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotoMode('url')}
                        className={`px-3 py-1 rounded-md font-bold transition-all cursor-pointer ${
                          photoMode === 'url'
                            ? 'bg-amber-500 text-dark-950 shadow-glow-yellow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        Image URL
                      </button>
                    </div>
                  </div>

                  {photoMode === 'upload' ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/15 hover:border-amber-400/60 rounded-xl p-5 text-center cursor-pointer transition-all bg-dark-950/40 hover:bg-amber-500/5 space-y-1.5"
                    >
                      <Upload className="w-5 h-5 text-amber-400 mx-auto" />
                      <span className="text-xs font-bold text-white block">
                        Click to select photo from your PC / phone
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        Supports JPG, PNG, WEBP, Google Photos (up to 25MB)
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-semibold text-slate-300">Direct Image URL</label>
                      <input
                        type="url"
                        value={formData.photo}
                        onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sound Engineer Information Form */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 space-y-5">
            <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Sound Engineer Details & Bio</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Lionel"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Role / Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-200">Role / Studio Title *</label>
                <input
                  type="text"
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="e.g. Chief Sound Engineer & Studio Custodian"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Acoustic Specialties & Gear Focus */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Acoustic Specialties & Studio Focus
              </label>
              <input
                type="text"
                value={formData.instrument}
                onChange={(e) => setFormData({ ...formData, instrument: e.target.value })}
                placeholder="e.g. Live Sound Mixing, Multitrack DAW & Studio Acoustics"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Sound Engineer Bio */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-200">
                Studio Bio & Responsibilities Description
              </label>
              <textarea
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe Lionel's audio engineering responsibilities, console routing, DAW multitrack recording, and studio management..."
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400 leading-relaxed"
              />
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-dark-950 stroke-[2.5]" />
                <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AdminTeamPage;
