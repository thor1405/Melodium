import React, { useState, useRef, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, Film } from 'lucide-react';

export const BackgroundVideoPlayer = ({
  videoUrl = 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4',
  videoTitle = 'Melodium SJEC Jam Session',
  opacity = 0.45,
  enabled = true,
  showControls = true,
}) => {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoError, setVideoError] = useState(false);
  const videoRef = useRef(null);

  // Reliable default music performance video stream if none provided
  const activeVideoUrl =
    videoUrl || 'https://cdn.pixabay.com/video/2016/09/13/4998-183792019_large.mp4';

  // Extract YouTube ID if applicable
  const getYouTubeId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const youtubeId = getYouTubeId(activeVideoUrl);

  // Force autoplay on mount and when videoUrl changes
  useEffect(() => {
    setVideoError(false);
    if (videoRef.current && !youtubeId) {
      videoRef.current.muted = true;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch((err) => {
            console.log('Autoplay interaction policy:', err);
          });
      }
    }
  }, [activeVideoUrl, youtubeId]);

  if (!enabled) return null;

  const toggleSound = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(videoRef.current.muted);
    } else {
      setIsMuted(!isMuted);
    }
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
      {/* Video Stream Layer */}
      {youtubeId ? (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
          style={{ opacity: Math.max(0.35, opacity) }}
        >
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&loop=1&playlist=${youtubeId}&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1`}
            title={videoTitle}
            className="w-[300%] h-[300%] -top-[100%] -left-[100%] absolute pointer-events-none border-0 object-cover"
            allow="autoplay; encrypted-media"
          />
        </div>
      ) : (
        <video
          ref={videoRef}
          key={activeVideoUrl}
          autoPlay
          loop
          muted={isMuted}
          playsInline
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-700 filter brightness-100 contrast-105"
          style={{ opacity: Math.max(0.35, opacity) }}
        >
          <source src={activeVideoUrl} type="video/mp4" />
          <source src="https://media.w3.org/2010/05/sintel/trailer.mp4" type="video/mp4" />
        </video>
      )}

      {/* Gentle Vignette Overlays for readability and seamless edge blending */}
      <div className="absolute inset-0 bg-gradient-to-b from-dark-950/60 via-dark-950/30 to-dark-950 pointer-events-none" />
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-dark-950 via-dark-950/90 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-dark-950/50 pointer-events-none" />

      {/* Floating Sound & Video Controls (Interactive) */}
      {showControls && (
        <div className="absolute bottom-6 right-6 z-30 pointer-events-auto flex items-center gap-2">
          {videoTitle && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-dark-900/90 backdrop-blur-md border border-white/10 text-[11px] text-slate-300 shadow-xl">
              <Film className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="font-semibold text-white truncate max-w-[200px]">{videoTitle}</span>
            </div>
          )}

          {!youtubeId && (
            <button
              type="button"
              onClick={togglePlayback}
              title={isPlaying ? 'Pause Background Video' : 'Play Background Video'}
              className="p-2.5 rounded-full bg-dark-900/90 hover:bg-dark-850 backdrop-blur-md border border-white/10 text-slate-300 hover:text-amber-400 transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          )}

          <button
            type="button"
            onClick={toggleSound}
            title={isMuted ? 'Unmute Live Audio' : 'Mute Audio'}
            className="p-2.5 rounded-full bg-dark-900/90 hover:bg-dark-850 backdrop-blur-md border border-white/10 text-slate-300 hover:text-amber-400 transition-all shadow-xl hover:scale-105 active:scale-95"
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-slate-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
          </button>
        </div>
      )}
    </div>
  );
};
