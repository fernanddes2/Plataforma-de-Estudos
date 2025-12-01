import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Isso diz ao Vite que a raiz do projeto é a pasta atual (onde está o index.html)
  root: './', 
  build: {
    outDir: 'dist',
  },
  server: {
    // Isso ajuda se você estiver rodando em container ou WSL
    host: true 
  }
});
