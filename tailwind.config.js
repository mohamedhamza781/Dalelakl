/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Brand identity: black + white + light "سكني" grey ─────
        ink:     { DEFAULT: '#242220', 50: '#8A8580', 100: '#6E6963', 200: '#57524C', 300: '#403C37', 400: '#2E2B28', 500: '#242220', 600: '#181614', 700: '#0E0D0C' },
        cream:   { DEFAULT: '#F5F4F2', 50: '#FFFFFF', 100: '#FAFAF9', 200: '#F1F0EE', 300: '#E6E4E1', 400: '#D8D6D2', 500: '#BEBBB5' },
        brass:   { DEFAULT: '#2E2B28', light: '#57524C', dark: '#0E0D0C' },

        // Back-compat aliases used across existing components
        dark:    { DEFAULT: '#242220', 2: '#403C37', 3: '#57524C', 4: '#6E6963' },
        stone:   { DEFAULT: '#F1F0EE', 2: '#E6E4E1', 3: '#D8D6D2' },
        border:  { DEFAULT: '#E6E4E1', light: '#F1F0EE' },
        gold:    { DEFAULT: '#2E2B28', light: '#57524C', dark: '#0E0D0C' },
      },
      fontFamily: {
        tajawal: ['"IBM Plex Sans Arabic"', 'Tajawal', 'sans-serif'],
        display: ['"IBM Plex Sans Arabic"', 'Tajawal', 'sans-serif'],
      },
      boxShadow: {
        soft:  '0 2px 10px -2px rgba(36,34,32,0.06)',
        card:  '0 8px 30px -12px rgba(36,34,32,0.14)',
        lift:  '0 20px 45px -18px rgba(36,34,32,0.22)',
      },
      letterSpacing: {
        wide2: '.14em',
      },
      animation: {
        'fade-up':  'fadeUp .5s ease both',
        'fade-in':  'fadeIn .4s ease both',
        'slide-in': 'slideIn .35s ease both',
      },
      keyframes: {
        fadeUp:  { from: { opacity: 0, transform: 'translateY(20px)' }, to: { opacity: 1, transform: 'none' } },
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideIn: { from: { transform: 'translateX(100%)' }, to: { transform: 'none' } },
      },
    },
  },
  plugins: [],
}