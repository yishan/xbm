import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"

// Served at https://li.yishan.app/ui-sdk/
export default defineConfig({
  base: "/ui-sdk/",
  plugins: [react(), tailwindcss()],
})
