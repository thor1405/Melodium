import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MelodiumLogo } from './MelodiumLogo';
import { Sparkles, Radio } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LogoutOverlay = () => {
  const { isLoggingOut } = useAuth();

  return (
    <AnimatePresence>
      {isLoggingOut && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-dark-950/90 backdrop-blur-2xl px-4 select-none"
        >
          {/* Ambient Glows */}
          <div className="absolute w-96 h-96 rounded-full bg-amber-500/15 blur-3xl pointer-events-none animate-pulse" />
          <div className="absolute w-64 h-64 rounded-full bg-yellow-500/10 blur-2xl pointer-events-none" />

          {/* Central Card */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: -10 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-amber-500/30 max-w-sm w-full text-center shadow-2xl space-y-6"
          >
            {/* Logo with Animated Aura */}
            <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
              <div className="absolute inset-0 rounded-2xl bg-amber-500/20 animate-ping opacity-30" />
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 p-0.5 shadow-glow-yellow">
                <div className="w-full h-full rounded-[14px] bg-dark-950 flex items-center justify-center">
                  <MelodiumLogo className="w-12 h-12" showGlow={false} />
                </div>
              </div>
            </div>

            {/* Status Titles */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-wider">
                <Radio className="w-3 h-3 animate-pulse" />
                <span>Session Closing</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-display font-extrabold text-white">
                Signing You Out
              </h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                Clearing credentials & safely saving your studio session state...
              </p>
            </div>

            {/* Animated Soundwave / Progress Indicator */}
            <div className="flex items-center justify-center gap-1.5 py-1">
              {[0.1, 0.3, 0.5, 0.2, 0.6, 0.4, 0.2].map((delay, idx) => (
                <motion.div
                  key={idx}
                  animate={{
                    height: ['8px', '28px', '8px'],
                  }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: delay,
                    ease: 'easeInOut',
                  }}
                  className="w-1.5 rounded-full bg-gradient-to-t from-amber-500 to-yellow-400 shadow-glow-yellow"
                />
              ))}
            </div>

            <div className="text-[11px] font-medium text-slate-500 flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>See you at your next Jam Session!</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LogoutOverlay;
