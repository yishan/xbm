import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { App } from "@/App"
import "./index.css"

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <TooltipProvider delayDuration={0}>
        <App />
        <Toaster richColors position="top-right" />
      </TooltipProvider>
    </ThemeProvider>
  </StrictMode>,
)
