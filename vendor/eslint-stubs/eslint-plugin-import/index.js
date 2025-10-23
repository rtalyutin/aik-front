const noopRule = {
  meta: {
    docs: {
      description: 'No-op stub rule for offline linting.',
      recommended: false,
    },
    schema: [],
    messages: {},
  },
  create() {
    return {}
  },
}

const configs = {
  errors: {
    plugins: ['import'],
    rules: {
      'import/no-unresolved': 'off',
    },
  },
  warnings: {
    plugins: ['import'],
    rules: {
      'import/export': 'off',
    },
  },
  typescript: {
    plugins: ['import'],
    rules: {},
  },
}

module.exports = {
  meta: {
    name: 'eslint-plugin-import-stub',
    version: '0.0.0-stub',
  },
  configs,
  rules: {
    'no-unresolved': noopRule,
    export: noopRule,
  },
}
