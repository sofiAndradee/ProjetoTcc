import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api vai para o back-end local (mesmo papel do nginx no Docker)
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
