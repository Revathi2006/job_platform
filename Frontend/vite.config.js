import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/employer': 'http://localhost:8082',
      '/job': 'http://localhost:8082',
      '/jobseeker': 'http://localhost:8082',
      '/application': 'http://localhost:8082',
      '/auth': 'http://localhost:8082'
    }
  }
})
