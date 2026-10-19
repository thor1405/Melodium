import React, { useState, useEffect, useRef } from 'react';
import { jamRoomVideoService } from '../../services/jamRoomVideoService';
import { useToast } from '../../context/ToastContext';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import {
  Film,
  Plus,
  Trash2,
  Edit,
  Upload,
  Link2,
  Play,
  Pause,
  Clock,
  Eye,
  Heart,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Layers,
  Radio,
  FileVideo,
  X,
  Volume2,
  VolumeX,
} from 'lucide-react';

const TAG_OPTIONS = [
  'Studio Tour',
  'Acoustics',
  'Drum Kit',
  'Guitars & Amps',
  'Vocal Booth',
  'Mixing Console',
  'Live Rehearsal',
  'Soundcheck',
  'Lionel Mix',
];

export const AdminVideosPage = () => {
  const toast = useToast();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Video Input Mode: 'upload' | 'url'
  const [inputMode, setInputMode] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [detectedDuration, setDetectedDuration] = useState(30);

  // Confirm Delete Dialog
  const [deleteId, setDeleteId] = useState(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    videoUrl: '',
    thumbnailUrl: '',
    duration: 30,
    tag: 'Studio Tour',
    isFeatured: true,
    isActive: true,
    order: 0,
  });

  const fileInputRef = useRef(null);
  const videoPreviewRef = useRef(null);

  // Fetch all videos
  const fetchVideos = async () => {
    setLoading(true);
    try {
      const res = await jamRoomVideoService.getAdminVideos();
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      toast.error('Failed to load Jam Room short videos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  // Open Create Modal
  const handleOpenCreate = () => {
    setEditingVideo(null);
    setInputMode('upload');
    setSelectedFile(null);
    setPreviewUrl('');
    setUploadProgress(0);
    setFormData({
      title: '',
      description: '',
      videoUrl: '',
      thumbnailUrl: '',
      duration: 30,
      tag: 'Studio Tour',
      isFeatured: true,
      isActive: true,
      order: videos.length + 1,
    });
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (vid) => {
    setEditingVideo(vid);
    setInputMode(vid.videoUrl?.startsWith('/uploads/') ? 'upload' : 'url');
    setSelectedFile(null);
    setPreviewUrl(vid.videoUrl || '');
    setUploadProgress(0);
    setFormData({
      title: vid.title,
      description: vid.description || '',
      videoUrl: vid.videoUrl,
      thumbnailUrl: vid.thumbnailUrl || '',
      duration: vid.duration || 30,
      tag: vid.tag || 'Studio Tour',
      isFeatured: Boolean(vid.isFeatured),
      isActive: Boolean(vid.isActive),
      order: vid.order || 0,
    });
    setIsModalOpen(true);
  };

  // Handle local video file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file (.mp4, .webm, .mov)');
      return;
    }

    if (file.size > 150 * 1024 * 1024) {
      toast.error('Video file exceeds maximum size limit (150 MB).');
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Auto-detect video duration
    const tempVideo = document.createElement('video');
    tempVideo.preload = 'metadata';
    tempVideo.onloadedmetadata = () => {
      window.URL.revokeObjectURL(tempVideo.src);
      const dur = Math.round(tempVideo.duration);
      setDetectedDuration(dur);
      setFormData((prev) => ({
        ...prev,
        duration: dur,
        title: prev.title || file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' '),
      }));
      if (dur > 35) {
        toast.info(`Note: Video duration is ${dur}s. Recommended short video duration is ~30s.`);
      }
    };
    tempVideo.src = objectUrl;
  };

  // Submit create / edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error('Please provide a title for the short video.');
      return;
    }

    if (inputMode === 'url' && !formData.videoUrl.trim()) {
      toast.error('Please provide a direct video URL.');
      return;
    }

    if (inputMode === 'upload' && !selectedFile && !editingVideo) {
      toast.error('Please choose a video file to upload.');
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const payload = new FormData();
      payload.append('title', formData.title.trim());
      payload.append('description', formData.description.trim());
      payload.append('thumbnailUrl', formData.thumbnailUrl.trim());
      payload.append('duration', formData.duration || 30);
      payload.append('tag', formData.tag);
      payload.append('isFeatured', formData.isFeatured);
      payload.append('isActive', formData.isActive);
      payload.append('order', formData.order || 0);

      if (selectedFile) {
        payload.append('video', selectedFile);
      } else if (inputMode === 'url') {
        payload.append('videoUrl', formData.videoUrl.trim());
      }

      if (editingVideo) {
        const res = await jamRoomVideoService.updateVideo(
          editingVideo._id,
          payload,
          (percent) => setUploadProgress(percent)
        );
        if (res.success) {
          toast.success('Jam Room short video updated successfully! ✨');
          setIsModalOpen(false);
          fetchVideos();
        }
      } else {
        const res = await jamRoomVideoService.createVideo(
          payload,
          (percent) => setUploadProgress(percent)
        );
        if (res.success) {
          toast.success('Jam Room 30s short video published successfully! 🎬');
          setIsModalOpen(false);
          fetchVideos();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save short video.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  // Delete Action
  const handleDelete = (id) => {
    setDeleteId(id);
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    try {
      const res = await jamRoomVideoService.deleteVideo(deleteId);
      if (res.success) {
        toast.success('Jam Room short video deleted.');
        fetchVideos();
      }
    } catch (err) {
      toast.error('Failed to delete video.');
    } finally {
      setIsConfirmOpen(false);
      setDeleteId(null);
    }
  };

  // Toggle active status directly
  const handleToggleActive = async (vid) => {
    try {
      const res = await jamRoomVideoService.updateVideo(vid._id, {
        isActive: !vid.isActive,
      });
      if (res.success) {
        toast.success(`Video marked as ${!vid.isActive ? 'Active' : 'Hidden'}.`);
        setVideos((prev) =>
          prev.map((v) => (v._id === vid._id ? { ...v, isActive: !vid.isActive } : v))
        );
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // Stats calculation
  const totalViews = videos.reduce((acc, v) => acc + (v.viewsCount || 0), 0);
  const totalLikes = videos.reduce((acc, v) => acc + (v.likesCount || 0), 0);
  const activeCount = videos.filter((v) => v.isActive).length;

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Film className="w-5 h-5" />
            </span>
            <h1 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
              Jam Room 30-Second Short Videos
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Curate and upload 30-second short videos/reels showcasing the Jam Room, drum isolation,
            amps, acoustics, and live rehearsal soundchecks.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-black text-xs sm:text-sm shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto hover:scale-105 active:scale-95 shimmer-btn"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add 30s Short Video</span>
        </button>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total 30s Shorts
          </span>
          <div className="text-2xl font-display font-black text-white">{videos.length}</div>
          <p className="text-[10px] text-amber-300 font-medium">Jam Room Video Reels</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Total Views
          </span>
          <div className="text-2xl font-display font-black text-emerald-400">{totalViews}</div>
          <p className="text-[10px] text-slate-400 font-medium">Student Video Plays</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Musician Likes
          </span>
          <div className="text-2xl font-display font-black text-rose-400">{totalLikes}</div>
          <p className="text-[10px] text-slate-400 font-medium">Community Engagement</p>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/5 space-y-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Published Active
          </span>
          <div className="text-2xl font-display font-black text-amber-400">{activeCount}</div>
          <p className="text-[10px] text-slate-400 font-medium">Live on Jam Room Page</p>
        </div>
      </div>

      {/* Videos List / Grid */}
      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          Loading short videos...
        </div>
      ) : videos.length === 0 ? (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-4 border border-white/5 max-w-md mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
            <Film className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-white text-base">No 30-Second Shorts Added Yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload your first 30-second rehearsal short, drum kit walkthrough, or audio console demo
              to showcase the Jam Room.
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenCreate}
            className="px-5 py-2.5 rounded-xl bg-amber-400 text-dark-950 font-bold text-xs shadow-glow-yellow hover:bg-amber-300 transition-all cursor-pointer"
          >
            Add First Short Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {videos.map((vid) => (
            <div
              key={vid._id}
              className={`rounded-3xl overflow-hidden glass-panel border transition-all flex flex-col justify-between group ${
                vid.isActive
                  ? 'border-white/10 hover:border-amber-400/40 hover:shadow-glow-yellow/15'
                  : 'border-white/5 opacity-60'
              }`}
            >
              {/* Card Video Header */}
              <div className="relative aspect-[9/12] bg-dark-950 overflow-hidden">
                <video
                  src={vid.videoUrl}
                  poster={vid.thumbnailUrl || '/gallery/sound_treated_live_room.png'}
                  muted
                  loop
                  playsInline
                  onMouseEnter={(e) => e.target.play().catch(() => {})}
                  onMouseLeave={(e) => {
                    e.target.pause();
                    e.target.currentTime = 0;
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1">
                  <span className="px-2.5 py-1 rounded-full bg-dark-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-black uppercase flex items-center gap-1 shadow-md">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>{vid.duration || 30}s</span>
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      vid.isActive
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {vid.isActive ? 'Active' : 'Hidden'}
                  </span>
                </div>

                {/* Category Pill */}
                <div className="absolute bottom-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-slate-300 text-[10px] font-bold">
                    {vid.tag}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-display font-bold text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2">
                    {vid.title}
                  </h3>
                  {vid.description && (
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {vid.description}
                    </p>
                  )}
                </div>

                {/* Metrics */}
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{vid.viewsCount || 0}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-500/30" />
                      <span>{vid.likesCount || 0}</span>
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">#{vid.order || 0}</span>
                </div>

                {/* Admin Actions */}
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => handleToggleActive(vid)}
                    className="text-[11px] font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {vid.isActive ? 'Hide' : 'Publish'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(vid)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-amber-300 transition-colors cursor-pointer"
                      title="Edit Short Video"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(vid._id)}
                      className="p-1.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                      title="Delete Video"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal for Creating & Editing 30s Short Videos */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingVideo ? 'Edit Jam Room Short Video' : 'Add 30-Second Jam Room Short Video'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/5 border border-white/5">
            <button
              type="button"
              onClick={() => setInputMode('upload')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Video File (MP4/WebM)</span>
            </button>
            <button
              type="button"
              onClick={() => setInputMode('url')}
              className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                inputMode === 'url'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 shadow-glow-yellow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Direct Video URL</span>
            </button>
          </div>

          {/* Upload Area */}
          {inputMode === 'upload' ? (
            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg,video/quicktime,video/mov"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/20 hover:border-amber-400/60 rounded-2xl p-6 text-center cursor-pointer transition-all bg-white/[0.02] hover:bg-amber-500/5 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                  <FileVideo className="w-6 h-6" />
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">
                  {selectedFile ? selectedFile.name : 'Click to select 30s video file'}
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Supports .mp4, .webm, .mov • Up to 150 MB • Recommended: 30 seconds
                </p>
                {selectedFile && (
                  <div className="mt-2 text-xs font-semibold text-emerald-400 flex items-center justify-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>File selected ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Direct Video Stream URL *</label>
              <input
                type="url"
                required
                value={formData.videoUrl}
                onChange={(e) => {
                  setFormData({ ...formData, videoUrl: e.target.value });
                  setPreviewUrl(e.target.value);
                }}
                placeholder="https://cdn.pixabay.com/video/.../video.mp4"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
              <p className="text-[10px] text-slate-500">
                Direct MP4/WebM URL from your CDN, AWS S3, or media host.
              </p>
            </div>
          )}

          {/* Video Preview Player inside modal */}
          {previewUrl && (
            <div className="rounded-2xl overflow-hidden border border-white/10 bg-dark-950 p-2 space-y-1">
              <div className="text-[11px] font-bold text-amber-300 flex items-center justify-between px-2 py-1">
                <span className="flex items-center gap-1.5">
                  <Play className="w-3 h-3 text-amber-400" /> Live Short Video Preview
                </span>
                <span className="text-[10px] text-slate-400">{formData.duration}s target duration</span>
              </div>
              <div className="aspect-[16/9] sm:aspect-[21/9] max-h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <video
                  ref={videoPreviewRef}
                  src={previewUrl}
                  controls
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {/* Title & Tag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Short Video Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Mapex Drum Kit Isolation & Soundcheck"
                className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Category Tag</label>
              <select
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-dark-900 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                {TAG_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description / Caption */}
          <div className="space-y-1">
            <label className="font-semibold text-slate-300">Description / What is Featured</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. Quick walkthrough of the isolated drum room, showing dynamic mics and sound absorption..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Duration & Order & Thumbnail */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Duration (Seconds)</label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-[10px]">
                  sec
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Display Order</label>
              <input
                type="number"
                value={formData.order}
                onChange={(e) => setFormData({ ...formData, order: Number(e.target.value) })}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-300">Thumbnail Poster (Opt)</label>
              <input
                type="text"
                value={formData.thumbnailUrl}
                onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
                placeholder="/gallery/sound_treated_live_room.png"
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-white/10">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-dark-900 border-white/20"
              />
              <span className="text-xs font-semibold text-white">Active / Published</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isFeatured}
                onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                className="w-4 h-4 rounded text-amber-500 focus:ring-0 bg-dark-900 border-white/20"
              />
              <span className="text-xs font-semibold text-white">Featured Spotlight</span>
            </label>
          </div>

          {/* Upload Progress Bar */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-1 py-1">
              <div className="flex items-center justify-between text-[11px] text-amber-300">
                <span>Uploading Video File...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 rounded-full bg-dark-900 overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-all cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
                  <span>Saving Short Video...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{editingVideo ? 'Update Video' : 'Publish Short Video'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Short Video"
        message="Are you sure you want to permanently delete this 30-second Jam Room short video? This action cannot be undone."
        confirmText="Delete Short Video"
        type="danger"
      />
    </div>
  );
};

export default AdminVideosPage;
