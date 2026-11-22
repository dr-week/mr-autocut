import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@zuari/signals': path.resolve(__dirname, 'vendor/fast-framework/packages/signals/src/index.ts'),
      '@zuari/tokens': path.resolve(__dirname, 'vendor/fast-framework/packages/tokens/src/index.ts'),
      '@zuari/presets': path.resolve(__dirname, 'vendor/fast-framework/packages/presets/src/index.ts'),
      '@zuari/recipes': path.resolve(__dirname, 'vendor/fast-framework/packages/recipes'),
    },
  },
  server: { proxy: { '/api': 'http://127.0.0.1:8000' } },
});
