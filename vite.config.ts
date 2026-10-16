import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  // GitHub Pages uses a repository subpath; Render serves from the domain root.
  base: mode === 'render' ? '/' : '/korobo-app-frontend/',
  plugins: [react()],
}))
