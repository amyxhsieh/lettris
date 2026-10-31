import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dispatch } from './server/handle.js'
import { hasSharedDatabase } from './server/store.js'

const SHARED_API = 'https://lettris-game.vercel.app'

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function lettrisApi() {
  return {
    name: 'lettris-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1')
        if (!url.pathname.startsWith('/api/')) return next()
        const raw = req.method === 'GET' || req.method === 'HEAD' ? '' : await readBody(req)
        if (!hasSharedDatabase()) {
          const response = await fetch(new URL(req.url, SHARED_API), {
            method: req.method,
            headers: raw ? { 'content-type': 'application/json' } : undefined,
            body: raw || undefined,
          })
          res.statusCode = response.status
          res.setHeader('Content-Type', 'application/json')
          res.end(await response.text())
          return
        }
        const result = await dispatch(req.method, url.pathname, url.searchParams, raw)
        res.statusCode = result.status
        res.setHeader('Content-Type', 'application/json')
        res.end(JSON.stringify(result.body))
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [lettrisApi(), react()],
  build: {
    chunkSizeWarningLimit: 4000,
  },
})
