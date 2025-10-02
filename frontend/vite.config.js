import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@pages': path.resolve('./src/pages'),
      '@modules': path.resolve('./src/modules'),
      '@components': path.resolve('./src/entities'),
      '@ui': path.resolve('./src/ui'),
      '@hooks': path.resolve('./src/hooks'),
    },
  },
});
