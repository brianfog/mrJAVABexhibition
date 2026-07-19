import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // Allow access from network devices
    port: 5173, // Default Vite port
    proxy: {
      '/api': {
        target: 'https://mrjavab.com',
        changeOrigin: true,
        secure: true,
      },
      '/node-api': {
        target: 'https://node.mrjavab.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/node-api/, ''),
      },
    },
  },
});
