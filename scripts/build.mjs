import { mkdir, readdir, rm, stat } from 'node:fs/promises'
import { createReadStream, createWriteStream } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

const projectRoot = process.cwd()
const distDir = resolve(projectRoot, 'dist')
const publicDir = resolve(projectRoot, 'public')
const srcDir = resolve(projectRoot, 'src')
const filesToCopy = [
  ['index.html', 'index.html'],
]

async function ensureDir(path) {
  await mkdir(dirname(path), { recursive: true })
}

async function copyFile(from, to) {
  await ensureDir(to)
  await new Promise((resolveCopy, rejectCopy) => {
    const readStream = createReadStream(from)
    const writeStream = createWriteStream(to)
    readStream.on('error', rejectCopy)
    writeStream.on('error', rejectCopy)
    writeStream.on('finish', resolveCopy)
    readStream.pipe(writeStream)
  })
}

async function copyDirectory(fromDir, toDir) {
  const entries = await readdir(fromDir, { withFileTypes: true })
  for (const entry of entries) {
    const fromPath = join(fromDir, entry.name)
    const toPath = join(toDir, entry.name)
    if (entry.isDirectory()) {
      await mkdir(toPath, { recursive: true })
      await copyDirectory(fromPath, toPath)
    } else if (entry.isFile()) {
      await copyFile(fromPath, toPath)
    }
  }
}

await rm(distDir, { recursive: true, force: true })
await mkdir(distDir, { recursive: true })

for (const [fromRelative, toRelative] of filesToCopy) {
  const fromPath = resolve(projectRoot, fromRelative)
  const toPath = resolve(distDir, toRelative)
  try {
    await stat(fromPath)
    await copyFile(fromPath, toPath)
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error
    }
  }
}

try {
  await copyDirectory(publicDir, distDir)
} catch (error) {
  if (error.code !== 'ENOENT') {
    throw error
  }
}

try {
  await copyDirectory(srcDir, join(distDir, 'src'))
} catch (error) {
  if (error.code === 'ENOENT') {
    console.warn('No src directory found to copy.')
  } else {
    throw error
  }
}

console.log(`Static assets copied to ${distDir}`)
