import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { cmsService } from '../../services/cmsService';
import {
  Sliders,
  Mic2,
  Volume2,
  ShieldCheck,
  Radio,
  Sparkles,
  MapPin,
  Headphones,
  CheckCircle2,
  ArrowRight,
  Disc3,
  Waves,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const TeamPage = () => {
  const [engineer, setEngineer] = useState({
    name: 'Lionel',
    role: 'Sound Engineer & Studio Custodian',
    photo: '/team/lionel.jpg',
    bio: 'Official Resident Sound Engineer for Melodium SJEC. Manages live rehearsal acoustics, multitrack studio recording, digital mixing console routing, and audio calibration at Jam Room (Academic Block 3).',
    instrument: 'Live Sound, Multitrack DAW & Studio Acoustics',
    department: 'Studio Audio Engineering',
  });
  const [loading, setLoading] = useState(true);

  const DEFAULT_GEAR = [
    {
      _id: 'default-1',
      title: 'Digital Mixing Console & Audio Control Desk',
      desc: '16/32-channel digital console with motorized faders, aux monitor routing, and parametric EQ.',
      image: '/gallery/sound_engineer_console.png',
      tag: 'Mixer Console',
    },
    {
      _id: 'default-2',
      title: 'Sound-Treated Live Rehearsal Hall',
      desc: 'Acoustically isolated rehearsal space at SJEC featuring wood flooring and bass absorption.',
      image: '/gallery/sound_treated_live_room.png',
      tag: 'Jam Room',
    },
    {
      _id: 'default-3',
      title: 'Large-Diaphragm Gold Condenser Mic',
      desc: 'High-precision vocal recording microphone with elastic shockmount and studio monitoring.',
      image: '/gallery/gold_condenser_mic.png',
      tag: 'Vocal Booth',
    },
    {
      _id: 'default-4',
      title: 'Logic Pro DAW & Multitrack Station',
      desc: 'Production workstation for zero-latency stem recording and post-rehearsal mastering.',
      image: '/gallery/logic_pro_daw_station.png',
      tag: 'DAW Station',
    },
    {
      _id: 'default-5',
      title: 'Shure Beta 57A Dynamic Microphones',
      desc: 'Supercardioid precision mics for guitar cabinets, acoustic instruments, and drum snares.',
      image: '/gallery/shure_beta57a_mics.png',
      tag: 'Instrument Mics',
    },
  ];

  const [studioGear, setStudioGear] = useState(DEFAULT_GEAR);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        const [teamRes, equipRes] = await Promise.all([
          cmsService.getTeam(),
          cmsService.getEquipment(),
        ]);

        if (teamRes.success && teamRes.data && teamRes.data.length > 0) {
          const found = teamRes.data.find(
            (m) =>
              m.name.toLowerCase().includes('lionel') ||
              m.role.toLowerCase().includes('sound') ||
              m.category === 'SOUND_ENGINEER'
          ) || teamRes.data[0];
          if (found) setEngineer((prev) => ({ ...prev, ...found }));
        }

        if (equipRes.success && equipRes.data && equipRes.data.length > 0) {
          setStudioGear(equipRes.data);
        }
      } catch (err) {
        console.error('Error loading sound engineer & equipment details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPageData();
  }, []);

  return (
    <div className="space-y-16 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Page Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400 flex items-center justify-center gap-1.5">
          <Headphones className="w-3.5 h-3.5" />
          Studio Sound & Audio Production
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-white">
          Meet the Sound Engineer
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
          The acoustic mind behind live rehearsal sound checks, digital console routing, and multitrack studio recordings at St. Joseph Engineering College.
        </p>
      </div>

      {/* Main Hero Spotlight Card */}
      <div className="glass-panel-elevated rounded-3xl p-6 sm:p-10 border border-amber-500/20 bg-gradient-to-br from-dark-900/95 via-dark-950 to-dark-900 shadow-2xl relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Photo Showcase */}
          <div className="lg:col-span-5">
            <div className="relative rounded-2xl overflow-hidden border-2 border-amber-500/40 shadow-2xl bg-dark-900 aspect-[3/4] max-w-md mx-auto group">
              <img
                src={engineer.photo || '/team/lionel.jpg'}
                alt={engineer.name}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  e.target.src = '/team/lionel.jpg';
                }}
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/25 to-transparent" />

              {/* Verified Sound Engineer Badge */}
              <div className="absolute top-4 left-4">
                <span className="px-3.5 py-1.5 rounded-full bg-dark-950/85 backdrop-blur-md border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-lg">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Resident Sound Engineer
                </span>
              </div>

              {/* Bottom Name Overlay */}
              <div className="absolute bottom-5 left-5 right-5 space-y-1">
                <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
                  {engineer.name}
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-amber-300">
                  {engineer.role || 'Chief Sound Engineer & Studio Custodian'}
                </p>
                <p className="text-[11px] text-slate-300 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3 h-3 text-amber-400 shrink-0" />
                  Academic Block 3, Ground Floor, SJEC
                </p>
              </div>
            </div>
          </div>

          {/* Detailed Sound Engineer Profile */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Melodium Audio Engineering Master</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-white">
                Audio Precision for Every Artist & Band
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                {engineer.bio ||
                  'Official Resident Sound Engineer for Melodium SJEC. Manages live rehearsal acoustics, multitrack studio recording, digital mixing console routing, and audio calibration at Jam Room (Academic Block 3).'}
              </p>
            </div>

            {/* Core Responsibilities Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Digital Mixing & EQ</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Dynamic channel fader balancing, parametric equalizers, noise gates, and monitor foldbacks.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Mic2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Multitrack DAW Recording</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Direct stem audio tracking via Logic Pro & Ableton Live for band demos and contest entries.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Live Rehearsal Soundchecks</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Pre-session gain staging, feedback suppression, instrument isolation, and acoustic tuning.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                <div className="font-bold text-white text-xs flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Studio Equipment Custody</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Maintaining tube guitar heads, condenser capsules, active subwoofers, and cables in the Jam Room.
                </p>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-white/10">
              <Link
                to="/jam-room"
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all flex items-center gap-2 hover:scale-[1.02]"
              >
                <Radio className="w-4 h-4 text-dark-950" />
                <span>Book Jam Room Session</span>
              </Link>
              <Link
                to="/about#jam-room-rules"
                className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-xs transition-all flex items-center gap-2"
              >
                <span>Read Studio Guidelines</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Equipment Calibrated by Lionel */}
      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Studio Command
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            Equipment & Calibration by Lionel
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            High-grade studio gear tuned for zero noise floor and maximum acoustic clarity.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {studioGear.map((gear, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4 }}
              className="glass-panel rounded-3xl overflow-hidden border border-white/10 hover:border-amber-500/30 transition-all flex flex-col h-full group"
            >
              <div className="relative aspect-[16/10] w-full bg-dark-950 overflow-hidden shrink-0">
                <img
                  src={gear.image}
                  alt={gear.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-dark-950/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full bg-dark-950/80 backdrop-blur-md border border-white/15 text-amber-300 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                    {gear.tag}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col justify-between space-y-2">
                <h3 className="font-display font-bold text-sm text-white group-hover:text-amber-400 transition-colors line-clamp-2 min-h-[2.5rem] flex items-start">
                  {gear.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[3rem]">{gear.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Rehearsal Etiquette with Sound Engineer */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white">
              Rehearsal Soundcheck Protocol
            </h2>
            <p className="text-xs text-slate-400">
              Coordinating with Sound Engineer Lionel for the best acoustic session
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white">1. Arrive 5 Mins Early</div>
            <p className="text-slate-400">
              Check in with Lionel at the Jam Room to set channel inputs, plug in your instruments, and perform a line check.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white">2. Master Volume Handling</div>
            <p className="text-slate-400">
              Never unplug live guitar cables without turning amplifier master dials to zero to prevent speaker damage.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white">3. Multitrack Export Request</div>
            <p className="text-slate-400">
              If your band requires raw DAW audio stems or rough mixdown exports, notify Lionel at the start of the session.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

