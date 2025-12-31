import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/WebApp/',
  plugins: [react()],
  optimizeDeps: {
    include: ['firebase/app', 'firebase/firestore', 'firebase/storage', 'firebase/analytics'],
  },
})
