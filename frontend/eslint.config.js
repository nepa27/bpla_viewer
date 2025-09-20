import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import prettier from 'eslint-plugin-prettier';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  {
    ignores: ['dist', 'node_modules'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      prettier: prettier,
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      'prettier/prettier': 'error',
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
  eslintConfigPrettier, // Отключает правила ESLint, которые конфликтуют с Prettier
];

// import js from '@eslint/js';
// import reactHooks from 'eslint-plugin-react-hooks';
// import reactRefresh from 'eslint-plugin-react-refresh';
// import globals from 'globals';
// import tseslint from 'typescript-eslint';
// import prettier from 'eslint-plugin-prettier';
// import eslintConfigPrettier from 'eslint-config-prettier';

// export default tseslint.config(
//   {
//     ignores: ['dist', 'node_modules'],
//   },
//   {
//     files: ['**/*.{js,jsx}'],
//     languageOptions: {
//       ecmaVersion: 2020,
//       globals: globals.browser,
//       parserOptions: {
//         ecmaFeatures: { jsx: true },
//       },
//     },
//     plugins: {
//       'react-hooks': reactHooks,
//       'react-refresh': reactRefresh,
//       prettier: prettier,
//     },
//     rules: {
//       ...js.configs.recommended.rules,
//       ...reactHooks.configs.recommended.rules,
//       'react-refresh/only-export-components': [
//         'warn',
//         { allowConstantExport: true },
//       ],
//       'prettier/prettier': 'error',
//     },
//     settings: {
//       react: {
//         version: 'detect',
//       },
//     },
//   },
//   eslintConfigPrettier // Отключает правила ESLint, которые конфликтуют с Prettier
// );
