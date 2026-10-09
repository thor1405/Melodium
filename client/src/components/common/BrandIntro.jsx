import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MelodiumLogo } from './MelodiumLogo';
import { Sparkles, Radio, Music2, Activity } from 'lucide-react';

export const BrandIntro = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Progress counter animation
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 18 + 8);
      });
    }, 80);

    // Total display duration before curtain lifts
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 1500);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{
            y: '-100%',
            opacity: 0.95,
            transition: { duration: 0.65, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-dark-950 text-white overflow-hidden select-none"
        >
          {/* Ambient Acoustic Radial Glows */}
          <motion.div
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.2, 0.35, 0.2],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-amber-500/25 via-yellow-400/15 to-transparent blur-3xl pointer-events-none"
          />

          {/* Sound Wave Ripple Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {[1, 2, 3].map((ring) => (
              <motion.div
                key={ring}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{
                  scale: [0.6, 2.2],
                  opacity: [0.4, 0],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  delay: ring * 0.45,
                  ease: 'easeOut',
                }}
                className="absolute w-72 h-72 rounded-full border border-amber-400/30"
              />
            ))}
          </div>

          {/* Center Brand Container */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-6 px-4 max-w-sm">
            {/* Animated Logo Emblem */}
            <motion.div
              initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20,
                duration: 0.6,
              }}
              className="relative group"
            >
              <div className="absolute -inset-2 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl blur-xl opacity-60 animate-pulse" />
              <div className="relative w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-0.5 shadow-glow-yellow">
                <div className="w-full h-full rounded-[22px] bg-dark-950 flex items-center justify-center p-3">
                  <MelodiumLogo className="w-14 h-14" showGlow={true} />
                </div>
              </div>
            </motion.div>

            {/* Typography */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider text-white">
                  MELODIUM
                </h1>
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/25 border border-amber-400/50 text-amber-300 text-xs font-black tracking-widest uppercase shadow-glow-yellow">
                  SJEC
                </span>
              </div>

              <p className="text-xs text-slate-400 font-medium tracking-wide">
                Where Music Finds Its Voice • Academic Block 3
              </p>
            </motion.div>

            {/* Live Equalizer Soundwave Visualizer */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.4 }}
              className="flex items-center justify-center gap-1.5 h-8 py-1"
            >
              {[12, 28, 16, 32, 24, 18, 30, 14, 26, 10, 22, 34, 16].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{
                    height: ['8px', `${h}px`, '10px'],
                  }}
                  transition={{
                    duration: 0.6 + (i % 4) * 0.15,
                    repeat: Infinity,
                    repeatType: 'reverse',
                    ease: 'easeInOut',
                    delay: i * 0.05,
                  }}
                  className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 shadow-glow-yellow"
                />
              ))}
            </motion.div>

            {/* Frequency & Studio Status */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45 }}
              className="w-full space-y-2.5 pt-2"
            >
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 px-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  STUDIO ACOUSTICS
                </span>
                <span className="text-amber-300 font-bold">
                  {Math.min(progress, 100)}%
                </span>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden p-0.5 border border-white/5">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: 'easeOut' }}
                  className="h-full rounded-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 shadow-glow-yellow"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BrandIntro;
