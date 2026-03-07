import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'logs/**',
      'test-results/**',
      'playwright-report/**',
      '.playwright/**',
      'package.json',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'no-console': [
        'error',
        {
          allow: ['warn', 'error', 'info'],
        },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_|^expect$', // Allow expect to be unused (imported from fixtures)
        },
      ],
    },
  },

  // ===== ARCHITECTURAL RULES (ESLint Architecture Lock) =====
  
  // TESTS LAYER: Can only import from scenarios, fixtures, constants, utils
  {
    files: ['tests/**/*.spec.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        // Block Pages
        { name: '*/pages/*', message: '❌ ARCHITECTURE VIOLATION: Tests cannot import Pages. Use scenarios instead.' },
        { name: '*/pages/**', message: '❌ ARCHITECTURE VIOLATION: Tests cannot import Pages. Use scenarios instead.' },
        // Block direct Playwright
        { name: '@playwright/test', message: '❌ ARCHITECTURE VIOLATION: Tests cannot use Playwright directly. Use fixtures and scenarios.' },
        // Block assertions
        { name: '*/assertions/*', message: '❌ ARCHITECTURE VIOLATION: Tests cannot import assertions. Assertions are in scenarios.' },
        { name: '*/assertions/**', message: '❌ ARCHITECTURE VIOLATION: Tests cannot import assertions. Assertions are in scenarios.' },
      ],
      // Allow unused fixture parameters (provided by test framework)
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_|accountAPI|testInfo',
          varsIgnorePattern: '^_|^expect$',
        },
      ],
    },
  },

  // SCENARIOS LAYER: Can only import Pages, fixtures, constants, other scenarios, assertions
  {
    files: ['tests/**/*.scenario.ts', 'scenarios/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        // Block direct Playwright
        { name: '@playwright/test', message: '❌ ARCHITECTURE VIOLATION: Scenarios cannot import Playwright. Use Pages instead.' },
        // Block test files
        { name: '*/tests/*', message: '❌ ARCHITECTURE VIOLATION: Scenarios cannot import test files.' },
        { name: '*/tests/**', message: '❌ ARCHITECTURE VIOLATION: Scenarios cannot import test files.' },
      ],
    },
  },

  // ASSERTIONS LAYER: Can only import constants, utils (read-only access to Pages via types)
  {
    files: ['**/*assertions*.ts', 'scenarios/assertions/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        // Block test files
        { name: '*/tests/*', message: '❌ ARCHITECTURE VIOLATION: Assertions cannot import test files.' },
        { name: '*/tests/**', message: '❌ ARCHITECTURE VIOLATION: Assertions cannot import test files.' },
        // Block scenarios
        { name: '*/scenarios/*', message: '⚠️ Avoid circular imports: assertions are imported BY scenarios.' },
        { name: '*/scenarios/**', message: '⚠️ Avoid circular imports: assertions are imported BY scenarios.' },
      ],
    },
  },

  // PAGES LAYER: Minimal imports (only Playwright locators, no business logic)
  {
    files: ['pages/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        // Block scenarios
        { name: '*/scenarios/*', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import scenarios.' },
        { name: '*/scenarios/**', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import scenarios.' },
        // Block test files
        { name: '*/tests/*', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import test files.' },
        { name: '*/tests/**', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import test files.' },
        // Block assertions
        { name: '*/assertions/*', message: '❌ ARCHITECTURE VIOLATION: Pages cannot contain assertions.' },
        { name: '*/assertions/**', message: '❌ ARCHITECTURE VIOLATION: Pages cannot contain assertions.' },
        // Block fixtures
        { name: '*/fixtures/*', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import fixtures.' },
        { name: '*/fixtures/**', message: '❌ ARCHITECTURE VIOLATION: Pages cannot import fixtures.' },
      ],
    },
  },

  // FIXTURES LAYER: Only Pages, constants, utils
  {
    files: ['fixtures/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        // Block scenarios
        { name: '*/scenarios/*', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import scenarios.' },
        { name: '*/scenarios/**', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import scenarios.' },
        // Block test files
        { name: '*/tests/*', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import test files.' },
        { name: '*/tests/**', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import test files.' },
        // Block assertions
        { name: '*/assertions/*', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import assertions.' },
        { name: '*/assertions/**', message: '❌ ARCHITECTURE VIOLATION: Fixtures cannot import assertions.' },
      ],
    },
  },
];
