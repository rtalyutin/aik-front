const registeredSuites = []
let currentSuite = null
let environmentCreated = false

const DOCUMENT_MARKER = Symbol.for('testing-library.in-document')

class Suite {
  constructor(name, parent = null) {
    this.name = name
    this.parent = parent
    this.tests = []
    this.children = []
    this.beforeEach = []
    this.afterEach = []
  }
}

class TestCase {
  constructor(name, fn, timeout) {
    this.name = name
    this.fn = fn
    this.timeout = timeout
  }
}

function ensureEnvironment() {
  if (!environmentCreated) {
    throw new Error('Test environment has not been initialised. Call createTestEnvironment() first.')
  }
}

export function createTestEnvironment() {
  if (environmentCreated) {
    return
  }
  environmentCreated = true
  const rootSuite = new Suite('(root)')
  currentSuite = rootSuite
  registeredSuites.length = 0
  registeredSuites.push(rootSuite)

  function describe(name, fn) {
    ensureEnvironment()
    const parent = currentSuite
    const child = new Suite(name, parent)
    parent.children.push(child)
    currentSuite = child
    try {
      fn()
    } finally {
      currentSuite = parent
    }
  }

  function it(name, fn, timeout) {
    ensureEnvironment()
    const testCase = new TestCase(name, fn, timeout)
    currentSuite.tests.push(testCase)
  }

  function registerHook(type, fn) {
    ensureEnvironment()
    if (!currentSuite) {
      throw new Error('Hooks must be registered within a describe block')
    }
    currentSuite[type].push(fn)
  }

  function expect(actual) {
    const baseMatchers = {
      toBe(expected) {
        if (actual !== expected) {
          throw new Error(`Expected ${actual} to strictly equal ${expected}`)
        }
      },
      toEqual(expected) {
        if (!deepEqual(actual, expected)) {
          throw new Error('Received value does not deep-equal the expected value')
        }
      },
    }

    const matchers = Object.create(null)
    for (const [name, matcher] of customMatchers) {
      matchers[name] = (...args) => {
        const context = { isNot: false, equals: deepEqual }
        const result = matcher.call(context, actual, ...args)
        handleMatcherResult(result, false, name)
      }
      matchers.not ??= {}
      matchers.not[name] = (...args) => {
        const context = { isNot: true, equals: deepEqual }
        const result = matcher.call(context, actual, ...args)
        handleMatcherResult(result, true, name)
      }
    }

    Object.assign(matchers, baseMatchers)
    return matchers
  }

  expect.extend = (matchers) => {
    for (const [name, matcher] of Object.entries(matchers)) {
      customMatchers.set(name, matcher)
    }
  }

  globalThis.describe = describe
  globalThis.it = it
  globalThis.test = it
  globalThis.beforeEach = (fn) => registerHook('beforeEach', fn)
  globalThis.afterEach = (fn) => registerHook('afterEach', fn)
  globalThis.expect = expect
}

const customMatchers = new Map()

function handleMatcherResult(result, isNot, matcherName) {
  if (result == null) {
    if (!isNot) {
      return
    }
    throw new Error(`Matcher ${matcherName} did not return a result object when used with .not`)
  }
  const pass = !!result.pass
  const message = typeof result.message === 'function' ? result.message : () => String(result.message ?? 'Assertion failed')
  if (pass === !isNot) {
    return
  }
  throw new Error(message())
}

function deepEqual(a, b) {
  if (Object.is(a, b)) {
    return true
  }
  if (typeof a !== typeof b) {
    return false
  }
  if (typeof a !== 'object' || a === null || b === null) {
    return false
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return a.every((value, index) => deepEqual(value, b[index]))
  }
  const aKeys = Object.keys(a)
  const bKeys = Object.keys(b)
  if (aKeys.length !== bKeys.length) {
    return false
  }
  return aKeys.every((key) => deepEqual(a[key], b[key]))
}

async function runSuite(suite, ancestors = []) {
  const path = suite.name === '(root)' ? [] : [...ancestors, suite.name]
  let failed = 0
  for (const test of suite.tests) {
    const hooks = collectHooks(suite, 'beforeEach')
    const teardown = collectHooks(suite, 'afterEach')
    try {
      for (const hook of hooks) {
        await hook()
      }
      await runTestCase(path, test)
      console.log(`✓ ${[...path, test.name].join(' > ')}`)
    } catch (error) {
      failed += 1
      console.error(`✗ ${[...path, test.name].join(' > ')}`)
      console.error(error instanceof Error ? error.stack ?? error.message : error)
    } finally {
      for (const hook of teardown) {
        try {
          await hook()
        } catch (error) {
          console.error('afterEach hook failed:', error)
        }
      }
    }
  }
  for (const child of suite.children) {
    failed += await runSuite(child, path)
  }
  return failed
}

function collectHooks(startSuite, type) {
  const hooks = []
  let suite = startSuite
  while (suite) {
    hooks.unshift(...suite[type])
    suite = suite.parent
  }
  return hooks
}

async function runTestCase(path, test) {
  const result = test.fn()
  if (result && typeof result.then === 'function') {
    await result
  }
}

export async function runRegisteredSuites() {
  ensureEnvironment()
  const [rootSuite] = registeredSuites
  const failed = await runSuite(rootSuite)
  return { failed }
}

export const markers = {
  DOCUMENT_MARKER,
}
