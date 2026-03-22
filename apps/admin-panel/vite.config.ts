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
        target: 'http://localhost:8800',
        changeOrigin: true,
        headers: {
          origin: 'http://localhost:8800',
        },
      },
      '/ws': {
        target: 'ws://localhost:8800',
        ws: true,
        changeOrigin: true,
      },
    },
  },
});
