import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import removeConsole from 'vite-plugin-remove-console';

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react(), removeConsole()],
  esbuild: {
    drop: ['console', 'debugger'],
  },
})
