import { createElement } from 'react'
import { renderToString } from 'react-dom/server'
import { createServer, defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { projectImages } from './build/projectImages.ts'

// The production page includes its project list and biography in the initial HTML.
function staticPortfolio(): Plugin {
  return {
    name: 'static-portfolio',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      async handler(html) {
        const server = await createServer({
          configFile: false,
          cacheDir: 'node_modules/.vite-prerender',
          appType: 'custom',
          server: { middlewareMode: true, hmr: false, watch: null },
          optimizeDeps: { noDiscovery: true },
          plugins: [react()],
        })
        try {
          const { default: App } = await server.ssrLoadModule('/src/App.tsx')
          const content = renderToString(createElement(App))
          return html.replace(
            '<div id="root"></div>',
            '<div id="root">' + content + '</div>',
          )
        } finally {
          await server.close()
        }
      },
    },
  }
}

export default defineConfig({
  plugins: [react(), staticPortfolio(), projectImages()],
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            { name: 'three-core', test: /three\/build\/three\.core\.js$/ },
            {
              name: 'three-renderer',
              test: /three\/build\/three\.module\.js$/,
            },
          ],
        },
      },
    },
  },
})
