import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Served at https://li.yishan.app/tuffui/ (root vercel.json + scripts/build-all.ts)
export default defineConfig({
  base: "/tuffui/",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
