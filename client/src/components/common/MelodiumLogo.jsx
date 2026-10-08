import React from 'react';

/**
 * MelodiumLogo Component
 * Custom authentic brand vector logo styled with the Canary Yellow & Golden Amber theme.
 */
export const MelodiumLogo = ({ className = 'w-8 h-8', showGlow = true, variant = 'gold' }) => {
  return (
    <svg
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
    >
      <defs>
        {/* Melodium Theme Gradient */}
        <linearGradient id="melodiumLogoGold" x1="20" y1="20" x2="180" y2="180" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ece75f" />
          <stop offset="45%" stopColor="#facc15" />
          <stop offset="85%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>

        <linearGradient id="melodiumLogoRing" x1="0" y1="0" x2="200" y2="200" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ece75f" />
          <stop offset="100%" stopColor="#f59e0b" />
        </linearGradient>

        {showGlow && (
          <filter id="melodiumLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.4" />
          </filter>
        )}

        <filter id="melodiumLogoShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor="#000000" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Outer Ring */}
      <circle
        cx="100"
        cy="100"
        r="91"
        stroke="url(#melodiumLogoRing)"
        strokeWidth="6.5"
        fill="none"
      />

      {/* Inner Filled Disc */}
      <circle
        cx="100"
        cy="100"
        r="78"
        fill="url(#melodiumLogoGold)"
        filter={showGlow ? 'url(#melodiumLogoGlow)' : undefined}
      />

      {/* Sound / Broadcast Waves (Top-Left) */}
      <g filter="url(#melodiumLogoShadow)">
        <path
          d="M 45 92 A 58 58 0 0 1 93 44"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 58 95 A 42 42 0 0 1 95 58"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Audio Jack Plug Connector (Top-Right) */}
      <g filter="url(#melodiumLogoShadow)">
        <rect
          x="131"
          y="58"
          width="22"
          height="14"
          rx="2"
          fill="none"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        <path
          d="M 153 65 L 191 65"
          stroke="#ffffff"
          strokeWidth="6"
          strokeLinecap="square"
        />
      </g>

      {/* Center Studio Microphone */}
      <g filter="url(#melodiumLogoShadow)">
        {/* Capsule */}
        <rect
          x="83"
          y="68"
          width="38"
          height="64"
          rx="19"
          fill="none"
          stroke="#ffffff"
          strokeWidth="7"
        />

        {/* U-Cradle */}
        <path
          d="M 72 104 L 72 114 A 30 30 0 0 0 132 114 L 132 104"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />

        {/* Stem */}
        <path
          d="M 102 144 L 102 163"
          stroke="#ffffff"
          strokeWidth="7"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default MelodiumLogo;
