import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: './',
    plugins: [react()],
    server: {
        port: 5000,
        host: true,
        proxy: {
            '/api': {
                target: process.env.API_TARGET ?? 'https://hack.kinoko.su',
                changeOrigin: true,
                secure: false,
            },
            '/ws': {
                target: process.env.WS_TARGET ?? 'wss://hack.kinoko.su',
                ws: true,
                changeOrigin: true,
            },
        },
    },
});
