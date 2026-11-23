import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/samu_mcq/',
  build: {
    // Split chunks so initial load is tiny
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core React runtime — cached forever after first load
          if (id.includes('react-dom') || id.includes('react-router-dom') || id.includes('/react/')) {
            return 'vendor-react';
          }
          // Supabase SDK — large but cached
          if (id.includes('@supabase') || id.includes('supabase')) {
            return 'vendor-supabase';
          }
          // All other node_modules
          if (id.includes('node_modules')) {
            return 'vendor-others';
          }
          // All curriculum MCQ data — only loaded when student enters quiz
          if (
            id.includes('/data/course1/') ||
            id.includes('/data/course2/') ||
            id.includes('/data/course3/')
          ) {
            return 'curriculum-data';
          }
        }
      }
    },
    chunkSizeWarningLimit: 1500
  }
})
