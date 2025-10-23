import { createServer } from 'node:http'
import { createReadStream } from 'node:fs'
import { stat } from 'node:fs/promises'
import { extname, join, normalize, resolve } from 'node:path'

const [, , rootArg] = process.argv
const projectRoot = resolve(process.cwd(), rootArg ?? '.')
const port = Number(process.env.PORT ?? 5173)
const publicRoot = resolve(projectRoot, 'public')

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.txt': 'text/plain; charset=utf-8',
}

function safeResolve(root, requestPath) {
  const normalized = normalize(requestPath).replace(/^\/+/, '')
  return resolve(root, normalized)
}

async function resolveFilePath(urlPath) {
  const cleanPath = urlPath.split('?')[0].split('#')[0]
  const candidatePaths = []

  if (cleanPath.endsWith('/')) {
    candidatePaths.push(join(cleanPath, 'index.html'))
  }
  candidatePaths.push(cleanPath)
  if (!cleanPath.endsWith('.html')) {
    candidatePaths.push(`${cleanPath}.html`)
  }

  for (const candidate of candidatePaths) {
    const rootsToCheck = [projectRoot]
    if (publicRoot !== projectRoot) {
      rootsToCheck.push(publicRoot)
    }

    for (const root of rootsToCheck) {
      const filePath = safeResolve(root, candidate)
      try {
        const fileInfo = await stat(filePath)
        if (fileInfo.isFile()) {
          return filePath
        }
      } catch (error) {
        if (error.code !== 'ENOENT') {
          throw error
        }
      }
    }
  }

  return null
}

const server = createServer(async (req, res) => {
  try {
    const requestURL = new URL(req.url ?? '/', 'http://localhost')
    let filePath = await resolveFilePath(requestURL.pathname)

    if (!filePath) {
      filePath = safeResolve(projectRoot, 'index.html')
      try {
        await stat(filePath)
      } catch {
        res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' })
        res.end('Not Found')
        return
      }
    }

    const ext = extname(filePath)
    const contentType = mimeTypes[ext] ?? 'application/octet-stream'
    res.writeHead(200, { 'content-type': contentType })
    createReadStream(filePath).pipe(res)
  } catch (error) {
    res.writeHead(500, { 'content-type': 'text/plain; charset=utf-8' })
    res.end(`Server error: ${error.message}`)
  }
})

server.listen(port, () => {
  const hostURL = new URL(`http://localhost:${port}`)
  const relativeRoot = projectRoot.startsWith(process.cwd())
    ? projectRoot.slice(process.cwd().length + 1)
    : projectRoot
  console.log(`Static server listening on ${hostURL.href} serving ./${relativeRoot || '.'}`)
})
