const js = require('@eslint/js')
const globals = require('globals')
const reactHooks = require('eslint-plugin-react-hooks')
const reactRefresh = require('eslint-plugin-react-refresh')
const jsxA11y = require('eslint-plugin-jsx-a11y')
const security = require('eslint-plugin-security')
const prettierPlugin = require('eslint-plugin-prettier')

const files = ['**/*.{js,jsx}']
const languageOptions = {
  ecmaVersion: 'latest',
  sourceType: 'module',
  globals: {
    ...globals.browser,
    ...globals.node,
  },
  parserOptions: {
    ecmaFeatures: { jsx: true },
  },
}

module.exports = [
  {
    ignores: ['dist', 'coverage', 'vite.config.ts'],
  },
  {
    files,
    ignores: ['node_modules'],
    languageOptions,
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'jsx-a11y': jsxA11y,
      security,
      prettier: prettierPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      ...js.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactRefresh.configs.vite.rules,
      ...jsxA11y.configs.recommended.rules,
      ...security.configs.recommended.rules,
      ...prettierPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^(?:_|[A-Z])', varsIgnorePattern: '^[A-Z_]' },
      ],
    },
  },
  {
    files: ['**/*.test.{js,jsx}'],
    languageOptions: {
      ...languageOptions,
      globals: {
        ...languageOptions.globals,
        ...globals.jest,
      },
    },
  },
]
