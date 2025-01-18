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
    outDir: 'build', // تأكد أنك تستخدم المجلد الصحيح للإخراج
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
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://127.0.0.1:4000',
        changeOrigin: true,
        secure: false,
      },
    },
    fs: {
      allow: ['client/public/sehaAp']
    }
  },
  assetsInclude: ['**/*.html'],
});