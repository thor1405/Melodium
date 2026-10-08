import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundVideoPlayer } from '../../components/common/BackgroundVideoPlayer';
import { GalleryLightbox } from '../../components/cms/GalleryLightbox';
import { TeamCard } from '../../components/cms/TeamCard';
import { cmsService } from '../../services/cmsService';
import { bookingService } from '../../services/bookingService';
import {
  Music2,
  Radio,
  Calendar,
  Sparkles,
  ArrowRight,
  Disc3,
  Mic2,
  Sliders,
  ShieldCheck,
  CheckCircle2,
  Volume2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const [gallery, setGallery] = useState([]);
  const [team, setTeam] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [galleryRes, teamRes, settingsRes] = await Promise.all([
          cmsService.getGallery({ featured: 'true' }),
          cmsService.getTeam(),
          bookingService.getBookingSettings(),
        ]);

        if (galleryRes.success) setGallery(galleryRes.data.slice(0, 3));
        if (teamRes.success) setTeam(teamRes.data.slice(0, 3));
        if (settingsRes.success) setSettings(settingsRes.data);
      } catch (err) {
        console.error('Failed to load homepage assets:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  return (
    <div className="space-y-24 sm:space-y-32 pb-24 relative">
      {/* 1. CINEMATIC HERO SECTION (FULL-BLEED SEAMLESS VIDEO BACKDROP) */}
      <section className="relative w-full -mt-20 pt-36 sm:pt-44 pb-24 sm:pb-32 overflow-hidden">
        {/* Dynamic Ambient Background Video Player (Configured via Admin Dashboard) */}
        <BackgroundVideoPlayer
          videoUrl={settings?.heroVideoUrl || 'https://www.youtube.com/watch?v=kYxRk57QoZg'}
          videoTitle={settings?.heroVideoTitle || 'Melodium Live Jam Session'}
          opacity={settings?.heroVideoOpacity ?? 0.55}
          enabled={settings?.heroVideoEnabled ?? true}
          showControls={true}
        />

        <div className="relative z-10 text-center space-y-6 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600/20 via-yellow-500/15 to-transparent border border-amber-500/30 backdrop-blur-md shadow-inner"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span className="text-xs font-bold tracking-widest uppercase text-amber-300">
              MELODIUM STUDIO
            </span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display font-extrabold text-4xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.1]"
          >
            Where Music <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 bg-clip-text text-transparent text-glow-yellow">
              Finds Its Voice.
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Melodium is the heartbeat of SJEC's musical culture — an elite community of vocalists, instrumentalists, sound designers, and live performers collaborating, jamming, and headlining university stages.
          </motion.p>

          {/* Hero CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <Link
              to="/jam-room"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-sm shadow-glow-yellow transition-all hover:scale-105 active:scale-95"
            >
              <Radio className="w-4 h-4 text-dark-950 animate-pulse" />
              <span>Book Jam Room Studio</span>
            </Link>

            <Link
              to="/gallery"
              className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl glass-panel-grey hover:bg-white/10 text-white font-semibold text-sm border border-white/15 transition-all hover:scale-105 active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Explore Performance Gallery</span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 2. JAM ROOM STUDIO 1 SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-amber-500/25 p-8 sm:p-12">
          {/* Background art */}
          <div className="absolute top-0 right-0 w-full sm:w-1/2 h-full opacity-25 pointer-events-none overflow-hidden">
            <img
              src="/gallery/sound_treated_live_room.png"
              alt="Melodium SJEC Jam Room Studio"
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-dark-950 via-dark-950/60 to-transparent" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 text-xs font-bold uppercase">
              <Radio className="w-3.5 h-3.5 animate-pulse" />
              <span>Dedicated University Jam Room</span>
            </div>

            <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
              Studio-Grade Gear. <br />
              <span className="text-amber-400">Instant 1-Hour Slots.</span>
            </h2>

            <p className="text-slate-300 text-sm leading-relaxed">
              Equipped with a Pearl acoustic drum kit, high-gain Marshall half-stacks, Fender Twin Reverbs, Ampeg bass amplification, stage pianos, and Shure microphones — our sound-treated Jam Room is ready for your rehearsals.
            </p>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Real-time availability & instant pass</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Strict double-booking prevention</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Acoustically isolated room</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Multi-mic drum recording setup</span>
              </div>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                to="/jam-room"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all"
              >
                Book a Slot for Today
              </Link>
              <Link
                to="/about#jam-room-rules"
                className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-all"
              >
                Read Studio Guidelines
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PERFORMANCE GALLERY PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Visual Memories
            </span>
            <h2 className="text-3xl font-display font-extrabold text-white mt-1">
              Live Performance Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline transition-colors"
          >
            <span>Explore Full Photo Wall</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <GalleryLightbox items={gallery} />
      </section>

      {/* 6. MEET THE TEAM PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Leadership & Artists
            </span>
            <h2 className="text-3xl font-display font-extrabold text-white mt-1">
              Meet the Core Committee
            </h2>
          </div>
          <Link
            to="/team"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline transition-colors"
          >
            <span>Meet All Members & Faculty</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <TeamCard key={member._id} member={member} />
          ))}
        </div>
      </section>

      {/* 7. JOIN COMMUNITY CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-10 sm:p-14 bg-gradient-to-r from-amber-950/40 via-dark-900 to-black border border-amber-500/30 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400">
            <Music2 className="w-7 h-7 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-2 max-w-xl mx-auto">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
              Ready to Share Your Sound?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Whether you are a shredding lead guitarist, a classical vocalist, a beatmaker, or a live audio mixing aficionado — Melodium SJEC is your home on campus.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all hover:scale-105"
            >
              Create Musician Account
            </Link>
            <Link
              to="/jam-room"
              className="px-8 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 hover:text-white font-bold text-xs border border-white/10 transition-all"
            >
              Book Studio Rehearsal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
