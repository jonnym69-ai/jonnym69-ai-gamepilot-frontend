import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

export default defineConfig({
  plugins: [
    react(),
    visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    {
      name: 'custom-middleware',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          // Don't interfere with Vite's internal routes
          if (req.url && (
            req.url.startsWith('/@') || // Vite HMR routes
            req.url.startsWith('/node_modules') || // Node modules
            req.url.startsWith('/src') || // Source files
            req.url.includes('.') || // Files with extensions (CSS, JS, images, etc.)
            req.url.startsWith('/api') // API routes
          )) {
            return next()
          }
          
          // Handle client-side routing fallback for non-file, non-API routes
          if (req.url && !req.url.startsWith('/api')) {
            req.url = '/index.html'
          }
          next()
        })
      }
    }
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@gamepilot/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@gamepilot/types': path.resolve(__dirname, '../../packages/types/src'),
      '@gamepilot/static-data': path.resolve(__dirname, '../../packages/static-data/src'),
      '@gamepilot/integrations': path.resolve(__dirname, '../../packages/integrations/src'),
    },
    dedupe: ['react', 'react-dom'],
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
  optimizeDeps: {
    include: ['@gamepilot/ui', 'react-router-dom'],
  },
  build: {
    rollupOptions: {
      external: [],
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      },
    },
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true,
    },
    chunkSizeWarningLimit: 500, // Set to 500KB which is reasonable for modern apps
    // Optimize assets during build
    assetsInlineLimit: 4096, // Inline small assets (< 4KB)
  },
  server: {
    host: true,
    port: 3002, // Use different port to avoid conflict
    strictPort: false, // Allow fallback to other ports
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
      }
    },
    headers: {
      'Content-Security-Policy': "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://s.ytimg.com; frame-src 'self' https://www.youtube.com https://youtube.com; img-src 'self' data: https:; connect-src 'self' http://localhost:3001 https://luzptvrbzoonufqxlrrm.supabase.co https://www.youtube.com https://s.ytimg.com https://api.steampowered.com; media-src 'self' https:; font-src 'self' data:;"
    }
  },
})
