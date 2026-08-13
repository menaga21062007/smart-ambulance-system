/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#060A12',
          900: '#0B0F19',
          800: '#111827',
          700: '#1E293B',
          600: '#334155',
          500: '#475569',
        },
        hospital: {
          50: '#EAF5FF',
          100: '#D4EBFF',
          500: '#1769AA',
          600: '#125488',
          700: '#0B1F3A',
        },
        teal: {
          500: '#06B6D4',
        },
        medical: {
          bg: '#0B0F19',
          card: '#111827',
          border: '#1E293B',
          text: '#F8FAFC',
        },
        emergencyred: '#F43F5E',
        warningorange: '#F59E0B',
        successgreen: '#10B981',
        specialpurple: '#A855F7',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(6, 182, 212, 0.8)' },
        },
        radarSpin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        heartbeat: {
          '0%, 100%': { transform: 'scale(1)' },
          '14%': { transform: 'scale(1.15)' },
          '28%': { transform: 'scale(1)' },
          '42%': { transform: 'scale(1.15)' },
          '70%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-glow': 'pulseGlow 2s infinite ease-in-out',
        'radar-spin': 'radarSpin 4s linear infinite',
        'heartbeat': 'heartbeat 1.8s ease-in-out infinite',
        'float': 'float 3s ease-in-out infinite',
      }
    },
  },
  plugins: [],
}
