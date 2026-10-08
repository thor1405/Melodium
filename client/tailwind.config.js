/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#07080B', // Deep acoustic midnight
          900: '#0E1116', // Acoustic charcoal matte surface
          850: '#151921', // Acoustic square tile
          800: '#1E2430', // Acoustic panel border & seams
          700: '#2B3342', // Mid acoustic slate
          600: '#3D4759', // Highlight acoustic edge
        },
        yellow: {
          50: '#fdfde8',
          100: '#faf9c5',
          200: '#f5f296',
          300: '#f1ed7a',
          400: '#ece75f', // Target user yellow: #ece75f
          500: '#ded946',
          600: '#bfb932',
          700: '#999327',
          800: '#777222',
          900: '#54501b',
          950: '#2c2a0d',
        },
        amber: {
          50: '#fdfde8',
          100: '#faf9c5',
          200: '#f5f296',
          300: '#f1ed7a',
          400: '#ece75f', // Target user yellow: #ece75f
          500: '#ded946',
          600: '#bfb932',
          700: '#999327',
          800: '#777222',
          900: '#54501b',
          950: '#2c2a0d',
        },
        brand: {
          yellow: '#ece75f',    // Target User Yellow: #ece75f
          amber: '#ded946',     // Rich Companion Tone
          gold: '#ece75f',      // Vibrant Studio Yellow Accent
          brass: '#bfb932',     // Brass Accent
          lemon: '#fdfde8',     // Light Cream Highlight
          cream: '#faf9c5',     // Light Canary
          grey: '#94A3B8',      // Acoustic Panel Grey
          slate: '#64748B',     // Muted Soundproof Slate
          charcoal: '#151921',  // Dark Acoustic Charcoal
          emerald: '#10B981',   // Available slot green
          red: '#EF4444',       // Alert / Destructive only
          crimson: '#DC2626',   // Alert / Destructive only
          purple: '#ece75f',    // Aliased to #ece75f
          cyan: '#ece75f',      // Aliased to #ece75f
        },
        purple: {
          50: '#fdfde8',
          100: '#faf9c5',
          200: '#f5f296',
          300: '#f1ed7a',
          400: '#ece75f',
          500: '#ded946',
          600: '#bfb932',
          700: '#999327',
          800: '#777222',
          900: '#54501b',
          950: '#2c2a0d',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', '"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'glow-yellow': '0 0 32px -4px rgba(236, 231, 95, 0.65)',
        'glow-gold': '0 0 35px -3px rgba(236, 231, 95, 0.70)',
        'glow-amber': '0 0 28px -4px rgba(222, 217, 70, 0.55)',
        'glow-grey': '0 0 25px -5px rgba(148, 163, 184, 0.25)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'glow-purple': '0 0 32px -4px rgba(236, 231, 95, 0.65)',
        'glow-cyan': '0 0 25px -5px rgba(236, 231, 95, 0.5)',
        'glow-red': '0 0 25px -5px rgba(239, 68, 68, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'equalizer': 'equalize 1.2s ease-in-out infinite alternate',
      },
      keyframes: {
        equalize: {
          '0%': { height: '15%' },
          '50%': { height: '85%' },
          '100%': { height: '35%' },
        }
      }
    },
  },
  plugins: [],
}
