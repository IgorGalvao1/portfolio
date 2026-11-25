import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import type { Plugin } from 'vite'

const originals = fileURLToPath(new URL('../public/projetos/', import.meta.url))
const compactCover = (file: string) =>
  sharp(join(originals, file))
    .resize({ width: 640, withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer()

// Each project has a single editable cover. Vite supplies its smaller variant for phones.
export function projectImages(): Plugin {
  return {
    name: 'project-images',
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        const match = request.url?.match(
          /^\/projetos\/compactas\/([\w-]+\.webp)(?:\?.*)?$/,
        )
        if (!match) return next()
        compactCover(match[1]).then((data) => {
          response.setHeader('Content-Type', 'image/webp')
          response.end(data)
        }, next)
      })
    },
    async generateBundle() {
      const files = (await readdir(originals)).filter((file) =>
        file.endsWith('.webp'),
      )
      for (const file of files) {
        this.emitFile({
          type: 'asset',
          fileName: 'projetos/compactas/' + file,
          source: await compactCover(file),
        })
      }
    },
  }
}
