import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Tailwind v4 runs as a Vite plugin; design tokens live in src/styles/tokens.css (@theme).
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
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
  },
});
