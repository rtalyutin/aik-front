import Module from 'node:module'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

process.env.ESLINT_USE_FLAT_CONFIG = 'false'

const __dirname = dirname(fileURLToPath(import.meta.url))
const stubModuleRoot = resolve(__dirname, '../vendor/eslint-stubs')
const nodePathSeparator = process.platform === 'win32' ? ';' : ':'

process.env.NODE_PATH = [stubModuleRoot, process.env.NODE_PATH]
  .filter(Boolean)
  .join(nodePathSeparator)
Module._initPaths()

process.on('warning', (warning) => {
  if (warning.name === 'ESLintIgnoreWarning') {
    return
  }
  console.warn(warning)
})

let ESLint

try {
  ;({ ESLint } = await import('eslint'))
} catch (error) {
  if (error.code === 'ERR_MODULE_NOT_FOUND' || error.message?.includes("Cannot find package 'eslint'")) {
    console.error('ESLint is not installed. Please run "npm install" to install the development dependencies.')
    process.exit(1)
  }
  throw error
}

const eslint = new ESLint()

const results = await eslint.lintFiles([
  'src/**/*.{js,jsx,ts,tsx}',
  'scripts/**/*.{js,mjs,ts}',
])

const formatter = await eslint.loadFormatter('stylish')
const output = formatter.format(results)

if (output) {
  process.stdout.write(output)
}

let errorCount = 0
let warningCount = 0

for (const result of results) {
  errorCount += result.errorCount
  warningCount += result.warningCount
}

if (errorCount > 0) {
  process.exitCode = 1
} else if (warningCount === 0) {
  console.log('ESLint finished without warnings.')
}
