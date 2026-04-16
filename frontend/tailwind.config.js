export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
        display: ['"Outfit"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          navy: '#0f172a',
          slate: '#1e293b',
          accent: '#4f46e5',
          gold: '#b45309',
        },
      },
      boxShadow: {
        soft: '0 4px 24px -4px rgba(15, 23, 42, 0.08), 0 2px 8px -2px rgba(15, 23, 42, 0.04)',
        lift: '0 12px 40px -12px rgba(15, 23, 42, 0.12)',
        glow: '0 8px 32px -8px rgba(99, 102, 241, 0.35)',
      },
    },
  },
  plugins: [],
};
