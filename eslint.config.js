import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    rules: {
      // Add overrides for specific rules here
      '@next/next/no-html-link-for-pages': 'warn',
      'no-unused-vars': 'off', // Turn off base rule
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-empty': 'warn',
      'no-empty-function': 'off', // Turn off base rule
      '@typescript-eslint/no-empty-function': 'warn',
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      // JSX A11y rules
      'jsx-a11y/aria-proptypes': 'warn'
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
      'tailwind.config.ts',
      'components/icons/svg/index.tsx' // Excluded from tsconfig
    ]
  }
);
