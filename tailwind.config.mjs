/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'pitch-black': '#000000',
        'deep-crimson': '#830000',
        'bright-crimson': '#BC0202',
        'pure-red': '#FF0000',
        brand: {
          pitch: '#000000',
          dark: '#0a0a0a',
          surface: '#121212',
          surface2: '#1a1a1a',
          border: '#262626',
          deepCrimson: '#830000',
          brightCrimson: '#BC0202',
          pureRed: '#FF0000',
          lightBg: '#f8fafc',
          lightSurface: '#ffffff',
          lightBorder: '#e2e8f0',
        }
      },
      boxShadow: {
        'crimson-glow': '0 0 25px rgba(255, 0, 0, 0.35)',
        'crimson-glow-lg': '0 0 40px rgba(188, 2, 2, 0.55)',
        'deck-active': '0 0 20px rgba(255, 0, 0, 0.4), inset 0 0 15px rgba(131, 0, 0, 0.3)',
      },
      animation: {
        'spin-slow': 'spin 3s linear infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'vu-meter': 'vu 0.3s ease-in-out infinite alternate',
      },
      keyframes: {
        vu: {
          '0%': { height: '10%' },
          '100%': { height: '95%' }
        }
      }
    },
  },
  plugins: [],
};
