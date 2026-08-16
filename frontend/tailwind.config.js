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
          950: '#071426',
          900: '#0B1F3A',
          800: '#11233B',
          700: '#1A2F4C',
          600: '#263F63',
          500: '#3A567F',
        },
        carelink: {
          deepnavy: '#071426',
          navyblue: '#0B1F3A',
          hospitalblue: '#1769AA',
          brightblue: '#2188D9',
          teal: '#00A6A6',
          cyan: '#2BD9E8',
          lightblue: '#EAF5FF',
          gray: '#F4F7FA',
          red: '#D32F2F',
          orange: '#F57C00',
          green: '#2E8B57',
          purple: '#6C63FF',
        },
        hospital: {
          50: '#EAF5FF',
          100: '#D4EBFF',
          500: '#1769AA',
          600: '#125488',
          700: '#0B1F3A',
        },
        teal: {
          500: '#00A6A6',
          400: '#2BD9E8',
        },
        emergencyred: '#D32F2F',
        warningorange: '#F57C00',
        successgreen: '#2E8B57',
        specialpurple: '#6C63FF',
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
          '0%, 100%': { boxShadow: '0 0 15px rgba(43, 217, 232, 0.4)' },
          '50%': { boxShadow: '0 0 25px rgba(43, 217, 232, 0.8)' },
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
