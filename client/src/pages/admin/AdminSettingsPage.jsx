import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { useToast } from '../../context/ToastContext';
import { Sliders, Save, Clock, ShieldCheck, AlertTriangle, Radio, RefreshCw, Upload, FileVideo, Link2, CheckCircle } from 'lucide-react';

export const AdminSettingsPage = () => {
  const toast = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const [videoMode, setVideoMode] = useState('upload'); // 'upload' | 'link'

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await bookingService.getBookingSettings();
      if (res.success) {
        setSettings(res.data);
        // Default to link mode if it's an external YouTube URL
        if (res.data.heroVideoUrl && (res.data.heroVideoUrl.includes('youtu') || res.data.heroVideoUrl.startsWith('http'))) {
          if (!res.data.heroVideoUrl.includes('/uploads/')) {
            setVideoMode('link');
          }
        }
      }
    } catch (err) {
      toast.error('Failed to load settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const processVideoFile = async (file) => {
    if (!file) return;

    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video file exceeds maximum size limit (150 MB).');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    if (settings?.heroVideoTitle) {
      formData.append('heroVideoTitle', settings.heroVideoTitle);
    }

    setIsUploadingVideo(true);
    setUploadProgress(0);

    try {
      const res = await adminService.uploadHeroVideo(formData, (percent) => {
        setUploadProgress(percent);
      });
      if (res.success) {
        toast.success('Video file uploaded and published to homepage! 🎬');
        setSettings(res.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to upload video file.');
    } finally {
      setIsUploadingVideo(false);
      setUploadProgress(0);
    }
  };

  const handleVideoFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processVideoFile(file);
    }
    if (e.target) e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processVideoFile(file);
    }
  };

  const handleWeekdayToggle = (dayIndex) => {
    const current = settings.availableDays || [];
    const updated = current.includes(dayIndex)
      ? current.filter((d) => d !== dayIndex)
      : [...current, dayIndex];
    setSettings((prev) => ({ ...prev, availableDays: updated }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await adminService.updateBookingSettings(settings);
      if (res.success) {
        toast.success('Jam Room settings updated and live!');
        setSettings(res.data);
      }
    } catch (err) {
      toast.error('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400 text-xs">
        <div className="w-6 h-6 border-2 border-brand-purple border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        Loading settings...
      </div>
    );
  }

  const weekDays = [
    { label: 'Sun', value: 0 },
    { label: 'Mon', value: 1 },
    { label: 'Tue', value: 2 },
    { label: 'Wed', value: 3 },
    { label: 'Thu', value: 4 },
    { label: 'Fri', value: 5 },
    { label: 'Sat', value: 6 },
  ];

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="pb-4 border-b border-white/5">
        <h2 className="text-xl font-bold font-display text-white">Jam Room Booking Parameters</h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Configure operational hours, booking windows, student quotas, and cancellation rules.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Global Jam Room Status */}
        <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Radio className="w-4 h-4 text-brand-gold" />
            <span>Studio 1 Global Booking Availability</span>
          </h3>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-xs text-white">Enable Student Bookings</div>
              <p className="text-[11px] text-slate-400">
                When disabled, students will see the room as temporarily offline with your maintenance notice.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.isBookingEnabled}
              onChange={(e) => handleChange('isBookingEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-dark-900 text-emerald-500"
            />
          </div>

          {!settings.isBookingEnabled && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Maintenance Notice Message (Public)
              </label>
              <input
                type="text"
                value={settings.maintenanceNotice || ''}
                onChange={(e) => handleChange('maintenanceNotice', e.target.value)}
                placeholder="e.g. Jam Room 1 is closed for annual acoustic panelling upgrade until Monday."
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          )}
        </div>

        {/* Operating Hours & Slot Duration */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-purple" />
            <span>Operational Hours & Slot Timings</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Opening Time</label>
              <input
                type="time"
                value={settings.openingTime}
                onChange={(e) => handleChange('openingTime', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Closing Time</label>
              <input
                type="time"
                value={settings.closingTime}
                onChange={(e) => handleChange('closingTime', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">Slot Duration (Minutes)</label>
              <input
                type="number"
                min="30"
                max="120"
                step="30"
                value={settings.slotDurationMinutes || 60}
                onChange={(e) => handleChange('slotDurationMinutes', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>
          </div>

          {/* Operational Days of Week */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-200">
                Operating Days of the Week (Student Rehearsals)
              </label>
              <span className="text-[11px] text-amber-300 font-semibold">
                {settings.availableDays?.includes(0)
                  ? 'All 7 Days Open (Sundays Enabled)'
                  : 'Mon–Sat Open (Sundays Closed)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {weekDays.map((d) => {
                const isActive = settings.availableDays?.includes(d.value);
                return (
                  <button
                    type="button"
                    key={d.value}
                    onClick={() => handleWeekdayToggle(d.value)}
                    className={`p-3 rounded-2xl text-xs font-bold transition-all border flex flex-col items-center justify-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-gradient-to-br from-amber-500/25 via-amber-900/40 to-dark-900 border-amber-400 text-amber-300 shadow-glow-yellow ring-1 ring-amber-400'
                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-slate-300 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-sm">{d.label}</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] uppercase font-bold tracking-wider ${
                        isActive
                          ? 'bg-amber-400 text-dark-950 font-black'
                          : 'bg-white/5 text-slate-500'
                      }`}
                    >
                      {isActive ? '✓ Open' : 'Off'}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400">
              Click any day (e.g. <strong>Sun</strong>) to toggle between Open and Closed, then click <strong>"Save & Publish Rules"</strong> below to apply changes live.
            </p>
          </div>
        </div>

        {/* Quotas & Booking Policies */}
        <div className="p-6 rounded-3xl glass-panel border border-white/5 space-y-4">
          <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-brand-cyan" />
            <span>Student Quotas & Cancellation Policies</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Advance Booking Limit (Days)
              </label>
              <input
                type="number"
                min="1"
                max="30"
                value={settings.maxAdvanceBookingDays}
                onChange={(e) => handleChange('maxAdvanceBookingDays', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Max Daily Slots / Student
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={settings.maxDailyBookingsPerStudent}
                onChange={(e) => handleChange('maxDailyBookingsPerStudent', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Max Weekly Slots / Student
              </label>
              <input
                type="number"
                min="1"
                max="14"
                value={settings.maxWeeklyBookingsPerStudent}
                onChange={(e) => handleChange('maxWeeklyBookingsPerStudent', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-brand-purple"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Cancel Cutoff (Hours Before)
              </label>
              <input
                type="number"
                min="0"
                max="24"
                value={settings.cancellationCutoffHours}
                onChange={(e) => handleChange('cancellationCutoffHours', Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Require Admin Approval Toggle */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 mt-2">
            <div>
              <div className="font-semibold text-xs text-white">
                Require Manual Admin Approval for Bookings
              </div>
              <p className="text-[11px] text-slate-400">
                When enabled, student reservations start as 'PENDING' until an admin confirms.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.requireAdminApproval}
              onChange={(e) => handleChange('requireAdminApproval', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-dark-900 text-amber-500"
            />
          </div>
        </div>

        {/* Homepage Video & Media Showcase CMS */}
        <div className="p-6 rounded-3xl glass-panel-elevated border border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Radio className="w-4 h-4 text-brand-gold" />
              <span>Homepage Video & Live Background Media CMS</span>
            </h3>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase tracking-wider">
              Live Backdrop
            </span>
          </div>

          <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
            <div>
              <div className="font-semibold text-xs text-white">Enable Video Background on Homepage</div>
              <p className="text-[11px] text-slate-400">
                When enabled, your chosen video plays as a dynamic ambient backdrop behind the homepage hero.
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.heroVideoEnabled ?? true}
              onChange={(e) => handleChange('heroVideoEnabled', e.target.checked)}
              className="w-5 h-5 rounded border-slate-700 bg-dark-900 text-amber-500"
            />
          </div>

          {/* Video Source Mode Selector */}
          <div className="flex rounded-2xl bg-white/5 p-1 border border-white/5 max-w-md">
            <button
              type="button"
              onClick={() => setVideoMode('upload')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                videoMode === 'upload'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video File</span>
            </button>
            <button
              type="button"
              onClick={() => setVideoMode('link')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                videoMode === 'link'
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-dark-950 shadow-glow-yellow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Enter Link / YouTube</span>
            </button>
          </div>

          {/* Mode 1: File Upload */}
          {videoMode === 'upload' && (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => {
                if (!isUploadingVideo) {
                  document.getElementById('videoFileInput')?.click();
                }
              }}
              className={`p-6 rounded-2xl border-2 border-dashed transition-all text-center space-y-3 cursor-pointer ${
                isDragOver
                  ? 'border-amber-400 bg-amber-500/15 scale-[1.01]'
                  : 'border-amber-500/30 bg-amber-500/5 hover:border-amber-400/60 hover:bg-amber-500/10'
              }`}
            >
              <input
                type="file"
                id="videoFileInput"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/m4v,video/mkv,video/avi"
                onChange={handleVideoFileUpload}
                disabled={isUploadingVideo}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-2 pointer-events-none">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shadow-glow-yellow">
                  {isUploadingVideo ? (
                    <RefreshCw className="w-6 h-6 animate-spin text-amber-400" />
                  ) : (
                    <FileVideo className="w-6 h-6" />
                  )}
                </div>
                <div className="w-full max-w-xs">
                  <div className="text-sm font-bold text-white">
                    {isUploadingVideo ? `Uploading Video (${uploadProgress}%)...` : 'Click or Drag & Drop Video File'}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports MP4, WebM, MOV, M4V files up to 150 MB.
                  </p>

                  {/* Upload Progress Bar */}
                  {isUploadingVideo && (
                    <div className="w-full bg-white/10 rounded-full h-2 mt-3 overflow-hidden border border-white/10">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-300 h-full transition-all duration-300 rounded-full"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>

              {settings.heroVideoUrl && settings.heroVideoUrl.includes('/uploads/') && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Currently active: {settings.heroVideoTitle || 'Uploaded Video'}</span>
                </div>
              )}
            </div>
          )}

          {/* Mode 2: Link / YouTube URL */}
          {videoMode === 'link' && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-200">
                  Video URL (Direct MP4 / WebM or YouTube Link)
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=... or https://example.com/video.mp4"
                  value={settings.heroVideoUrl || ''}
                  onChange={(e) => handleChange('heroVideoUrl', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <p className="text-[10px] text-slate-400">
                  Paste any YouTube URL (`youtube.com/watch?v=...` or `youtu.be/...`) or direct streaming video link.
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Video Title / Label
              </label>
              <input
                type="text"
                placeholder="e.g. Melodium SJEC Live Jam Session"
                value={settings.heroVideoTitle || ''}
                onChange={(e) => handleChange('heroVideoTitle', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-200">
                Current Video Source URL
              </label>
              <input
                type="text"
                readOnly
                value={settings.heroVideoUrl || ''}
                className="w-full px-3.5 py-2 rounded-xl bg-black/30 border border-white/5 text-slate-400 text-xs focus:outline-none"
              />
            </div>

            <div className="space-y-2 md:col-span-2 p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-white">Background Video Opacity (Ambient Intensity)</span>
                <span className="text-amber-400 font-bold font-mono">
                  {Math.round((settings.heroVideoOpacity ?? 0.35) * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={settings.heroVideoOpacity ?? 0.35}
                onChange={(e) => handleChange('heroVideoOpacity', parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>10% (Subtle Ambience)</span>
                <span>35% (Recommended Balance)</span>
                <span>80% (High Contrast)</span>
              </div>
            </div>

            {/* Quick Video Presets */}
            <div className="md:col-span-2 space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-400">Quick Video Presets (Live Motion Video):</div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleChange('heroVideoUrl', 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4');
                    handleChange('heroVideoTitle', 'Acoustic Guitar Jam (Live Video)');
                    handleChange('heroVideoOpacity', 0.5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  🎸 Acoustic Guitar Soloist (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('heroVideoUrl', 'https://cdn.pixabay.com/video/2019/04/23/23011-332470559_large.mp4');
                    handleChange('heroVideoTitle', 'Live Stage Band Performance');
                    handleChange('heroVideoOpacity', 0.5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  🥁 Live Band & Drums (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('heroVideoUrl', 'https://cdn.pixabay.com/video/2020/05/25/40149-425263622_large.mp4');
                    handleChange('heroVideoTitle', 'Electric Guitar & Neon Lights');
                    handleChange('heroVideoOpacity', 0.55);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  ⚡ Electric Studio Jam (MP4)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleChange('heroVideoUrl', 'https://www.youtube.com/watch?v=kYxRk57QoZg');
                    handleChange('heroVideoTitle', 'Melodium Jam Session (YouTube Live)');
                    handleChange('heroVideoOpacity', 0.5);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  📺 YouTube Video Link
                </button>
              </div>
            </div>

            {/* Live Video Preview in Admin */}
            {settings.heroVideoUrl && (
              <div className="md:col-span-2 space-y-1.5 pt-2">
                <div className="text-[11px] font-semibold text-slate-400">Admin Live Preview:</div>
                <div className="relative w-full h-44 rounded-2xl overflow-hidden border border-amber-500/20 bg-dark-900 shadow-inner flex items-center justify-center">
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{ opacity: settings.heroVideoOpacity ?? 0.35 }}
                  >
                    {settings.heroVideoUrl.includes('youtu') ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${settings.heroVideoUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)?.[2] || ''}?autoplay=1&mute=1&controls=0&loop=1`}
                        title="Admin Preview"
                        className="w-full h-full pointer-events-none object-cover"
                      />
                    ) : (
                      <video
                        src={settings.heroVideoUrl}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-dark-950/40 pointer-events-none" />
                  <div className="relative z-10 text-center px-4">
                    <span className="px-3 py-1 rounded-full bg-dark-900/80 border border-amber-400/40 text-[11px] font-bold text-amber-300 backdrop-blur-md">
                      {settings.heroVideoTitle || 'Homepage Ambient Backdrop Preview'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-dark-950 font-bold" />
            <span>{isSaving ? 'Saving Settings...' : 'Save & Publish Rules'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
