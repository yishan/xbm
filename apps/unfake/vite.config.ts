import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Served at https://li.yishan.app/unfake/
export default defineConfig({
  base: "/unfake/",
  plugins: [react(), tailwindcss()],
  worker: { format: "es" },
})
