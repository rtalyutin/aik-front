const espree = require('espree')

function toEspreeOptions(options = {}) {
  const {
    range = true,
    loc = true,
    tokens = true,
    comment = true,
    ecmaFeatures = {},
    ecmaVersion = 2022,
    sourceType = 'module',
  } = options

  return {
    ...options,
    range,
    loc,
    tokens,
    comment,
    ecmaVersion,
    sourceType,
    ecmaFeatures: {
      jsx: true,
      ...ecmaFeatures,
    },
  }
}

function parseForESLint(code, options = {}) {
  const parserOptions = toEspreeOptions(options)
  const ast = espree.parse(code, parserOptions)

  return {
    ast,
    services: {},
    scopeManager: null,
    visitorKeys: espree.VisitorKeys,
  }
}

module.exports = {
  parse(code, options) {
    return parseForESLint(code, options).ast
  },
  parseForESLint,
  meta: {
    name: '@typescript-eslint/parser-stub',
    version: '0.0.0-stub',
  },
}
