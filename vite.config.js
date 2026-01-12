import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './public/assets'),
      '@config': path.resolve(__dirname, './public/config')
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'babylon': ['babylonjs', 'babylonjs-loaders', 'babylonjs-gui'],
          'blockly': ['blockly'],
          'react-vendor': ['react', 'react-dom', 'react-router-dom']
        }
      }
    },
    chunkSizeWarningLimit: 1000
  },
  server: {
    port: 8080,
    open: true
  },
  assetsInclude: ['**/*.wasm', '**/*.xml', '**/*.glb', '**/*.gltf'],
  optimizeDeps: {
    exclude: ['@babylonjs/loaders']
  }
})
