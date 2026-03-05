import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  base: '/vibe-site/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        trial: resolve(__dirname, 'trial.html'),
      },
    },
  },
})
