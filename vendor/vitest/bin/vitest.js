#!/usr/bin/env node
import Module from 'node:module'
import { pathToFileURL } from 'node:url'
import { relative, resolve } from 'node:path'
import { readdir } from 'node:fs/promises'

const projectRoot = process.cwd()
const vendorRoot = resolve(projectRoot, 'vendor')
const nodePathSeparator = process.platform === 'win32' ? ';' : ':'

process.env.NODE_PATH = [vendorRoot, process.env.NODE_PATH]
  .filter(Boolean)
  .join(nodePathSeparator)
Module._initPaths()

const configPaths = [
  'vitest.config.js',
  'vitest.config.mjs',
  'vitest.config.cjs',
  'vitest.config.ts',
]

let userConfig = {}

for (const candidate of configPaths) {
  const fullPath = resolve(projectRoot, candidate)
  try {
    const module = await import(pathToFileURL(fullPath).href).catch((error) => {
      if (error.code === 'ERR_MODULE_NOT_FOUND' || error.code === 'ENOENT') {
        return null
      }
      if (error.message?.includes('Cannot find module')) {
        return null
      }
      throw error
    })
    if (!module) {
      continue
    }
    const loadedConfig = module.default ?? module
    if (typeof loadedConfig === 'function') {
      userConfig = await loadedConfig()
    } else {
      userConfig = loadedConfig ?? {}
    }
    break
  } catch (error) {
    if (error.code === 'ENOENT') {
      continue
    }
    throw error
  }
}

const testConfig = userConfig.test ?? {}

const { createTestEnvironment, runRegisteredSuites } = await import(
  pathToFileURL(resolve(projectRoot, 'vendor/vitest/index.js')).href,
)

createTestEnvironment({
  root: projectRoot,
})

const setupFiles = Array.isArray(testConfig.setupFiles)
  ? testConfig.setupFiles
  : testConfig.setupFiles
  ? [testConfig.setupFiles]
  : []

for (const setupFile of setupFiles) {
  const setupPath = resolve(projectRoot, setupFile)
  await import(pathToFileURL(setupPath).href)
}

const resolvedTestFiles = new Set()

async function walkForTests(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const entryPath = resolve(dir, entry.name)
    if (entry.isDirectory()) {
      await walkForTests(entryPath)
      continue
    }
    const relativePath = relative(projectRoot, entryPath).replace(/\\/g, '/')
    if (/^src\//.test(relativePath) && /\.test\.(?:js|mjs)$/.test(relativePath)) {
      resolvedTestFiles.add(entryPath)
    }
  }
}

try {
  await walkForTests(resolve(projectRoot, 'src'))
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error
  }
}

if (resolvedTestFiles.size === 0) {
  console.log('No test files matched the configured patterns.')
  process.exit(0)
}

for (const filePath of [...resolvedTestFiles].sort()) {
  await import(pathToFileURL(filePath).href)
}

const { failed } = await runRegisteredSuites()

if (failed > 0) {
  process.exitCode = 1
}
