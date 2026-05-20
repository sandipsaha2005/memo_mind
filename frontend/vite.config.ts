import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  server: {
    host: "0.0.0.0",
    port: 4173,

    proxy: {
      "/api": {
        target: "http://backend:9999",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Removes /api from the path
        configure: (proxy) => {
          // Log when the proxy receives a request from the client
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(proxyReq);
            console.log('Sending Request to Target:', req.method, req.url);
          });

          // Log when the proxy receives a response from the target
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('Received Response from Target:', proxyRes.statusCode, req.url);
          });

          // Log any proxy errors
          proxy.on('error', (err) => {
            console.error('Proxy Error:', err);
          });
        },
      },
    },
  },
})
