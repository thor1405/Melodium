import React from 'react';
import { motion } from 'framer-motion';

export const StudioAmbience = () => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
    >
      {/* Floating Golden Acoustic Glow Orb 1 (Top Left) */}
      <motion.div
        animate={{
          x: [0, 40, -20, 0],
          y: [0, -35, 20, 0],
          scale: [1, 1.12, 0.95, 1],
          opacity: [0.18, 0.28, 0.16, 0.18],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute -top-32 -left-32 w-96 sm:w-[500px] h-96 sm:h-[500px] rounded-full bg-gradient-to-br from-amber-400/25 via-yellow-500/15 to-transparent blur-3xl"
      />

      {/* Floating Acoustic Atmosphere Orb 2 (Center Right) */}
      <motion.div
        animate={{
          x: [0, -50, 30, 0],
          y: [0, 40, -30, 0],
          scale: [1, 1.15, 0.92, 1],
          opacity: [0.12, 0.22, 0.14, 0.12],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 2,
        }}
        className="absolute top-1/3 -right-28 w-80 sm:w-[450px] h-80 sm:h-[450px] rounded-full bg-gradient-to-bl from-yellow-400/20 via-amber-600/10 to-transparent blur-3xl"
      />

      {/* Floating Deep Subwoofer Bass Orb 3 (Bottom Center) */}
      <motion.div
        animate={{
          x: [0, 30, -30, 0],
          y: [0, -25, 35, 0],
          scale: [0.95, 1.08, 0.98, 0.95],
          opacity: [0.1, 0.18, 0.1, 0.1],
        }}
        transition={{
          duration: 26,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 4,
        }}
        className="absolute bottom-10 left-1/4 w-96 sm:w-[600px] h-96 sm:h-[600px] rounded-full bg-gradient-to-tr from-amber-500/15 via-yellow-400/10 to-transparent blur-3xl"
      />

      {/* Subtle Studio Acoustic Wave Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40" />
    </div>
  );
};

export default StudioAmbience;
