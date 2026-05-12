/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        kau: {
          50: '#e8f5ee',
          100: '#c7e5d3',
          200: '#9fd2b3',
          300: '#6fbc8c',
          400: '#3da267',
          500: '#1c8a4d',
          600: '#0f6b4a',
          700: '#0a5239',
          800: '#073d2a',
          900: '#04261a',
        },
      },
      fontFamily: {
        sans: ['Cairo', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        arabic: ['Cairo', 'Tajawal', 'Tahoma', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'page-in': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'section-in': {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 200ms ease-out',
        'fade-in': 'fade-in 250ms ease-out both',
        'slide-in-up': 'slide-in-up 300ms ease-out both',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
        marquee: 'marquee 22s linear infinite',
        'page-in': 'page-in 280ms cubic-bezier(0.22,1,0.36,1) both',
        'section-in': 'section-in 500ms cubic-bezier(0.22,1,0.36,1) both',
      },
    },
  },
  plugins: [],
};
