import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  // base: '/chinese-learn/',
  base: '',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  // server: {
  //   proxy: {
  //     '^/chinese-learn/lists': {
  //       target: 'http://localhost:5173',
  //       //changeOrigin: true,
  //       rewrite: path => path.replace('/chinese-learn', '')
  //     }
  //   }
  // }
})
