import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jamRoomVideoService } from '../../services/jamRoomVideoService';
import { SoundVisualizer } from '../common/SoundVisualizer';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Heart,
  Eye,
  ChevronLeft,
  ChevronRight,
  X,
  Film,
  Sparkles,
  Radio,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const TAG_FILTERS = [
  'ALL',
  'Studio Tour',
  'Drum Kit',
  'Guitars & Amps',
  'Mixing Console',
  'Acoustics',
];

export const JamRoomShorts = ({ title, subtitle, showBookButton = true }) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTag, setSelectedTag] = useState('ALL');
  const [activeReelIndex, setActiveReelIndex] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [likedMap, setLikedMap] = useState({});
  const [hoveredVideoId, setHoveredVideoId] = useState(null);
  const [progress, setProgress] = useState(0);

  const modalVideoRef = useRef(null);

  // Fetch public short videos
  const fetchVideos = async () => {
    try {
      const res = await jamRoomVideoService.getVideos({
        tag: selectedTag !== 'ALL' ? selectedTag : undefined,
      });
      if (res.success && res.data) {
        setVideos(res.data);
      }
    } catch (err) {
      console.error('Failed to load Jam Room short videos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedTag]);

  // Open reel modal
  const handleOpenReel = (index) => {
    setActiveReelIndex(index);
    setIsPlaying(true);
    setProgress(0);

    const video = videos[index];
    if (video) {
      jamRoomVideoService.viewVideo(video._id).catch(() => {});
      // Increment local count
      setVideos((prev) =>
        prev.map((v, i) => (i === index ? { ...v, viewsCount: (v.viewsCount || 0) + 1 } : v))
      );
    }
  };

  // Close reel modal
  const handleCloseReel = () => {
    setActiveReelIndex(null);
    setProgress(0);
  };

  // Next / Previous Reel Navigation
  const handleNextReel = () => {
    if (videos.length === 0) return;
    const nextIdx = (activeReelIndex + 1) % videos.length;
    handleOpenReel(nextIdx);
  };

  const handlePrevReel = () => {
    if (videos.length === 0) return;
    const prevIdx = (activeReelIndex - 1 + videos.length) % videos.length;
    handleOpenReel(prevIdx);
  };

  // Like video
  const handleLike = async (e, videoId) => {
    e.stopPropagation();
    if (likedMap[videoId]) return;

    setLikedMap((prev) => ({ ...prev, [videoId]: true }));
    setVideos((prev) =>
      prev.map((v) => (v._id === videoId ? { ...v, likesCount: (v.likesCount || 0) + 1 } : v))
    );

    try {
      await jamRoomVideoService.likeVideo(videoId);
    } catch (err) {
      console.error('Failed to register like:', err);
    }
  };

  // Keyboard navigation inside lightbox
  useEffect(() => {
    if (activeReelIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleCloseReel();
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') handleNextReel();
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') handlePrevReel();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeReelIndex, videos.length, isPlaying]);

  // Video progress tracking
  const handleTimeUpdate = () => {
    if (modalVideoRef.current) {
      const current = modalVideoRef.current.currentTime;
      const total = modalVideoRef.current.duration || 30;
      setProgress((current / total) * 100);
    }
  };

  const togglePlayPause = () => {
    if (!modalVideoRef.current) return;
    if (modalVideoRef.current.paused) {
      modalVideoRef.current.play();
      setIsPlaying(true);
    } else {
      modalVideoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const scrollToCalendar = () => {
    handleCloseReel();
    const calendarEl = document.getElementById('booking-calendar');
    if (calendarEl) {
      calendarEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentReel = activeReelIndex !== null ? videos[activeReelIndex] : null;

  if (!loading && videos.length === 0 && selectedTag === 'ALL') {
    return null;
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Refined Section Header & Filter Controls */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-glow-yellow">
              <Film className="w-3.5 h-3.5 text-amber-400" />
              <span>Studio Shorts • 30 Seconds</span>
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            </div>
            <h2 className="text-2xl sm:text-4xl font-display font-extrabold text-white tracking-tight leading-tight">
              {title || 'Inside the Studio: 30-Second Shorts'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {subtitle ||
                'Quick acoustic walkthroughs, drum isolation checks, amplifier signal paths, and live soundcheck reels at Academic Block 3.'}
            </p>
          </div>

          {/* Minimalist Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0 p-1 rounded-2xl bg-white/5 border border-white/5">
            {TAG_FILTERS.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedTag === tag
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 font-bold shadow-glow-yellow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {tag === 'ALL' ? 'All Shorts' : tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Videos Grid (Cinematic 4:5 Aspect Ratio) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[4/5] rounded-3xl bg-white/5 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-10 rounded-3xl glass-panel text-center text-slate-400 text-xs border border-white/5 space-y-2">
          <Film className="w-8 h-8 text-amber-400/60 mx-auto" />
          <p className="font-semibold text-white">No short videos found in this category.</p>
          <p className="text-[11px] text-slate-500">Switch categories to view other Jam Room reels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {videos.map((video, idx) => {
            const isHovered = hoveredVideoId === video._id;
            const isLiked = likedMap[video._id];

            return (
              <motion.div
                key={video._id}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="group relative rounded-3xl overflow-hidden border border-white/10 hover:border-amber-400/50 hover:shadow-glow-yellow/20 bg-dark-900 transition-all cursor-pointer aspect-[4/5] flex flex-col justify-between shadow-2xl select-none"
                onClick={() => handleOpenReel(idx)}
                onMouseEnter={() => setHoveredVideoId(video._id)}
                onMouseLeave={() => setHoveredVideoId(null)}
              >
                {/* 1. Full-Bleed High-Res Poster Image (Always 100% Covers Card) */}
                <img
                  src={video.thumbnailUrl || '/gallery/sound_treated_live_room.png'}
                  alt={video.title}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    e.target.src = '/gallery/sound_treated_live_room.png';
                  }}
                />

                {/* 2. Live Video Preview Layer (Smoothly fades in and plays on hover) */}
                {video.videoUrl && (
                  <video
                    src={video.videoUrl}
                    muted
                    loop
                    playsInline
                    preload="none"
                    ref={(el) => {
                      if (el) {
                        if (isHovered) {
                          el.play().catch(() => {});
                        } else {
                          el.pause();
                          el.currentTime = 0;
                        }
                      }
                    }}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />
                )}

                {/* 3. Deep Cinematic Scrim Gradient (Ensures high contrast & readability) */}
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/40 to-black/30 group-hover:from-dark-950/95 transition-all duration-300" />

                {/* 4. Top Badges Row */}
                <div className="relative z-10 p-4 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    {/* 30s Recording Pill */}
                    <span className="px-2.5 py-1 rounded-full bg-dark-950/85 backdrop-blur-md border border-white/15 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <span>{video.duration || 30}s</span>
                    </span>

                    {/* Category Pill */}
                    <span className="px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/10 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-sm truncate max-w-[110px]">
                      {video.tag}
                    </span>
                  </div>

                  {/* Equalizer Wave Badge */}
                  <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <SoundVisualizer barsCount={3} barColor="bg-amber-400" />
                  </div>
                </div>

                {/* 5. Center Centered Glassmorphic Play Button */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="w-14 h-14 rounded-full bg-dark-950/60 backdrop-blur-md border border-white/25 text-white flex items-center justify-center shadow-2xl transition-all duration-300 group-hover:scale-115 group-hover:bg-amber-400 group-hover:text-dark-950 group-hover:border-amber-300 group-hover:shadow-glow-yellow">
                    <Play className="w-5 h-5 fill-current translate-x-0.5" />
                  </div>
                </div>

                {/* 6. Bottom Meta Information (Pinned to bottom) */}
                <div className="relative z-10 p-4 sm:p-5 pt-10 space-y-2 bg-gradient-to-t from-dark-950 via-dark-950/90 to-transparent">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold tracking-widest uppercase text-amber-400/90 block">
                      {video.tag}
                    </span>
                    <h3 className="font-display font-black text-sm sm:text-base text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-[11px] text-slate-300 line-clamp-1 leading-relaxed opacity-85">
                        {video.description}
                      </p>
                    )}
                  </div>

                  {/* Footer Metrics */}
                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/10">
                    <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                      <Eye className="w-3.5 h-3.5 text-amber-400" />
                      <span>{video.viewsCount || 0} views</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleLike(e, video._id)}
                      className="flex items-center gap-1.5 text-slate-300 hover:text-rose-400 font-medium transition-colors cursor-pointer group/btn"
                      title="Like this short"
                    >
                      <Heart
                        className={`w-3.5 h-3.5 transition-transform group-hover/btn:scale-125 ${
                          isLiked ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                        }`}
                      />
                      <span className={isLiked ? 'text-rose-400 font-bold' : ''}>
                        {video.likesCount || 0}
                      </span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Interactive Fullscreen Reel Viewer Lightbox */}
      <AnimatePresence>
        {activeReelIndex !== null && currentReel && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-dark-950/95 backdrop-blur-2xl">
            {/* Backdrop Dismiss Click */}
            <div className="absolute inset-0" onClick={handleCloseReel} />

            {/* Navigation Previous Button (Desktop) */}
            <button
              type="button"
              onClick={handlePrevReel}
              title="Previous Short (Left Arrow)"
              className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-amber-500 hover:text-dark-950 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Navigation Next Button (Desktop) */}
            <button
              type="button"
              onClick={handleNextReel}
              title="Next Short (Right Arrow)"
              className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-amber-500 hover:text-dark-950 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Shorts Reel Container */}
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-[420px] sm:max-w-[440px] h-[90vh] max-h-[820px] rounded-3xl overflow-hidden bg-black border-2 border-amber-500/40 shadow-glow-yellow/30 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Progress Bar (30s countdown timeline) */}
              <div className="absolute top-0 left-0 right-0 z-30 h-1 bg-white/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Top Header Actions Overlay */}
              <div className="absolute top-1 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-dark-950/90 to-transparent">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-dark-950/90 backdrop-blur-md border border-amber-500/50 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>30s Jam Room Short</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-white text-[10px] font-semibold">
                    {activeReelIndex + 1} / {videos.length}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Sound Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsMuted(!isMuted)}
                    className="p-2 rounded-full bg-dark-950/80 hover:bg-dark-950 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
                    title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4 text-rose-400" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>

                  {/* Close Lightbox */}
                  <button
                    type="button"
                    onClick={handleCloseReel}
                    className="p-2 rounded-full bg-dark-950/80 hover:bg-dark-950 text-white border border-white/10 backdrop-blur-md transition-all cursor-pointer"
                    title="Close (Esc)"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* The Video Player Element */}
              <div
                className="relative flex-1 w-full h-full bg-black flex items-center justify-center cursor-pointer overflow-hidden"
                onClick={togglePlayPause}
              >
                <video
                  ref={modalVideoRef}
                  src={currentReel.videoUrl}
                  poster={currentReel.thumbnailUrl || '/gallery/sound_treated_live_room.png'}
                  autoPlay
                  playsInline
                  loop
                  muted={isMuted}
                  onTimeUpdate={handleTimeUpdate}
                  className="w-full h-full object-cover"
                />

                {/* Big Center Pause Indicator when paused */}
                {!isPlaying && (
                  <div className="absolute inset-0 bg-dark-950/40 backdrop-blur-xs flex items-center justify-center z-20">
                    <div className="w-16 h-16 rounded-full bg-amber-400/90 text-dark-950 flex items-center justify-center shadow-glow-yellow">
                      <Play className="w-8 h-8 fill-dark-950 translate-x-0.5 text-dark-950" />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Interactive Reel Overlay Bar */}
              <div className="absolute bottom-0 left-0 right-0 z-30 p-5 bg-gradient-to-t from-dark-950 via-dark-950/95 to-transparent space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-amber-300 uppercase tracking-wider block">
                      #{currentReel.tag}
                    </span>
                    <h3 className="font-display font-black text-base sm:text-lg text-white leading-tight truncate">
                      {currentReel.title}
                    </h3>
                    {currentReel.description && (
                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {currentReel.description}
                      </p>
                    )}
                  </div>

                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={(e) => handleLike(e, currentReel._id)}
                    className="flex flex-col items-center gap-1 p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer shrink-0"
                  >
                    <Heart
                      className={`w-5 h-5 transition-transform active:scale-125 ${
                        likedMap[currentReel._id] ? 'fill-rose-500 text-rose-500' : 'text-white'
                      }`}
                    />
                    <span className="text-[10px] font-bold">{currentReel.likesCount || 0}</span>
                  </button>
                </div>

                {/* Quick Action: Direct Book Jam Room Pass */}
                {showBookButton && (
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={scrollToCalendar}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-dark-950 font-black text-xs shadow-glow-yellow flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shimmer-btn"
                    >
                      <Radio className="w-3.5 h-3.5 text-dark-950 animate-pulse" />
                      <span>Book Jam Room Session</span>
                      <ArrowRight className="w-3.5 h-3.5 text-dark-950 stroke-[3]" />
                    </button>
                  </div>
                )}

                {/* Mobile Navigation controls */}
                <div className="flex md:hidden items-center justify-between pt-1 border-t border-white/10 text-xs text-slate-400">
                  <button
                    type="button"
                    onClick={handlePrevReel}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev Short
                  </button>
                  <button
                    type="button"
                    onClick={handleNextReel}
                    className="flex items-center gap-1 hover:text-white"
                  >
                    Next Short <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
