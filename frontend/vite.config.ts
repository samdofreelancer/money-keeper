import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  const env = loadEnv(mode, process.cwd(), '')

  const backendHost = env.VITE_BACKEND_HOST || 'localhost'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      allowedHosts: ['frontend'],
      proxy: {
        '/api': {
          target: `http://${backendHost}:8080`,
          changeOrigin: true
        }
      }
    }
  }
})
