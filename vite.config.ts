import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { createMockApiMiddleware } from './server/mock-api-middleware'

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use(createMockApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMockApiMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('motion')) {
              return 'vendor-motion'
            }
            if (
              id.includes('lucide-react') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('@base-ui/react')
            ) {
              return 'vendor-ui'
            }
            if (id.includes('zod') || id.includes('zustand')) {
              return 'vendor-core'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
