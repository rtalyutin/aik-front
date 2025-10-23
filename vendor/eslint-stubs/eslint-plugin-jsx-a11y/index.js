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

module.exports = {
  meta: {
    name: 'eslint-plugin-jsx-a11y-stub',
    version: '0.0.0-stub',
  },
  configs: {
    recommended: {
      plugins: ['jsx-a11y'],
      rules: {
        'jsx-a11y/alt-text': 'warn',
      },
    },
  },
  rules: {
    'alt-text': noopRule,
  },
}
