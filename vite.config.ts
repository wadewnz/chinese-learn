import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // base: '/chineselearn/',
  base: '',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    proxy: {
      '^/chineselearn/lists': {
        target: 'http://localhost:5173',
        //changeOrigin: true,
        rewrite: path => path.replace('/chineselearn', '')
      }
    }
  }
})
