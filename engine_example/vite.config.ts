import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 导入外部的引擎
      '@engine': path.resolve(__dirname, '../src')
    }
  }
})
