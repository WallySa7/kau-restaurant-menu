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
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Tahoma', 'sans-serif'],
        arabic: ['Tahoma', 'Segoe UI', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 200ms ease-out',
        shimmer: 'shimmer 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
