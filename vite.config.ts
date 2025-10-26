import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const appEnv = {
  VITE_API_BASE_URL: process.env.VITE_API_BASE_URL ?? '',
  VITE_REQUEST_TIMEOUT: process.env.VITE_REQUEST_TIMEOUT ?? '8000',
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['aik-icon-192.svg', 'aik-icon-512.svg'],
      manifest: {
        name: 'AIK Front',
        short_name: 'AIK Front',
        description: 'SPA панель управления спортивного клуба AIK Front',
        theme_color: '#38bdf8',
        background_color: '#030712',
        start_url: '.',
        scope: '/',
        display: 'standalone',
        icons: [
          {
            src: '/aik-icon-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
          {
            src: '/aik-icon-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        globPatterns: ['**/*.{js,css,html,png,svg,ico,json}'],
        runtimeCaching: [
          {
            urlPattern: ({ url }: { url: URL }): boolean =>
              url.pathname.startsWith('/news') || url.pathname.startsWith('/schedule'),
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 },
            },
          },
        ],
      },
    }),
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    __APP_ENV__: appEnv,
  },
})
