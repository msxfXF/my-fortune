import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        manualChunks: { lunar: ['lunar-javascript'], react: ['react', 'react-dom'] },
      },
    },
  },
  test: {
    environment: 'node',
  },
} as never);
