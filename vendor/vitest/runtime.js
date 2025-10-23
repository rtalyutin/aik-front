import { createTestEnvironment } from './index.js'

if (typeof globalThis.describe !== 'function') {
  createTestEnvironment()
}

export const describe = globalThis.describe
export const it = globalThis.it
export const test = globalThis.test
export const expect = globalThis.expect
export const beforeEach = globalThis.beforeEach
export const afterEach = globalThis.afterEach
