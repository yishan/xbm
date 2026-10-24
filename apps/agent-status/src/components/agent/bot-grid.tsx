import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { RotateCcw } from "lucide-react";

import { cn } from "@/lib/utils";
import { EXAMPLE_BOTS } from "@/lib/agent";
import type { AgentState, ExampleBot } from "@/lib/agent";
import { AgentRunCard } from "./agent-run-card";
import { Button } from "@/components/ui/button";

type Decision = "approved" | "denied";
type Decisions = Record<string, Decision>;

const RUNNING_STATES: AgentState[] = ["thinking", "tool", "approval"];

export type BotGridProps = {
  className?: string;
};

/** Effective state once a local approval decision is applied. */
function resolveState(bot: ExampleBot, decisions: Decisions): AgentState {
  const decision = decisions[bot.id];
  if (bot.state !== "approval" || !decision) return bot.state;
  return decision === "approved" ? "tool" : "error";
}

export function BotGrid({ className }: BotGridProps) {
  const [decisions, setDecisions] = useState<Decisions>({});
  const [elapsed, setElapsed] = useState<Record<string, number>>(() =>
    Object.fromEntries(EXAMPLE_BOTS.map((bot) => [bot.id, bot.elapsedMs])),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed((prev) => {
        const next = { ...prev };
        for (const bot of EXAMPLE_BOTS) {
          if (RUNNING_STATES.includes(resolveState(bot, decisions))) {
            next[bot.id] = (next[bot.id] ?? 0) + 1000;
          }
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [decisions]);

  const decide = (id: string, decision: Decision) =>
    setDecisions((prev) => ({ ...prev, [id]: decision }));

  return (
    <section data-testid="bot-grid" className={cn("space-y-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-sm font-semibold">示例助理 · 6 种状态</h2>
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              示例数据
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            每张卡片都是 AgentRunCard 的紧凑版本；批准 / 拒绝只改本地状态
          </p>
        </div>
        {Object.keys(decisions).length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            aria-label="重置示例助理"
            onClick={() => setDecisions({})}
          >
            <RotateCcw size={12} aria-hidden="true" />
            重置
          </Button>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXAMPLE_BOTS.map((bot, index) => {
          const decision = decisions[bot.id];
          const approved = bot.state === "approval" && decision === "approved";
          const denied = bot.state === "approval" && decision === "denied";
          const state = resolveState(bot, decisions);
          const stepTitle = approved ? `继续执行：${bot.step}` : denied ? "已拒绝" : bot.step;
          const stepDetail = approved
            ? "已批准（仅本地状态）"
            : denied
              ? "请求被拒绝（仅本地状态）"
              : undefined;

          return (
            <motion.div
              key={bot.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: index * 0.05, ease: "easeOut" }}
            >
              <AgentRunCard
                compact
                exampleTag={false}
                name={bot.name}
                role={bot.role}
                state={state}
                stepTitle={stepTitle}
                stepDetail={stepDetail}
                elapsedMs={elapsed[bot.id] ?? bot.elapsedMs}
                creditsUsed={bot.creditsUsed}
                onApprove={state === "approval" ? () => decide(bot.id, "approved") : undefined}
                onDeny={state === "approval" ? () => decide(bot.id, "denied") : undefined}
              />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
