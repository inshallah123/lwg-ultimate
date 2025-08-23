/**
 * Vite构建工具配置文件
 * 作用: 配置前端构建、开发服务器、插件等
 * 运行环境: Node.js构建环境
 * 
 * 信息流:
 *   1. 开发环境: 启动开发服务器 -> 服务public/index.html -> 加载src/main.tsx
 *   2. 构建环境: 打包src/目录 -> 输出到dist/目录 -> 被Electron主进程加载
 * 
 * 与其他文件关系:
 *   - 使用 public/index.html 作为HTML模板
 *   - 入口文件 src/main.tsx
 *   - 输出目录被 electron/main/index.ts 引用
 *   - 配合 .env 文件的环境变量
 */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',
  root: './',
  publicDir: 'public',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      external: ['better-sqlite3']
    }
  },
  server: {
    port: 5173,
    strictPort: false,  // 允许自动切换端口
    host: true
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  optimizeDeps: {
    exclude: ['better-sqlite3']
  }
})
