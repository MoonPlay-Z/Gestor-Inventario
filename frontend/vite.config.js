import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => {
  // Lee también variables sin el prefijo VITE_ (p. ej. BACKEND_PORT) para
  // poder mover el backend sin tocar este archivo.
  const env = loadEnv(mode, process.cwd(), '');

  // ─── Destino del proxy /api ────────────────────────────────────────────────
  // Orden de resolución:
  //   1. VITE_PROXY_TARGET  → URL completa (útil en `frontend/.env.local`)
  //   2. BACKEND_PORT        → sólo el puerto
  //   3. 3001                → valor histórico por defecto
  //
  // Motivo: si otro servicio ocupa el 3001 (en esta máquina lo hace el gateway
  // local de modelos), el backend no puede arrancar y el proxy terminaría
  // hablando con el intruso: /api/health devuelve 401 y /api/public/noticias
  // 404 en la consola del navegador. Con VITE_PROXY_TARGET se apunta al puerto
  // correcto sin tocar código.
  const backendPort = env.BACKEND_PORT || process.env.BACKEND_PORT || 3001;
  const apiTarget = env.VITE_PROXY_TARGET || `http://127.0.0.1:${backendPort}`;

  return {
    plugins: [
      react(),
      basicSsl(), // ← Habilita HTTPS automático (cert autofirmado) para acceso a cámara desde móvil
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            iconify: ['@iconify/react'],
          },
        },
      },
    },
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
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          // Aviso explícito cuando el backend no está levantado, en vez de
          // dejar que el navegador muestre 404/401 sin explicación.
          configure(proxy) {
            proxy.on('error', (err) => {
              if (err.code === 'ECONNREFUSED') {
                console.error(
                  `\n[proxy] /api → ${apiTarget} no responde.\n` +
                  `        Arranca el backend (cd backend && npm run dev) o ajusta\n` +
                  `        VITE_PROXY_TARGET / BACKEND_PORT en frontend/.env.local.\n`
                );
              } else {
                console.error(`[proxy] /api → ${apiTarget}: ${err.message}`);
              }
            });
          },
        }
      }
    }
  };
});
