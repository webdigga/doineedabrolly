import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  // Wrangler proxies to Vite, so suppress the misleading localhost:5173 message
  logLevel: 'warn',
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@services': resolve(__dirname, './src/services'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@styles': resolve(__dirname, './src/styles'),
    },
  },
  build: {
    // Chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk for React
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Disable source maps for smaller production builds
    sourcemap: false,
  },
  // Drop console in production
  esbuild: {
    drop: ['console', 'debugger'],
  },
});
