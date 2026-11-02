import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Memungkinkan build statis bekerja pada PWA, root server, dan Capacitor hybrid
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost/haidku',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});

