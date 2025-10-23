import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export const resolveAliases = {
  '@': resolve(__dirname, 'src'),
}

export const testConfig = {
  environment: 'jsdom',
  setupFiles: resolve(__dirname, 'src/setupTests.js'),
  coverage: {
    provider: 'c8',
    reporter: ['text', 'html'],
    reportsDirectory: resolve(__dirname, 'coverage'),
  },
}

export default {
  resolve: {
    alias: resolveAliases,
  },
  test: testConfig,
}
