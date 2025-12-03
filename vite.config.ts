import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Removemos o "server: { proxy... }" pois vamos conectar direto
  root: './',
  build: {
    outDir: 'dist',
  }
});
