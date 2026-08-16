import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],

  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  // ── MUI v5 + Vite 8 / Rolldown compatibility ─────────────────────────────
  // MUI v5 ships CJS-only sub-paths (no ESM package exports map).
  // Vite 8's Rolldown bundler rejects bare specifiers like "@mui/material/styles"
  // unless they are explicitly pre-bundled here via esbuild (optimizeDeps.include).
  optimizeDeps: {
    include: [
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
    ],
  },

  // Ensure only one copy of React and emotion across all chunks
  resolve: {
    dedupe: ['react', 'react-dom', '@emotion/react', '@emotion/styled'],
  },

  build: {
    rolldownOptions: {
      output: {
        // Split MUI + Emotion into a dedicated vendor chunk — keeps the main
        // bundle leaner and enables long-term caching for MUI assets.
        manualChunks(id) {
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'mui-vendor'
          }
        },
      },
    },
    // MUI is large; suppress the 500 kB chunk size warning
    chunkSizeWarningLimit: 1000,
  },
})
