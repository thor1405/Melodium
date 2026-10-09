import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BackgroundVideoPlayer } from '../../components/common/BackgroundVideoPlayer';
import { GalleryLightbox } from '../../components/cms/GalleryLightbox';
import { TeamCard } from '../../components/cms/TeamCard';
import { cmsService } from '../../services/cmsService';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
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
  Headphones,
  Star,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const HomePage = () => {
  const [gallery, setGallery] = useState([]);
  const [team, setTeam] = useState([]);
  const [soundEngineer, setSoundEngineer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [galleryRes, teamRes, settingsRes, reviewRes] = await Promise.all([
          cmsService.getGallery({ featured: 'true' }),
          cmsService.getTeam(),
          bookingService.getBookingSettings(),
          reviewService.getPublicReviews({ limit: 3, sortBy: 'helpful' }),
        ]);

        if (galleryRes.success && galleryRes.data) setGallery(galleryRes.data.slice(0, 3));
        if (teamRes.success && teamRes.data) {
          setTeam(teamRes.data.slice(0, 3));
          const engineer = teamRes.data.find(
            (m) =>
              m.category === 'SOUND_ENGINEER' ||
              m.name?.toLowerCase().includes('lionel') ||
              m.role?.toLowerCase().includes('sound')
          ) || teamRes.data[0];
          if (engineer) setSoundEngineer(engineer);
        }
        if (settingsRes.success && settingsRes.data) setSettings(settingsRes.data);
        if (reviewRes.success && reviewRes.data) setReviews(reviewRes.data.reviews || []);
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
        <div className="relative rounded-3xl overflow-hidden glass-panel-elevated border border-amber-500/25 p-6 sm:p-10 lg:p-12">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
            {/* Left Column: Text & Actions */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/35 text-xs font-bold uppercase">
                <Radio className="w-3.5 h-3.5 animate-pulse" />
                <span>Dedicated University Jam Room</span>
              </div>

              <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-white tracking-tight">
                Studio-Grade Gear. <br />
                <span className="text-amber-400">Instant 1-Hour Slots.</span>
              </h2>

              <p className="text-slate-300 text-sm leading-relaxed">
                Equipped with a Pearl acoustic drum kit, high-gain Marshall half-stacks, Fender Twin Reverbs, Ampeg bass amplification, stage pianos, and Shure microphones — our sound-treated Jam Room is ready for your rehearsals.
              </p>

              {/* Feature Bullets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-slate-200">
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

              <div className="pt-2 flex flex-wrap items-center gap-4">
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

            {/* Right Column: Framed Studio Photo */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl group aspect-[4/3] bg-dark-900">
                <img
                  src="/gallery/sound_treated_live_room.png"
                  alt="Melodium SJEC Jam Room Studio"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-slate-300">
                  <span className="font-semibold text-white text-[11px] drop-shadow-md">
                    Studio
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/30 border border-amber-400/40 text-amber-300 text-[10px] font-bold">
                    Academic Block 3
                  </span>
                </div>
              </div>
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

      {/* 6. MEET THE SOUND ENGINEER SPOTLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Studio & Sound Production
            </span>
            <h2 className="text-3xl font-display font-extrabold text-white mt-1">
              Meet the Sound Engineer
            </h2>
          </div>
          <Link
            to="/sound-engineer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline transition-colors"
          >
            <span>Learn More About Lionel</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-amber-500/20 bg-gradient-to-br from-dark-900/90 via-dark-950 to-dark-900 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left: Lionel / Sound Engineer Photo Card */}
            <div className="lg:col-span-5 relative group">
              <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/30 shadow-2xl bg-dark-900 aspect-[3/4] max-w-md mx-auto">
                <img
                  src={soundEngineer?.photo || '/team/lionel.jpg'}
                  alt={`${soundEngineer?.name || 'Lionel'} - Sound Engineer`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.target.src = '/team/lionel.jpg';
                  }}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />

                {/* Floating Tag */}
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-amber-500/40 text-amber-300 text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-md">
                    <Sliders className="w-3.5 h-3.5 text-amber-400" />
                    Sound Engineer
                  </span>
                </div>

                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display font-black text-2xl text-white">
                    {soundEngineer?.name || 'Lionel'}
                  </h3>
                  <p className="text-xs font-semibold text-amber-300">
                    {soundEngineer?.role || 'Chief Sound Engineer & Studio Custodian'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Sound Engineering Capabilities & Bio */}
            <div className="lg:col-span-7 space-y-6">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>Resident Acoustic & Audio Specialist</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-display font-black text-white">
                  The Acoustic Mind Behind Every Jam Session
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {soundEngineer?.bio ||
                    'Lionel oversees all audio engineering, sound checks, and studio operations at Melodium SJEC. From calibrating 16-channel digital consoles and dialing in studio monitor acoustics to running multitrack DAW recording sessions for student bands and external artists, Lionel ensures every performance is captured with studio clarity.'}
                </p>
              </div>

              {/* 4 Feature Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-amber-400" />
                    <span>Digital Console & EQ</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Channel fader routing, EQ curves, compression, and aux monitor mixes.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Mic2 className="w-4 h-4 text-amber-400" />
                    <span>Multitrack DAW Capture</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Zero-latency recording stems for drums, guitars, keys, and vocals.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-amber-400" />
                    <span>Live Band Soundchecks</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Feedback suppression, instrument balancing, and acoustic tuning.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1">
                  <div className="font-bold text-white text-xs flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Studio Gear Custody</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Maintaining high-end mics, tube amps, acoustic isolation, and mixers.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-white/10">
                <Link
                  to="/jam-room"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2"
                >
                  <Radio className="w-4 h-4 text-dark-950" />
                  <span>Book Jam Room with Sound Engineer</span>
                </Link>
                <Link
                  to="/sound-engineer"
                  className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all flex items-center gap-2"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6.5 MUSICIAN REVIEWS & EXPERIENCES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Community Voices
            </span>
            <h2 className="text-3xl font-display font-extrabold text-white mt-1">
              Musician Reviews & Feedback
            </h2>
          </div>
          <Link
            to="/reviews"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:underline transition-colors"
          >
            <span>Read All Reviews</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev._id}
                className="glass-panel rounded-3xl p-6 border border-white/5 hover:border-amber-400/30 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? 'fill-amber-400' : 'text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-medium">
                      Verified Musician
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm line-clamp-1">
                    "{rev.title}"
                  </h3>
                  <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {rev.comment}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-white text-xs">{rev.userName}</div>
                    <div className="text-[10px] text-slate-400">{rev.userRole}</div>
                  </div>
                  <Link
                    to="/reviews"
                    className="text-[11px] font-semibold text-amber-400 hover:text-amber-300"
                  >
                    View →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-panel rounded-3xl p-8 text-center text-xs text-slate-400">
            Visit our{' '}
            <Link to="/reviews" className="text-amber-400 font-bold underline">
              Reviews Page
            </Link>{' '}
            to read and submit feedback on Melodium Jam Room.
          </div>
        )}
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
