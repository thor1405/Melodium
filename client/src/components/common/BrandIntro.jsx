import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MelodiumLogo } from './MelodiumLogo';
import { Sparkles, Radio, Music2 } from 'lucide-react';

export const BrandIntro = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Stage calibration progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + Math.floor(Math.random() * 20 + 12);
      });
    }, 60);

    // Trigger curtain open after 1.25s
    const openTimer = setTimeout(() => {
      setIsOpen(true);
    }, 1250);

    // Completely unmount after curtain is fully drawn open
    const doneTimer = setTimeout(() => {
      setIsDone(true);
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(openTimer);
      clearTimeout(doneTimer);
    };
  }, []);

  if (isDone) return null;

  return (
    <div className="fixed inset-0 z-[10000] pointer-events-none overflow-hidden select-none">
      {/* 1. LEFT STAGE CURTAIN */}
      <motion.div
        initial={{ x: '0%' }}
        animate={isOpen ? { x: '-100.5%' } : { x: '0%' }}
        transition={{
          duration: 0.95,
          ease: [0.77, 0, 0.175, 1], // Theatrical curtain acceleration & glide
        }}
        className="absolute top-0 bottom-0 left-0 w-[50.5vw] bg-dark-950 z-20 overflow-hidden shadow-[25px_0_50px_rgba(0,0,0,0.9)]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #07080b 0px,
              #11151e 15px,
              #1c2230 30px,
              #0c0f16 45px,
              #07080b 60px
            ),
            linear-gradient(180deg, rgba(236,231,95,0.06) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      >
        {/* Fabric Sheen & Pleats Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-black/60" />
        
        {/* Golden Fringe / Trim on the Inner Seam */}
        <div className="absolute top-0 bottom-0 right-0 w-2.5 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
        <div className="absolute top-0 bottom-0 right-2 w-0.5 bg-yellow-200/50" />
      </motion.div>

      {/* 2. RIGHT STAGE CURTAIN */}
      <motion.div
        initial={{ x: '0%' }}
        animate={isOpen ? { x: '100.5%' } : { x: '0%' }}
        transition={{
          duration: 0.95,
          ease: [0.77, 0, 0.175, 1],
        }}
        className="absolute top-0 bottom-0 right-0 w-[50.5vw] bg-dark-950 z-20 overflow-hidden shadow-[-25px_0_50px_rgba(0,0,0,0.9)]"
        style={{
          backgroundImage: `
            repeating-linear-gradient(
              90deg,
              #07080b 0px,
              #11151e 15px,
              #1c2230 30px,
              #0c0f16 45px,
              #07080b 60px
            ),
            linear-gradient(180deg, rgba(236,231,95,0.06) 0%, transparent 40%, rgba(0,0,0,0.6) 100%)
          `,
        }}
      >
        {/* Fabric Sheen & Pleats Overlay */}
        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-white/[0.02] to-black/60" />

        {/* Golden Fringe / Trim on the Inner Seam */}
        <div className="absolute top-0 bottom-0 left-0 w-2.5 bg-gradient-to-b from-amber-400 via-yellow-300 to-amber-500 shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
        <div className="absolute top-0 bottom-0 left-2 w-0.5 bg-yellow-200/50" />
      </motion.div>

      {/* 3. TOP STAGE DRAPE (VALANCE) */}
      <motion.div
        initial={{ y: '0%' }}
        animate={isOpen ? { y: '-100%' } : { y: '0%' }}
        transition={{
          duration: 0.8,
          delay: 0.1,
          ease: [0.77, 0, 0.175, 1],
        }}
        className="absolute top-0 left-0 right-0 h-14 sm:h-20 bg-gradient-to-b from-dark-900 to-dark-950 z-30 border-b-2 border-amber-400/60 shadow-2xl flex items-center justify-center overflow-hidden"
      >
        {/* Decorative Scallop Trim in Gold */}
        <div className="absolute bottom-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-glow-yellow" />
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.25em] text-amber-300 uppercase">
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
          <span>ST. JOSEPH ENGINEERING COLLEGE • MELODIUM STUDIO STAGE</span>
          <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
        </div>
      </motion.div>

      {/* 4. CENTER STAGE BRAND EMBLEM & LIGHTING */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{
              opacity: 0,
              scale: 1.15,
              filter: 'blur(10px)',
              transition: { duration: 0.4 },
            }}
            className="absolute inset-0 z-40 flex items-center justify-center px-4"
          >
            {/* Ambient Golden Stage Lighting Behind Logo */}
            <div className="absolute w-80 sm:w-96 h-80 sm:h-96 rounded-full bg-gradient-to-tr from-amber-500/30 via-yellow-400/20 to-transparent blur-3xl animate-pulse" />

            {/* Emblem Card */}
            <div className="relative flex flex-col items-center text-center space-y-5 max-w-xs sm:max-w-sm">
              {/* Glowing Logo Badge */}
              <div className="relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 rounded-3xl blur-xl opacity-70 animate-pulse" />
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-0.5 shadow-glow-yellow">
                  <div className="w-full h-full rounded-[22px] bg-dark-950 flex items-center justify-center p-3">
                    <MelodiumLogo className="w-12 h-12 sm:w-14 sm:h-14" showGlow={true} />
                  </div>
                </div>
              </div>

              {/* Title */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <h1 className="text-3xl sm:text-4xl font-display font-black tracking-wider text-white">
                    MELODIUM
                  </h1>
                  <span className="px-2 py-0.5 rounded-lg bg-amber-500/30 border border-amber-400/60 text-amber-300 text-xs font-black tracking-widest uppercase shadow-glow-yellow">
                    SJEC
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-medium">
                  Where Music Finds Its Voice
                </p>
              </div>

              {/* Equalizer Wave */}
              <div className="flex items-center justify-center gap-1 h-7">
                {[14, 28, 18, 30, 22, 16, 28, 12, 24, 18, 32, 14].map((h, i) => (
                  <motion.div
                    key={i}
                    animate={{ height: ['6px', `${h}px`, '8px'] }}
                    transition={{
                      duration: 0.5 + (i % 3) * 0.15,
                      repeat: Infinity,
                      repeatType: 'reverse',
                      ease: 'easeInOut',
                      delay: i * 0.04,
                    }}
                    className="w-1 rounded-full bg-gradient-to-t from-amber-500 to-yellow-300 shadow-glow-yellow"
                  />
                ))}
              </div>

              {/* Stage Cue */}
              <div className="w-full space-y-2 pt-1">
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 px-1">
                  <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Radio className="w-3 h-3 animate-pulse text-amber-400" />
                    OPENING STAGE
                  </span>
                  <span className="text-white font-bold">{Math.min(progress, 100)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden border border-white/5">
                  <motion.div
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-amber-500 via-yellow-300 to-amber-500 shadow-glow-yellow rounded-full"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandIntro;
