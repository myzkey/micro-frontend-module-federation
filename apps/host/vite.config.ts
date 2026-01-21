import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'host',
      remotes: {
        remote1: 'http://localhost:3001/assets/remoteEntry.js',
        remote2: 'http://localhost:3002/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'zustand'],
    }),
  ],
  resolve: {
    alias: {
      '@mf/shared': path.resolve(__dirname, '../../packages/shared/src'),
    },
  },
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
