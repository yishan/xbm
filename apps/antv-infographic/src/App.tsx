// Gallery demo using @antv/infographic (MIT). https://github.com/antvis/Infographic
// Bookmark: https://x.com/Huahuazo/status/2104558493244281026

import { useEffect, useMemo, useState } from "react"

import { AppHeader } from "@/components/AppHeader"
import { PreviewPane } from "@/components/PreviewPane"
import { TemplateCard } from "@/components/TemplateCard"
import { TemplateSidebar } from "@/components/TemplateSidebar"
import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import { SAMPLES, getSampleById } from "@/templates"
import type { TemplateCategory } from "@/templates"

type CategoryFilter = "all" | TemplateCategory

export default function App() {
  const [activeId, setActiveId] = useState<string>(() => SAMPLES[0]?.id ?? "")
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>("all")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle("dark", dark)
    root.style.colorScheme = dark ? "dark" : "light"
  }, [dark])

  const filteredSamples = useMemo(
    () =>
      activeCategory === "all"
        ? SAMPLES
        : SAMPLES.filter((sample) => sample.category === activeCategory),
    [activeCategory],
  )

  const activeSample =
    getSampleById(activeId) ?? filteredSamples[0] ?? SAMPLES[0]

  const handleCategoryChange = (cat: string | "all") => {
    const next = cat as CategoryFilter
    setActiveCategory(next)
    const list =
      next === "all"
        ? SAMPLES
        : SAMPLES.filter((sample) => sample.category === next)
    if (list[0] && !list.some((sample) => sample.id === activeId)) {
      setActiveId(list[0].id)
    }
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div
        data-testid="app-shell"
        className="flex h-svh w-full flex-col overflow-hidden bg-background text-foreground"
      >
        <AppHeader dark={dark} onToggleDark={setDark} />

        <div className="flex min-h-0 flex-1">
          <TemplateSidebar
            activeId={activeSample?.id ?? ""}
            activeCategory={activeCategory}
            onSelectId={setActiveId}
            onSelectCategory={handleCategoryChange}
          />

          <main className="flex min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
            <section
              data-testid="template-grid"
              className="flex shrink-0 gap-3 overflow-x-auto pb-1"
              aria-label="Templates"
            >
              {filteredSamples.map((sample) => (
                <div key={sample.id} className="w-56 shrink-0">
                  <TemplateCard
                    sample={sample}
                    selected={sample.id === activeSample?.id}
                    onSelect={setActiveId}
                  />
                </div>
              ))}
            </section>

            {activeSample ? (
              <PreviewPane sample={activeSample} />
            ) : (
              <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                No templates in this category yet.
              </div>
            )}
          </main>
        </div>

        <footer className="border-t border-border px-4 py-3 text-center text-xs text-muted-foreground">
          Templates rendered with{" "}
          <a
            href="https://github.com/antvis/Infographic"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground underline underline-offset-2 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
          >
            AntV Infographic
          </a>{" "}
          (MIT licensed).
        </footer>
      </div>

      <Toaster position="bottom-right" />
    </TooltipProvider>
  )
}
