export { createTestEnvironment, runRegisteredSuites } from './index.js'

let expectRef = null

export function expect(...args) {
  if (!expectRef) {
    if (typeof globalThis.expect !== 'function') {
      throw new Error('Expect has not been initialised yet. Call createTestEnvironment() before importing vitest expect.')
    }
    expectRef = globalThis.expect
  }
  return expectRef(...args)
}

expect.extend = (matchers) => {
  if (!expectRef) {
    if (typeof globalThis.expect !== 'function') {
      throw new Error('Expect has not been initialised yet. Call createTestEnvironment() before importing vitest expect.')
    }
    expectRef = globalThis.expect
  }
  return expectRef.extend(matchers)
}
