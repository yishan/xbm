import path from "path"
import { fileURLToPath } from "url"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Served at https://li.yishan.app/monohud/ (root vercel.json + scripts/build-all.ts)
export default defineConfig({
  base: "/monohud/",
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
})
