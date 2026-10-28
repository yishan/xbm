import { useState } from "react";
import { Moon, Pause, Play, Sun } from "lucide-react";

import { BriefBars } from "@/components/dither/brief-bars";
import { FieldPlayground } from "@/components/dither/field-playground";
import { HeroField } from "@/components/dither/hero-field";
import { HourlyRidgelines } from "@/components/dither/hourly-ridgelines";
import { ImageDither } from "@/components/dither/image-dither";
import { MotionPanel } from "@/components/dither/motion-panel";
import { ReadingGauge } from "@/components/dither/reading-gauge";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

const NAV = [
  { href: "#dashboard", label: "仪表盘" },
  { href: "#image", label: "图片" },
  { href: "#playground", label: "Playground" },
  { href: "#motion", label: "动态" },
];

const LINK =
  "underline underline-offset-4 hover:text-foreground";

function App() {
  const { theme, toggle } = useTheme();
  const [forcedStill, setForcedStill] = useState(false);
  const animate = !forcedStill;

  return (
    <div className="min-h-svh bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex items-baseline gap-2">
            <span className="font-mono font-semibold">dithercn</span>
            <span className="text-xs text-muted-foreground">xbm demo</span>
          </div>

          <nav className="hidden items-center gap-4 text-sm text-muted-foreground sm:flex">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={forcedStill ? "恢复动画" : "暂停全部动画"}
              aria-pressed={forcedStill}
              onClick={() => setForcedStill((prev) => !prev)}
            >
              {forcedStill ? <Play /> : <Pause />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
              onClick={toggle}
            >
              {theme === "dark" ? <Sun /> : <Moon />}
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-16 px-4 pb-24 sm:px-6">
        <HeroField animate={animate} className="mt-6" />

        <section id="dashboard" className="scroll-mt-20 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">抖动仪表盘</h2>
            <p className="text-sm text-muted-foreground">
              早报风格的数字，全部是示例数据：柱子和弧形是 FillPattern（SVG
              静态填充），光晕和背景是 DitherShader。
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <BriefBars className="lg:col-span-2" />
            <ReadingGauge animate={animate} />
          </div>
          <HourlyRidgelines />
        </section>

        <section id="image" className="scroll-mt-20 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">图片抖动</h2>
            <p className="text-sm text-muted-foreground">
              ditherImage
              把照片按格子量化成纸和墨两色（或主题色板），可导出 PNG / SVG。
            </p>
          </div>
          <ImageDither />
        </section>

        <section id="playground" className="scroll-mt-20 space-y-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">写你自己的场</h2>
            <p className="text-sm text-muted-foreground">
              一个 field 就是一段返回 0–1 色调的 GLSL；引擎负责量化、抖动、主题色、缩放和暂停。选预设、拖滑块，或直接改代码。
            </p>
          </div>
          <FieldPlayground animate={animate} />
        </section>

        <section id="motion" className="scroll-mt-20">
          <MotionPanel forcedStill={forcedStill} onForcedStillChange={setForcedStill} />
        </section>

        <footer className="space-y-2 border-t border-border pt-8 text-sm text-muted-foreground">
          <p>
            引擎与 agent skill 来自 dithercn（作者 Leo · @leodev），MIT License。
            链接：{" "}
            <a href="https://dithercn.dev" target="_blank" rel="noreferrer" className={LINK}>
              dithercn.dev
            </a>
            {" · "}
            <a
              href="https://github.com/opencoredev/dithercn"
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              opencoredev/dithercn
            </a>
            {" · "}
            <a href="https://x.com/leodev" target="_blank" rel="noreferrer" className={LINK}>
              @leodev
            </a>
            {" · "}
            <a
              href="https://x.com/leodev/status/2114688757404447027"
              target="_blank"
              rel="noreferrer"
              className={LINK}
            >
              原帖
            </a>
          </p>
          <p>
            安装：{" "}
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              npx shadcn@latest add https://dithercn.dev/r/dithercn-skill.json
            </code>
          </p>
          <p className="pb-10">
            MIT License · Copyright (c) 2026 Leo · Copyright (c) 2026 Shadcn
            Labs（startercn）。完整许可见 src/lib/dither/LICENSE。示例图片：NASA / Bill
            Anders, Earthrise（公有领域）。所有数字均为示例数据。
          </p>
        </footer>
      </main>
    </div>
  );
}

export default App;
