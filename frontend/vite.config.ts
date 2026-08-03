import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

function fixHtmlPlugin() {
  return {
    name: 'fix-html',
    enforce: 'post' as const,
    closeBundle() {
      const htmlPath = 'dist/index.html'
      if (!fs.existsSync(htmlPath)) return
      let html = fs.readFileSync(htmlPath, 'utf-8')
      html = html.replace(
        /<script type="module" crossorigin src="(.*?)"><\/script>/,
        '<script src="$1"></script>'
      )
      html = html.replace(
        /<link rel="stylesheet" crossorigin href="(.*?)">/,
        '<link rel="stylesheet" href="$1">'
      )
      fs.writeFileSync(htmlPath, html)
    },
  }
}

export default defineConfig({
  plugins: [react(), fixHtmlPlugin()],
  base: './',
  build: {
    rollupOptions: {
      output: {
        format: 'iife',
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
})
