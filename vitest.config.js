import { defineConfig } from 'vitest/config'
import viteConfig, { resolveAliases, testConfig } from './vite.config.js'

export default defineConfig({
  resolve: {
    alias: resolveAliases,
  },
  test: testConfig,
  vite: viteConfig,
})
