/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Primary olive scale
        brand: {
          50: '#f1f2e9',
          100: '#e6e8d7',
          200: '#cfd4b5',
          300: '#bbc293',
          400: '#a5ad79',
          500: '#8b9461',
          600: '#6c7549',
          700: '#535c38',
          800: '#3b432a',
          900: '#292f20',
          950: '#151710',
        },
        // Muted warm accent aliases
        amber: {
          50: '#f2f1e8',
          100: '#e6e4d7',
          200: '#d7d7bd',
          300: '#c7cba5',
          400: '#b4bb8a',
          500: '#a5ad79',
          600: '#818b56',
          700: '#687146',
        },
        // Legacy palette aliases share the olive scale
        indigox: {
          400: '#a5ad79',
          500: '#8b9461',
          600: '#6c7549',
          700: '#535c38',
        },
        // Shared olive accent
        accent: {
          300: '#c7cba5',
          400: '#b4bb8a',
          500: '#a5ad79',
          600: '#818b56',
        },
        // Warm charcoal surfaces
        ink: {
          900: '#151710',
          800: '#1d2118',
          700: '#292f20',
          600: '#3b432a',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      boxShadow: {
        card: 'none',
        glow: 'none',
        'glow-amber': 'none',
      },
      backgroundImage: {
        'grid-light':
          'linear-gradient(to right, rgba(15,26,48,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,26,48,0.05) 1px, transparent 1px)',
        'grid-dark':
          'linear-gradient(to right, rgba(255,255,255,0.045) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.045) 1px, transparent 1px)',
      },
      // Every unqualified `transition-*` utility in the codebase (there are
      // dozens of bare `transition-colors` / `transition-transform` hovers)
      // inherits these. Tailwind's stock default is 150ms `ease` — snappy to
      // the point of feeling clipped. Raising the floor here, once, is what
      // makes the whole site read as deliberate instead of twitchy, without
      // hunting down every hover state individually.
      transitionDuration: {
        DEFAULT: '400ms',
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.16, 1, 0.3, 1)',
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
          '0%': { opacity: '0', transform: 'translateY(22px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 3s ease-out infinite',
        marquee: 'marquee 32s linear infinite',
        'fade-up': 'fade-up 0.85s cubic-bezier(0.16,1,0.3,1) both',
        'draw-bar': 'draw-bar 1.1s cubic-bezier(0.16,1,0.3,1) both',
      },
    },
  },
  plugins: [],
}
