import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://backend:5000',
        changeOrigin: true,
        secure: false
      },
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost', // Base domain for HMR
    },
    allowedHosts: [
      'all',
      '.poridhi.io',      // All subdomains of poridhi.io
      '.lab.poridhi.io',  // All subdomains of lab.poridhi.io
    ],
  },
});