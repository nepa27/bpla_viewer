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
    collectCoverage: true,
    // reporter: '@vitest/coverage-reporter', //@TODO
    collectCoverageFrom: [
      '<rootDir>/src/**/*.{js,jsx}',
      '!**/*.test.js',
      '!**/node_modules/**',
      '!**/public/**',
      '!**/assets/**',
    ],
    coverageThreshold: {
      global: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    css: true,
    svg: true,
  },
});

// /// <reference types="vitest"/>
// import react from '@vitejs/plugin-react';
// import path from 'path';
// import { defineConfig } from 'vite';

// export default defineConfig({
//   plugins: [react()],
//   resolve: {
//     alias: {
//       '@pages': path.resolve('./src/pages'),
//       '@modules': path.resolve('./src/modules'),
//       '@components': path.resolve('./src/components'),
//       '@ui': path.resolve('./src/ui'),
//       '@hooks': path.resolve('./src/hooks'),
//     },
//   },
//   test: {
//     globals: true,
//     environment: 'jsdom',
//     setupFiles: './src/helpers/setupTests.js',
//     css: true,
//     svg: true,
//   },
// });
