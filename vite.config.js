import fs from 'node:fs/promises';
import path from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

function spaFallback(root) {
  const resolvedRoot = root || process.cwd();
  const indexHtmlPath = path.resolve(resolvedRoot, 'index.html');

  return async (req, res, next) => {
    if (req.method !== 'GET' || !req.url) {
      return next();
    }

    const acceptHeader = req.headers.accept ?? '';

    if (!acceptHeader.includes('text/html')) {
      return next();
    }

    const url = new URL(req.url, 'http://localhost');

    if (path.extname(url.pathname)) {
      return next();
    }

    try {
      const file = await fs.readFile(indexHtmlPath, 'utf-8');

      res.statusCode = 200;
      res.setHeader('Content-Type', 'text/html');
      res.end(file);
      return;
    } catch (error) {
      next(error);
    }
  };
}

function spaFallbackPlugin() {
  return {
    name: 'spa-fallback-preview',
    apply: 'build',
    configurePreviewServer(server) {
      const root = path.resolve(
        server.config.root || process.cwd(),
        server.config.preview?.outDir ?? server.config.build?.outDir ?? 'dist',
      );

      server.middlewares.use(spaFallback(root));
    },
  };
}

export default defineConfig({
  base: './',
  plugins: [react(), spaFallbackPlugin()],
  server: {
    proxy: {
      '/api': {
        target: 'https://api.aik.bar',
        changeOrigin: true,
      },
      '/karaoke/api': {
        target: 'https://api.aik.bar',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/karaoke/, ''),
      },
    },
  },
});
