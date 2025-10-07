/// <reference types="vitest"/>
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pages': path.resolve('./src/pages'),
      '@modules': path.resolve('./src/modules'),
      '@components': path.resolve('./src/components'),
      '@ui': path.resolve('./src/ui'),
      '@hooks': path.resolve('./src/hooks'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/helpers/setupTests.js',
    css: true,
    svg: true,
  },
});
