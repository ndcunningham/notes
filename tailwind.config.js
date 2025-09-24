const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    join(
      __dirname,
      '{src,pages,components,app}/**/*!(*.stories|*.spec).{ts,tsx,html}'
    ),
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
        colors: {
        ink: '#1f2937',
        panel: '#ffffff',
        noteYellow: '#FEF3C7',
        notePink: '#FBE0E6',
        noteBlue: '#DAF0FF',
        noteGreen: '#DCFCE7',
        notePurple: '#EDE9FE',
      },
      keyframes: {
        pop: {
          '0%': { opacity: '0', transform: 'scale(0.98)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: { note: '0 10px 25px rgba(0,0,0,0.08)' },
      container: {
        center: true,
        padding: '1rem',
      },
      animation: {
        pop: 'pop 160ms ease-out',
        fadeUp: 'fadeUp 160ms ease-out',
      },
    },
  },
  plugins: [],
};
