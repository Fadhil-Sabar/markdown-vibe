/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['markdown-it', 'dompurify'],
  },
  test: {
    environment: 'jsdom',
    globals: true,
  },
})
