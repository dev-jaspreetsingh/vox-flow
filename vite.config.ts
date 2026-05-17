import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Browser calls must avoid CORS in dev; forwards to Dashboard API v1.
      '/vox-dashboard-api': {
        target: 'https://dashboardapi.voxtelesys.net',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/vox-dashboard-api/, '/api/v1'),
      },
    },
  },
})
