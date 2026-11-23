import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/samu_mcq/',
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'vendor-react';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('@supabase') || id.includes('supabase')) {
              return 'vendor-supabase';
            }
            return 'vendor-others';
          }
          if (id.includes('/data/course1/') || id.includes('/data/course2/') || id.includes('/data/course3/')) {
            return 'curriculum-data';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1200
  }
})
