import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // Global ignores: never even try to lint these. Listed first so the rest of
  // the config doesn't try to parse them with the TS parser (which would
  // require them to be in tsconfig.json) and emit "parserOptions.project"
  // parsing errors.
  {
    ignores: [
      '.next/**/*',
      'node_modules/**/*',
      'dist/**/*',
      'build/**/*',
      'coverage/**/*',
      '**/*.log',
      'cypress/**/*',
      // Plain JS / CJS infrastructure that lives outside tsconfig include:
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.ts',
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.ts',
      'jest.config.cjs',
      'jest.setup.js',
      'scripts/**/*.cjs',
      'scripts/**/*.js',
      'services/**/*.js',
      'docs/**/*.js',
      '__mocks__/**/*.js',
      'app/**/*.json/route.ts', // route-as-folder JSON endpoints fail TS project parse
      'components/icons/svg/index.tsx', // Excluded from tsconfig
    ],
  },
  // Recommended JS rules apply everywhere we still lint.
  eslint.configs.recommended,
  // Type-aware TypeScript rules — restrict to TS/TSX only so JS files don't
  // need to be in the project graph.
  ...tseslint.configs.recommended.map((cfg) => ({
    ...cfg,
    files: ['**/*.ts', '**/*.tsx'],
  })),
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: {
      '@next/next': nextPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin,
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
      'jsx-a11y/aria-proptypes': 'warn',
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
  }
);
