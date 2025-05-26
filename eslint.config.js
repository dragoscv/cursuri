import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin
    },
    rules: {
      // Add overrides for specific rules here
      '@next/next/no-html-link-for-pages': 'warn',
      'no-unused-vars': 'off', // Turn off base rule
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': 'warn',
      'no-empty-function': 'off', // Turn off base rule
      '@typescript-eslint/no-empty-function': 'warn'
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json'
      }
    }
  },
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      '**/*.log',
      'cypress/**/*',
      '**/*.config.js',
      '**/*.config.ts',
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.ts'
    ]
  }
);
