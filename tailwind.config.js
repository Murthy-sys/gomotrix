/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary — refined navy
        brand: {
          50: '#eef2fa',
          100: '#d9e2f4',
          200: '#b4c6e8',
          300: '#88a3d8',
          400: '#5a7cc2',
          500: '#3a5ca6',
          600: '#2c4885',
          700: '#243c6e',
          800: '#1e3158',
          900: '#1b2a49',
          950: '#0f1a30',
        },
        // Accent — warm amber / gold (also Tailwind's built-in `amber`)
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
        },
        // Secondary navy (kept as a safety net for legacy `indigox-*` refs)
        indigox: {
          400: '#5a7cc2',
          500: '#3a5ca6',
          600: '#2c4885',
          700: '#243c6e',
        },
        // Legacy `accent-*` refs now resolve to amber, keeping stray usages on-brand
        accent: {
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        // Dark surfaces — deep navy ink
        ink: {
          900: '#0b1220',
          800: '#111a2e',
          700: '#1a2540',
          600: '#243152',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 12px 40px -18px rgba(15, 26, 48, 0.22)',
        glow: '0 18px 50px -18px rgba(27, 42, 73, 0.35)',
        'glow-amber': '0 14px 34px -12px rgba(245, 158, 11, 0.4)',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(15,26,48,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,26,48,0.05) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-14px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.2)', opacity: '0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'draw-bar': {
          '0%': { transform: 'scaleY(0.15)' },
          '100%': { transform: 'scaleY(1)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 3s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fade-up 0.5s ease both',
        'draw-bar': 'draw-bar 0.8s cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
}
