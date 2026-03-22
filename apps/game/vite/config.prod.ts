import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    base: '/game/',
    plugins: [react()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    phaser: ['phaser'],
                },
            },
        },
        minify: 'terser',
        terserOptions: {
            compress: { passes: 2 },
            mangle: true,
            format: { comments: false },
        },
    },
    server: {
        port: 5000,
        host: true,
        allowedHosts: ["hack.kinoko.su"],
        
    },
});
