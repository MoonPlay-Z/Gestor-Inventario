import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig({
  plugins: [
    react(),
    basicSsl(), // ← Habilita HTTPS automático (cert autofirmado) para acceso a cámara desde móvil
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly',
      generateScopedName: '[name]__[local]___[hash:base64:5]',
    },
  },
  server: {
    port: 5173,
    https: true,   // ← Requerido para getUserMedia() / BarcodeDetector en navegadores móviles
    host: true,    // ← Expone en toda la red local (0.0.0.0) para acceso desde el teléfono
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    }
  }
});
