/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: { DEFAULT: '#0F1B3C', deep: '#080D1F' },
        orange: '#FF7A29',
        red: '#E8432C',
        purple: '#8B2FC9',
        cyan: '#29ABE2',
        blue: '#1B4FDB',
        bg: '#F6F7FB',
        muted: '#5B6478',
        line: '#E4E7F0',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      backgroundImage: {
        'full-grad': 'linear-gradient(120deg, #FF7A29 0%, #E8432C 30%, #8B2FC9 52%, #1B4FDB 78%, #29ABE2 100%)',
        'sun-grad': 'linear-gradient(135deg, #FF7A29 0%, #E8432C 45%, #8B2FC9 100%)',
        'sky-grad': 'linear-gradient(135deg, #29ABE2 0%, #1B4FDB 100%)',
      },
      boxShadow: {
        soft: '0 20px 45px -20px rgba(15,27,60,.28)',
      },
      borderRadius: {
        xl2: '18px',
      },
      keyframes: {
        driftBg: {
          from: { transform: 'translate(0,0) scale(1)' },
          to: { transform: 'translate(2%,-3%) scale(1.06)' },
        },
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-9px)' },
        },
        fadeUp: {
          from: { opacity: 0, transform: 'translateY(24px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        drift: 'driftBg 22s ease-in-out infinite alternate',
        floaty: 'floaty 5s ease-in-out infinite',
        fadeUp: 'fadeUp .35s ease',
      },
    },
  },
  plugins: [],
};
