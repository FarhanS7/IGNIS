import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5174,
    host: true,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    modulePreload: {
      resolveDependencies: (_filename, deps) => {
        return deps.filter(
          (dep) => !dep.includes('three-vendor') && !dep.includes('postprocessing-vendor'),
        );
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('node_modules/@react-three')) {
            return 'three-vendor';
          }
          if (
            id.includes('node_modules/postprocessing') ||
            id.includes('node_modules/@react-three/postprocessing')
          ) {
            return 'postprocessing-vendor';
          }
        },
      },
    },
  },
})
