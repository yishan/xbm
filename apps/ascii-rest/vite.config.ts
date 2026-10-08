import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const page = (f: string) => fileURLToPath(new URL(f, import.meta.url))

// Three pages: the gallery (index.html), the agent fleet terminal (fleet.html),
// and plain HTML that only uses <ascii-art> tags (plain.html).
export default defineConfig({
  base: '/ascii-rest/',
  plugins: [react(), tailwindcss()],
  resolve: { alias: { '@': page('./src') } },
  build: {
    rollupOptions: { input: { index: page('./index.html'), fleet: page('./fleet.html'), plain: page('./plain.html') } },
  },
})
