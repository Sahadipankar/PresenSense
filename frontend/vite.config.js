import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5175,
    // Enable client-side routing
    historyApiFallback: true
  },
  build: {
    // Ensure proper handling of client-side routing in production
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
