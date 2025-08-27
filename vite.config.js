import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: env.VITE_DEV_HOST,
      port: parseInt(env.VITE_DEV_PORT),
      hmr: {
        host: env.VITE_DEV_HOST,
        port: parseInt(env.VITE_DEV_PORT)
      }
    }
  }
})
