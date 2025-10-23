import { createRequire } from 'node:module'
import { dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import js from '@eslint/js'
import { FlatCompat } from '@eslint/eslintrc'

const require = createRequire(import.meta.url)
const baseDirectory = dirname(fileURLToPath(import.meta.url))
const compat = new FlatCompat({
  baseDirectory,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

const legacyConfig = require('./.eslintrc.cjs')

export default [
  ...compat.config(legacyConfig),
  {
    ignores: ['dist/**', 'node_modules/**', 'coverage/**'],
  },
]
