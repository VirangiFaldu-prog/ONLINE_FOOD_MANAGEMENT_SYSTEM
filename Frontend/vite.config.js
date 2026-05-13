import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,   // 👈 ADD THIS
    host: true,
    proxy: {
      '/api': {
        target: 'https://localhost:7217',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
