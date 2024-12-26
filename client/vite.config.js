import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill';
import { NodeModulesPolyfillPlugin } from '@esbuild-plugins/node-modules-polyfill';
import rollupNodePolyfills from 'rollup-plugin-node-polyfills';

export default defineConfig({
  base: '/',
  plugins: [
    react(),
    NodeGlobalsPolyfillPlugin({
      buffer: true
    }),
    NodeModulesPolyfillPlugin(),
    rollupNodePolyfills(),
  ],
  resolve: {
    alias: {
      buffer: 'buffer',
      process: 'process/browser',
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis',
      },
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true
        }),
        NodeModulesPolyfillPlugin()
      ]
    },
  },
  build: {
    rollupOptions: {
      plugins: [
        rollupNodePolyfills()
      ]
    }
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://seha.work',
        changeOrigin: true,
        secure: true,
      },
      '/auth': {
        target: 'https://seha.work',
        changeOrigin: true,
        secure: true,
      },
    },
    hmr: {
      protocol: 'wss',
      host: 'www.seha.work',
      clientPort: 443,
      port: 5173,  // استخدام منفذ مختلف
    },
  },
  assetsInclude: ['**/*.html'],
});
