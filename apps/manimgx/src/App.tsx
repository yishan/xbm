import { useState } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { ScenePanel } from "@/components/scene-panel";
import { useTheme } from "@/hooks/use-theme";
import { SCENES, type SceneId } from "@/data/scenes";

const DOCS_URL = "https://manimgx.academa.ai";
const REPO_URL = "https://github.com/academa-labs/manimgx";

export function App() {
  const { mode, toggle } = useTheme();
  const [active, setActive] = useState<SceneId>(SCENES[0].id);

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Sticky header */}
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">
              ManimGX 讲解动画画廊
            </h1>
            <p className="text-sm text-muted-foreground">
              官方示例场景：动画播放与 Python 源码并排展示
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={toggle}
              aria-label="切换深浅色"
            >
              {mode === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={DOCS_URL} target="_blank" rel="noopener noreferrer">
                文档
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        {/* Intro strip */}
        <p className="text-sm leading-relaxed text-muted-foreground">
          ManimGX 是 Academa Labs 以 MIT 许可发布的开源项目，兼容 Manim CE
          的 API。本页仅展示官方公开的「示例」GIF 与对应场景代码，并非编辑器。
        </p>

        {/* Thumbnail strip: syncs with tab selection */}
        <div className="flex flex-wrap gap-3">
          {SCENES.map((scene) => {
            const isActive = scene.id === active;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActive(scene.id)}
                aria-pressed={isActive}
                aria-label={`选择场景：${scene.titleZh}`}
                className={
                  "group flex items-center gap-2 rounded-md border p-1 pr-3 text-left transition-colors " +
                  (isActive
                    ? "border-foreground/40 bg-accent"
                    : "border-border hover:bg-accent/50")
                }
              >
                <img
                  src={scene.gif}
                  alt=""
                  loading="lazy"
                  className="h-10 w-16 rounded object-cover"
                />
                <span className="text-xs font-medium">{scene.titleZh}</span>
              </button>
            );
          })}
        </div>

        {/* Tabs */}
        <Tabs
          value={active}
          onValueChange={(value) => setActive(value as SceneId)}
          className="flex flex-col gap-4"
        >
          <TabsList>
            {SCENES.map((scene) => (
              <TabsTrigger key={scene.id} value={scene.id}>
                {scene.titleZh}
              </TabsTrigger>
            ))}
          </TabsList>

          {SCENES.map((scene) => (
            <TabsContent key={scene.id} value={scene.id}>
              <ScenePanel scene={scene} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      {/* Footer credits */}
      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 pb-24 text-xs text-muted-foreground">
          <p>
            Academa Labs / ManimGX（MIT 许可）。GIF 与 .py
            源码来自官方示例。第三方组件声明见上游仓库。
          </p>
          <a
            href={REPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium underline underline-offset-4 hover:no-underline"
          >
            github.com/academa-labs/manimgx
          </a>
        </div>
      </footer>
    </div>
  );
}
