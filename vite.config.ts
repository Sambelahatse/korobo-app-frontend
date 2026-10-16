import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this project from /korobo-app-frontend/.
export default defineConfig({
  base: '/korobo-app-frontend/',
  plugins: [react()],
})
