import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Performance-oriented build config:
// - manualChunks splits vendor code from app code for better browser caching
// - esbuild minification (fast, small output)
// - assetsInlineLimit keeps small assets (icons) inlined, avoids extra requests
export default defineConfig({
  plugins: [react()],
  // host: true expose le serveur de dev sur le réseau local (pas seulement
  // "localhost"), pour pouvoir tester depuis un téléphone sur le même Wi-Fi
  // (ex: scanner un QR code de carte de fidélité).
  server: {
    host: true,
  },
  build: {
    target: 'es2018',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },
});
