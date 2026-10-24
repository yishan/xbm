import { useEffect, useState } from "react";
import { MotionConfig } from "motion/react";
import { Moon, Play, RotateCcw, Sun } from "lucide-react";

import { AgentRunCard } from "@/components/agent/agent-run-card";
import { AgentStatusPill } from "@/components/agent/agent-status-pill";
import { BotGrid } from "@/components/agent/bot-grid";
import { CreditsMeter } from "@/components/agent/credits-meter";
import { RunTimeline } from "@/components/agent/run-timeline";
import { Button } from "@/components/ui/button";
import { useScriptedRun } from "@/hooks/use-scripted-run";
import { RUN_TASK } from "@/lib/agent";
import type { AgentState } from "@/lib/agent";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark";

const ALL_STATES: AgentState[] = ["idle", "thinking", "tool", "approval", "done", "error"];
const SPEEDS = [1, 2] as const;

const DESIGN_NOTES = [
  "状态要有名字，也要有动静：思考、调用工具、等待批准用不同的动效区分",
  "需要批准时把请求的内容写清楚，按钮就在旁边",
  "用时和积分跟着每一步走，不要等到月底才看账单",
  "额度尽量放在一个数字里，再按助理拆开看去向",
];

function useTheme() {
  const [theme, setTheme] = useState<Theme>(() =>
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  const [followSystem, setFollowSystem] = useState(true);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (!followSystem) return;
    const query = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = (event: MediaQueryListEvent) => {
      setTheme(event.matches ? "dark" : "light");
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, [followSystem]);

  const toggle = () => {
    setFollowSystem(false);
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  };

  return { theme, toggle };
}

function App() {
  const { theme, toggle } = useTheme();
  const run = useScriptedRun();

  let stepTitle = run.current?.title;
  let stepDetail = run.current?.detail;
  let stepTool = run.current?.tool;

  if (run.state === "idle") {
    stepTitle = "等待开始";
    stepDetail = "点「播放」，看它走完思考 → 调用工具 → 等待批准 → 完成";
    stepTool = undefined;
  } else if (run.state === "error") {
    stepTitle = "已拒绝发送";
    stepDetail = "你拒绝了 send_email，后续步骤已跳过";
    stepTool = undefined;
  }

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-svh bg-background text-foreground">
        <header className="mx-auto max-w-6xl px-6 pt-10">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                Agent UX · 示例数据
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight">Agent Status 组件</h1>
              <p className="mt-3 max-w-2xl text-sm text-muted-foreground">
                让用户一眼看清助理在做什么、什么时候需要你批准、花了多少积分。四个组件：AgentStatusPill、AgentRunCard、RunTimeline、CreditsMeter。所有名字和数字都是示例数据。
              </p>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
                <span>灵感来自</span>
                <a
                  className="underline-offset-4 hover:underline"
                  href="https://x.com/eliakuratli/status/2113618712066711970"
                  target="_blank"
                  rel="noreferrer"
                >
                  @eliakuratli 的 agent status 设计
                </a>
                <span aria-hidden="true">·</span>
                <a
                  className="underline-offset-4 hover:underline"
                  href="https://x.com/PostiauxCharles/status/2112882320978104612"
                  target="_blank"
                  rel="noreferrer"
                >
                  @PostiauxCharles 的 credits usage 设计
                </a>
                <span>· 只借鉴思路，代码为重新实现</span>
              </p>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={toggle}
              aria-label={theme === "dark" ? "切换到浅色模式" : "切换到深色模式"}
            >
              {theme === "dark" ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
            </Button>
          </div>
        </header>

        <section className="mx-auto mt-10 max-w-6xl px-6">
          <h2 className="text-lg font-semibold tracking-tight">一次完整运行</h2>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button onClick={run.play}>
              {run.playing ? <RotateCcw aria-hidden="true" /> : <Play aria-hidden="true" />}
              {run.playing ? "重新播放" : "播放"}
            </Button>

            <Button variant="outline" onClick={run.reset} disabled={run.state === "idle"}>
              重置
            </Button>

            <div role="group" aria-label="播放速度" className="flex rounded-lg border border-border p-0.5">
              {SPEEDS.map((speed) => (
                <button
                  key={speed}
                  type="button"
                  aria-pressed={run.speed === speed}
                  aria-label={`速度 ${speed}x`}
                  onClick={() => run.setSpeed(speed)}
                  className={cn(
                    "rounded-md px-2 py-1 text-xs font-medium tabular-nums transition-colors",
                    run.speed === speed
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {speed}x
                </button>
              ))}
            </div>

            <div className="ml-auto">
              <AgentStatusPill state={run.state} showHint />
            </div>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-5">
            <div className="space-y-4 lg:col-span-3">
              <AgentRunCard
                name="Otter"
                role="研究助理（示例）"
                task={RUN_TASK}
                state={run.state}
                stepTitle={stepTitle}
                stepDetail={stepDetail}
                tool={stepTool}
                elapsedMs={run.elapsedMs}
                creditsUsed={run.creditsUsed}
                onApprove={run.approve}
                onDeny={run.deny}
              />

              <div>
                <p className="text-xs font-medium text-muted-foreground">全部状态</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {ALL_STATES.map((state) => (
                    <AgentStatusPill key={state} state={state} size="sm" />
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <RunTimeline entries={run.entries} elapsedMs={run.elapsedMs} />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-6xl px-6">
          <BotGrid />
        </section>

        <section className="mx-auto mt-12 max-w-6xl px-6">
          <div className="grid gap-6 lg:grid-cols-5">
            <CreditsMeter runCredits={run.creditsUsed} className="lg:col-span-3" />

            <div className="rounded-2xl border border-border bg-card p-5 lg:col-span-2">
              <h3 className="text-sm font-medium">设计要点</h3>
              <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                {DESIGN_NOTES.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className="mx-auto max-w-6xl px-6 py-12 pb-16 text-xs text-muted-foreground">
          示例数据 · 灵感：@eliakuratli、@PostiauxCharles（链接见顶部）· 用 React、Motion、Tailwind、shadcn/ui 重新实现
        </footer>
      </div>
    </MotionConfig>
  );
}

export default App;
