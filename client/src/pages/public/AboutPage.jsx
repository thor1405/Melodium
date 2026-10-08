import React from 'react';
import { Link } from 'react-router-dom';
import {
  Music2,
  Radio,
  Target,
  Compass,
  Trophy,
  Award,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Users,
  Volume2,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutPage = () => {
  return (
    <div className="space-y-20 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
          About Melodium SJEC
        </span>
        <h1 className="text-4xl sm:text-5xl font-display font-extrabold text-white tracking-tight">
          Nurturing Musical Expression at{' '}
          <span className="text-amber-400">St. Joseph Engineering College</span>
        </h1>
        <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
          Founded as the official musical and cultural fraternity of SJEC, Melodium brings together musicians, vocalists, acoustic storytellers, and audio engineers to collaborate, innovate, and conquer inter-collegiate stages across South India.
        </p>
      </div>

      {/* Mission & Vision Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/10 space-y-4 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Target className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Our Mission</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To provide a world-class creative environment, sound-treated rehearsal space, and professional stage opportunities for students of St. Joseph Engineering College. We seek to break genre boundaries and develop well-rounded artists capable of live performance and studio composition.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/10 space-y-4 relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-400">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl text-white">Our Vision</h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            To make Melodium SJEC a benchmark collegiate music collective in India — recognized for unmatched musicianship, innovative fusion of Western and Indian classical traditions, and sound engineering excellence.
          </p>
        </motion.div>
      </div>

      {/* Musical Culture at SJEC */}
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-white/10 space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Community & Collaboration
          </span>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-white">
            The Melodium Musical Culture
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-base font-display">
              Multi-Genre Jam Sessions
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              From blues rock power trios and progressive metal breakdowns to gentle acoustic folk duets and Carnatic-western fusion, Melodium embraces all forms of musical expression.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-base font-display">
              Studio Sound & Production
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Students get hands-on experience running 16-channel analog/digital mixers, balancing foldback monitor mixes, signal path routing, and multi-track recording.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2">
            <h3 className="font-bold text-white text-base font-display">
              Stage Performance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Melodium represents SJEC at prestigious cultural fests including Tiara, regional Battle of the Bands competitions, charity concerts, and college convocation ceremonies.
            </p>
          </div>
        </div>
      </div>

      {/* Achievements Showcase */}
      <div className="space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
            Track Record
          </span>
          <h2 className="text-3xl font-display font-bold text-white">Key Achievements</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl glass-panel border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">1st Place — Tiara Battle of the Bands</h4>
              <p className="text-xs text-slate-400 mt-1">
                2024 & 2025 Regional Champions competing against 24 engineering college rock bands.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-400 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Best Drummer & Best Vocalist</h4>
              <p className="text-xs text-slate-400 mt-1">
                Individual accolades awarded to Melodium artists at the VTU State Cultural Festival.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl glass-panel border border-white/5 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0">
              <Volume2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-white">Over 400+ Studio Jam Sessions</h4>
              <p className="text-xs text-slate-400 mt-1">
                Facilitating consistent weekly rehearsals and fostering new bands across batches.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Jam Room Guidelines Section */}
      <div id="jam-room-rules" className="scroll-mt-28 glass-panel-elevated rounded-3xl p-8 sm:p-12 border border-white/10 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white">
              Studio 1 Jam Room Guidelines & Code of Conduct
            </h2>
            <p className="text-xs text-slate-400">Rules for all student rehearsals</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Strict 1-Hour Slot Policy</span>
            </div>
            <p className="text-slate-400">
              Sessions run strictly within the booked hour. Please ensure equipment is packed and vacated 5 minutes prior to slot end.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Zero Food & Drinks Policy</span>
            </div>
            <p className="text-slate-400">
              No food, open beverages, or water bottles are allowed on or near the guitar amplifiers, pedals, or keyboard consoles.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Equipment Care & Reporting</span>
            </div>
            <p className="text-slate-400">
              Always turn amp master volumes to zero before unplugging guitar leads. Report any crackling cables or drum head issues immediately to the Jam Room Master.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-1">
            <div className="font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cancellation Cutoff</span>
            </div>
            <p className="text-slate-400">
              If unable to attend, cancel at least 2 hours in advance from your "My Bookings" page so other student bands can utilize the open slot.
            </p>
          </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-white/10">
          <span className="text-xs text-slate-400">Ready to jam?</span>
          <Link
            to="/jam-room"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-dark-950 font-extrabold text-xs shadow-glow-yellow transition-all"
          >
            Check Available Slots
          </Link>
        </div>
      </div>
    </div>
  );
};
