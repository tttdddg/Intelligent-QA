import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 3751,
    open: true,
    historyApiFallback: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'public/index.html')
      }
    }
  },
})