import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import journalPlugin from './scripts/journalPlugin.mjs'

export default defineConfig({
  plugins: [react(), journalPlugin('steps')],
  build: {
    rollupOptions: {
      input: { main: 'index.html', schools: 'schools/index.html', shop: 'shop/index.html', blog: 'blog/index.html' },
    },
  },
})
