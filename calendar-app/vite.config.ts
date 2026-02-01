import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'build' ? '/agial_17/static/calendar/' : '/',
  build: {
    cssMinify: false,
  },
  server: {
    proxy: {
      // Proxy Odoo API when React runs on different port (e.g. localhost:5173)
      // Set VITE_ODOO_URL in .env to empty string when using proxy
      '/agial': {
        target: process.env.VITE_ODOO_TARGET ?? 'http://localhost:8077',
        changeOrigin: true,
      },
    },
  },
}))
