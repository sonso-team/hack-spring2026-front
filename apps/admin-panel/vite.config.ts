import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.API_TARGET ?? 'http://localhost:8800',
        changeOrigin: true,
      },
      '/ws': {
        target: process.env.WS_TARGET ?? 'ws://localhost:8800',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
