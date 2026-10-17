import { useState } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DiagramPanel } from "@/components/diagram-panel"
import { DIAGRAMS } from "@/data/diagrams"
import { useTheme } from "@/hooks/use-theme"

const REPO_URL = "https://github.com/Aryanutkarsh/SeeCode"

export function App() {
  const { mode, toggle } = useTheme()
  const [active, setActive] = useState(DIAGRAMS[0].id)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">SeeCode 交互图解</h1>
            <p className="text-sm text-muted-foreground">
              用一段 JSON 生成可悬停、可点击、可逐步演示的动画图
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              aria-label="切换深浅色"
              onClick={toggle}
            >
              {mode === "light" ? <Moon /> : <Sun />}
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 pb-24">
        <p className="text-sm leading-relaxed text-muted-foreground">
          SeeCode 是 Aryan Utkarsh 以 MIT 许可开源的图解技能：写一段 JSON，渲染成一个独立的交互
          HTML。下面 5 张图都由随本 demo vendored 的渲染器（v0.6.1）在构建时生成：前三张是公开信息，后两张是示例数据。
        </p>

        <Tabs value={active} onValueChange={setActive} className="gap-4">
          <TabsList className="flex h-auto flex-wrap">
            {DIAGRAMS.map((diagram) => (
              <TabsTrigger key={diagram.id} value={diagram.id}>
                {diagram.title}
              </TabsTrigger>
            ))}
          </TabsList>

          {DIAGRAMS.map((diagram) => (
            <TabsContent key={diagram.id} value={diagram.id}>
              <h2 className="text-base font-semibold">
                {diagram.title} · {diagram.kind}
              </h2>
              <p className="mb-3 text-sm text-muted-foreground">{diagram.summary}</p>
              <DiagramPanel key={diagram.id} diagram={diagram} mode={mode} />
            </TabsContent>
          ))}
        </Tabs>
      </main>

      <footer className="border-t">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 pb-24 text-xs text-muted-foreground">
          <p>
            图解渲染：SeeCode v0.6.1（MIT，© Aryan Utkarsh），许可证与第三方声明随
            vendor/seecode/ 保留。图内字体从 Google Fonts 加载；本页不调用任何 SeeCode 服务。
          </p>
          <a className="underline" href={REPO_URL} target="_blank" rel="noopener noreferrer">
            github.com/Aryanutkarsh/SeeCode
          </a>
        </div>
      </footer>
    </div>
  )
}
