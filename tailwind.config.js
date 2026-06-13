/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0F172A',
        slatey: '#64748B',
        brand: { DEFAULT: '#6366F1', soft: '#818CF8', dark: '#4F46E5' },
        ok: '#16A34A',
        warn: '#EAB308',
        bad: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
        'float': 'float 7s ease-in-out infinite',
        'pulse-dot': 'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        pulseDot: { '0%,100%': { opacity: '1', boxShadow: '0 0 0 0 rgba(99,102,241,.4)' }, '50%': { opacity: '.7', boxShadow: '0 0 0 7px rgba(99,102,241,0)' } },
      },
    },
  },
  plugins: [],
};
