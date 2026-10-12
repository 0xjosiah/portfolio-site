import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import glsl from 'vite-plugin-glsl'
import fs from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const presetsDir = fileURLToPath(new URL('./presets/', import.meta.url))
const presetName = /^[A-Za-z0-9_-]+$/

/*
 * Dev-only endpoint the leva panel (yarn start) uses to save and load scene settings as JSON in ./presets
 *   GET  /__presets         -> [ 'name', ... ]
 *   GET  /__presets/:name   -> the saved settings
 *   POST /__presets/:name   -> writes ./presets/:name.json
 */
function scenePresets() {
  const send = (res, status, body) => {
    res.statusCode = status
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(body))
  }

  return {
    name: 'scene-presets',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use('/__presets', async (req, res) => {
        try {
          const name = decodeURIComponent(req.url.split('?')[0].replace(/^\//, ''))

          if (name === '') {
            const files = await fs.readdir(presetsDir).catch(() => [])
            return send(res, 200, files.filter((file) => file.endsWith('.json')).map((file) => file.slice(0, -5)).sort())
          }

          /* names become file names, so nothing that could leave the presets folder */
          if (!presetName.test(name)) return send(res, 400, { error: 'Preset names may only use letters, numbers, - and _' })

          const file = `${presetsDir}${name}.json`

          if (req.method === 'GET') {
            const contents = await fs.readFile(file, 'utf8').catch(() => null)
            return contents === null ? send(res, 404, { error: `No preset named ${name}` }) : send(res, 200, JSON.parse(contents))
          }

          if (req.method === 'POST') {
            let body = ''
            for await (const chunk of req) body += chunk
            const settings = JSON.parse(body)

            await fs.mkdir(presetsDir, { recursive: true })
            await fs.writeFile(file, JSON.stringify(settings, null, 2) + '\n')
            return send(res, 200, { saved: `presets/${name}.json` })
          }

          send(res, 405, { error: 'Method not allowed' })
        } catch (error) {
          send(res, 500, { error: error.message })
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), glsl(), mode === 'controls' && scenePresets()],
}))
