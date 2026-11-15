import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const earthdataToken = env.EARTHDATA_TOKEN || '';

  return {
    plugins: [react()],
    server: {
      proxy: {
        '/api/asf': {
          target: 'https://api.daac.asf.alaska.edu',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/asf/, ''),
        },
        // Earthdata CMR (Data API) — inject bearer token server-side only.
        '/api/cmr': {
          target: 'https://cmr.earthdata.nasa.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/cmr/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq) => {
              if (earthdataToken) {
                proxyReq.setHeader('Authorization', `Bearer ${earthdataToken}`);
              }
            });
          },
        },
        // NASA GIBS imagery (Earthdata) — public WMTS; do NOT send bearer (breaks tiles).
        '/api/gibs': {
          target: 'https://gibs.earthdata.nasa.gov',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gibs/, ''),
        },
        '/api/restcountries': {
          target: 'https://restcountries.com',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/restcountries/, ''),
        },
      },
    },
  };
});
