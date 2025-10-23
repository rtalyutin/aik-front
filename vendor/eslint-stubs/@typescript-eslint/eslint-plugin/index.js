const { builtinRules } = require('eslint/use-at-your-own-risk')

const baseRule = builtinRules && builtinRules.get ? builtinRules.get('no-unused-vars') : null

const fallbackNoopRule = {
  meta: {
    type: 'problem',
    docs: {
      description: 'No-op stub rule when ESLint builtin no-unused-vars is unavailable.',
      recommended: false,
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}

const noUnusedVarsRule = baseRule
  ? {
      meta: {
        ...baseRule.meta,
        docs: {
          ...(baseRule.meta?.docs || {}),
          description: 'Enforce unused variables are removed (TypeScript stub).',
          recommended: true,
          url: 'https://typescript-eslint.io/rules/no-unused-vars/',
        },
      },
      create(context) {
        return baseRule.create(context)
      },
    }
  : fallbackNoopRule

const recommendedConfig = {
  plugins: ['@typescript-eslint'],
  parser: require.resolve('@typescript-eslint/parser'),
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      },
    ],
  },
}

module.exports = {
  meta: {
    name: '@typescript-eslint/eslint-plugin-stub',
    version: '0.0.0-stub',
  },
  configs: {
    recommended: recommendedConfig,
  },
  rules: {
    'no-unused-vars': noUnusedVarsRule,
  },
}
