import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind v4 runs as a Vite plugin; design tokens live in src/styles/tokens.css (@theme).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // The Firestore SDK (~580 kB) is one chunk that cannot be split further. It is loaded
    // on demand (src/lib/cloud.js), only when cloud alerts are on, so it never slows first load.
    chunkSizeWarningLimit: 600,
    rolldownOptions: {
      output: {
        // Big libraries get their own cached chunks, keeping each under the 500 kB warning.
        codeSplitting: {
          groups: [
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|d3-|victory|es-toolkit|immer|@reduxjs|redux|reselect)/,
            },
            { name: 'motion', test: /node_modules[\\/](framer-motion|motion-)/ },
            { name: 'react', test: /node_modules[\\/](react|react-dom|scheduler)[\\/]/ },
          ],
        },
      },
    },
  },
  test: {
    include: ['tests/**/*.test.js'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      // Pure logic is unit-tested; React views are covered by lint (jsx-a11y) and manual QA.
      include: [
        'src/lib/**',
        'src/store/{reducer,selectors,persistence}.js',
        'src/data/**',
        'src/features/commands/sentences.js',
        'functions/alerts.js',
        'functions/telegram.js',
      ],
      exclude: ['src/lib/cloud.js'], // thin Firebase wrapper, needs a live project
      thresholds: { statements: 90, branches: 85, functions: 90, lines: 90 },
    },
  },
});
