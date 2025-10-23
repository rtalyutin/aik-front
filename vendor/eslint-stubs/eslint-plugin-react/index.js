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

const recommendedConfig = {
  plugins: ['react'],
  settings: {
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/display-name': 'off',
    'react/jsx-uses-react': 'off',
    'react/jsx-uses-vars': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
}

module.exports = {
  meta: {
    name: 'eslint-plugin-react-stub',
    version: '0.0.0-stub',
  },
  configs: {
    recommended: recommendedConfig,
  },
  rules: {
    'display-name': noopRule,
    'jsx-uses-react': noopRule,
    'jsx-uses-vars': noopRule,
    'react-in-jsx-scope': noopRule,
  },
}
