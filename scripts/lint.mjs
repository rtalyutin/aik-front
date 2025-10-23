import { readdir } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { extname, join } from 'node:path'

const roots = ['src', 'scripts']
const files = []

async function collectJavaScriptFiles(directory) {
  try {
    const entries = await readdir(directory, { withFileTypes: true })
    for (const entry of entries) {
      const path = join(directory, entry.name)
      if (entry.isDirectory()) {
        await collectJavaScriptFiles(path)
      } else if (entry.isFile()) {
        const extension = extname(entry.name)
        if (extension === '.js' || extension === '.mjs') {
          files.push(path)
        }
      }
    }
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

for (const root of roots) {
  await collectJavaScriptFiles(root)
}

if (files.length === 0) {
  console.log('No JavaScript files found to lint.')
  process.exit(0)
}

const checks = files.map(
  (file) =>
    new Promise((resolveCheck, rejectCheck) => {
      const child = spawn(process.execPath, ['--check', file], { stdio: 'inherit' })
      child.on('exit', (code) => {
        if (code === 0) {
          resolveCheck()
        } else {
          rejectCheck(new Error(`${file} failed syntax check`))
        }
      })
      child.on('error', rejectCheck)
    }),
)

try {
  await Promise.all(checks)
  console.log('Syntax check completed successfully.')
} catch (error) {
  console.error(error.message)
  process.exit(1)
}
