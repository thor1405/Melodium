import React from 'react';
import { motion } from 'framer-motion';

export const SoundVisualizer = ({ bars = 5, className = '', barClassName = 'bg-amber-400' }) => {
  const barVariants = {
    animate: (i) => ({
      scaleY: [0.3, 1.1, 0.4, 0.9, 0.2],
      transition: {
        duration: 0.8 + (i % 3) * 0.3,
        repeat: Infinity,
        repeatType: 'reverse',
        ease: 'easeInOut',
        delay: i * 0.12,
      },
    }),
  };

  return (
    <div className={`flex items-end gap-1 h-5 ${className}`}>
      {Array.from({ length: bars }).map((_, i) => (
        <motion.span
          key={i}
          custom={i}
          variants={barVariants}
          animate="animate"
          className={`w-0.5 sm:w-1 rounded-full origin-bottom ${barClassName}`}
          style={{ height: '100%' }}
        />
      ))}
    </div>
  );
};
