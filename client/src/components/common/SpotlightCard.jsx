import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(236, 231, 95, 0.14)',
  borderColor = 'rgba(236, 231, 95, 0.35)',
  ...props
}) => {
  const cardRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`relative overflow-hidden rounded-3xl glass-panel border border-white/10 transition-colors ${className}`}
      {...props}
    >
      {/* Dynamic Radial Mouse Spotlight */}
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          background: `radial-gradient(420px circle at ${mousePosition.x}px ${mousePosition.y}px, ${spotlightColor}, transparent 80%)`,
        }}
      />

      {/* Subtle Glowing Hover Border */}
      <div
        className="pointer-events-none absolute inset-0 rounded-3xl border transition-opacity duration-300 z-0"
        style={{
          opacity: isHovered ? 1 : 0,
          borderColor: borderColor,
        }}
      />

      {/* Card Content */}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
};
