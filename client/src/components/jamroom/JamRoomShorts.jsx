import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { jamRoomVideoService } from '../../services/jamRoomVideoService';
import { SpotlightCard } from '../common/SpotlightCard';
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
    return null; // Don't render empty section if no videos yet
  }

  return (
    <section className="space-y-6 sm:space-y-8">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-glow-yellow">
            <Film className="w-3.5 h-3.5" />
            <span>30-Second Jam Room Shorts</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-white tracking-tight">
            {title || 'Experience the Jam Room in 30 Seconds'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            {subtitle ||
              'Watch quick 30-second studio tours, drum isolation breakdowns, amplifier line checks, and Lionel live console routing at Academic Block 3.'}
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar shrink-0">
          {TAG_FILTERS.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-dark-950 font-bold shadow-glow-yellow'
                  : 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {tag === 'ALL' ? 'All Shorts' : tag}
            </button>
          ))}
        </div>
      </div>

      {/* Videos Grid (Portrait 9:16 Shorts format) */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="aspect-[9/16] rounded-3xl bg-white/5 animate-pulse border border-white/5"
            />
          ))}
        </div>
      ) : videos.length === 0 ? (
        <div className="p-8 sm:p-12 rounded-3xl glass-panel text-center text-slate-400 text-xs border border-white/5 space-y-2">
          <Film className="w-8 h-8 text-amber-400/60 mx-auto" />
          <p className="font-semibold text-white">No short videos found in this category.</p>
          <p className="text-[11px] text-slate-500">Switch categories to view other Jam Room reels.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 items-stretch">
          {videos.map((video, idx) => {
            const isHovered = hoveredVideoId === video._id;
            const isLiked = likedMap[video._id];

            return (
              <SpotlightCard
                key={video._id}
                spotlightColor="rgba(245, 158, 11, 0.2)"
                className="group relative rounded-3xl overflow-hidden glass-panel border border-white/10 hover:border-amber-400/50 hover:shadow-glow-yellow/20 transition-all cursor-pointer flex flex-col justify-between aspect-[9/15] sm:aspect-[9/16] select-none"
                onClick={() => handleOpenReel(idx)}
                onMouseEnter={() => setHoveredVideoId(video._id)}
                onMouseLeave={() => setHoveredVideoId(null)}
              >
                {/* Background Video / Thumbnail Preview */}
                <div className="absolute inset-0 bg-dark-950 overflow-hidden">
                  <video
                    src={video.videoUrl}
                    poster={video.thumbnailUrl || '/gallery/sound_treated_live_room.png'}
                    muted
                    loop
                    playsInline
                    preload="metadata"
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
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/30 to-dark-950/40 opacity-90 group-hover:opacity-80 transition-opacity" />
                </div>

                {/* Top Badges */}
                <div className="relative z-10 p-3 sm:p-4 flex items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{video.duration || 30}s</span>
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-slate-300 text-[10px] font-bold truncate max-w-[85px] sm:max-w-[100px]">
                      {video.tag}
                    </span>
                  </div>

                  {/* Soundwave Animation on Hover */}
                  <div className="opacity-70 group-hover:opacity-100 transition-opacity">
                    <SoundVisualizer barsCount={3} barColor="bg-amber-400" />
                  </div>
                </div>

                {/* Center Big Play Button Overlay */}
                <div className="relative z-10 self-center my-auto transition-transform duration-300 group-hover:scale-115">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-amber-400/90 text-dark-950 flex items-center justify-center shadow-glow-yellow backdrop-blur-md border border-amber-300/50">
                    <Play className="w-6 h-6 fill-dark-950 translate-x-0.5 text-dark-950" />
                  </div>
                </div>

                {/* Bottom Video Meta */}
                <div className="relative z-10 p-3 sm:p-4 space-y-2 bg-gradient-to-t from-dark-950 via-dark-950/90 to-transparent pt-6">
                  <h3 className="font-display font-extrabold text-xs sm:text-sm text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug">
                    {video.title}
                  </h3>

                  {video.description && (
                    <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1">
                      {video.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-white/10">
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3 text-amber-400" />
                      <span>{video.viewsCount || 0}</span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleLike(e, video._id)}
                      className="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer group/btn"
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
              </SpotlightCard>
            );
          })}
        </div>
      )}

      {/* Interactive Fullscreen Reel Viewer Modal */}
      <AnimatePresence>
        {activeReelIndex !== null && currentReel && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-dark-950/95 backdrop-blur-2xl">
            {/* Backdrop Dismiss Click */}
            <div className="absolute inset-0" onClick={handleCloseReel} />

            {/* Navigation Previous Button (Desktop) */}
            <button
              type="button"
              onClick={handlePrevReel}
              title="Previous Short (Left Arrow)"
              className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-amber-500 hover:text-dark-950 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            {/* Navigation Next Button (Desktop) */}
            <button
              type="button"
              onClick={handleNextReel}
              title="Next Short (Right Arrow)"
              className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-white/10 hover:bg-amber-500 hover:text-dark-950 text-white backdrop-blur-md border border-white/10 items-center justify-center transition-all hover:scale-110 cursor-pointer shadow-2xl"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Main Shorts Reel Container */}
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 20 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 w-full max-w-[420px] sm:max-w-[460px] h-[92vh] max-h-[850px] rounded-3xl overflow-hidden bg-black border-2 border-amber-500/40 shadow-glow-yellow/30 flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Progress Bar (30s countdown timeline) */}
              <div className="absolute top-0 left-0 right-0 z-30 h-1.5 bg-white/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-yellow-400 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Top Header Actions Overlay */}
              <div className="absolute top-2 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-dark-950/80 to-transparent">
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
                    className="flex flex-col items-center gap-1 p-2 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all cursor-pointer shrink-0"
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
