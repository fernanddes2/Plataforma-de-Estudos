import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: './',
  build: {
    outDir: 'dist',
  },
  server: {
    host: true,
    // AQUI ESTÁ O TRUQUE: Proxy
    proxy: {
      '/api': {
        target: 'http://localhost:3001', // Aponta para nosso servidor Node
        changeOrigin: true,
        secure: false,
      }
    }
  }
});