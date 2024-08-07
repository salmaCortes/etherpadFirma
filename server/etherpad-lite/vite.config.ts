import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      external: ['react/jsx-runtime'],
      input: 'admin/src/pages/Firmar.tsx', // Ruta a tu archivo TypeScript
      output: {
        dir:'src/templates/padEditor', // Directorio de salida para los archivos generados
      }
    }
  }
})
