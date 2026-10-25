import { useState } from "react";
import type { ReactNode } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { AlertTriangle, Check, CheckCircle2, Coins, ShieldAlert, Timer, Wrench, X } from "lucide-react";

import { cn } from "@/lib/utils";
import { STATE_META, TONE_CLASSES, formatElapsed } from "@/lib/agent";
import type { AgentState } from "@/lib/agent";
import { AgentStatusPill } from "./agent-status-pill";
import { Button } from "@/components/ui/button";

export type AgentRunCardProps = {
  name: string;
  role: string;
  task?: string;
  state: AgentState;
  stepTitle?: string;
  stepDetail?: string;
  tool?: string;
  elapsedMs: number;
  creditsUsed: number;
  onApprove?: () => void;
  onDeny?: () => void;
  compact?: boolean;
  exampleTag?: boolean;
  className?: string;
  footer?: ReactNode;
};

/** 2px indeterminate bar; static 40% bar when the user prefers reduced motion. */
function IndeterminateBar({ barClass }: { barClass: string }) {
  const reduce = useReducedMotion();

  return (
    <div className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden" aria-hidden="true">
      {reduce ? (
        <div className={cn("h-full w-2/5 opacity-70", barClass)} />
      ) : (
        <motion.div
          className={cn("h-full w-2/5", barClass)}
          animate={{ x: ["-100%", "250%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
        />
      )}
    </div>
  );
}

export function AgentRunCard({
  name,
  role,
  task,
  state,
  stepTitle,
  stepDetail,
  tool,
  elapsedMs,
  creditsUsed,
  onApprove,
  onDeny,
  compact = false,
  exampleTag = true,
  className,
  footer,
}: AgentRunCardProps) {
  const tone = TONE_CLASSES[STATE_META[state].tone];
  const [localDecision, setLocalDecision] = useState<{
    state: AgentState;
    value: "approved" | "denied";
  } | null>(null);
  const decision = localDecision && localDecision.state === state ? localDecision.value : null;
  const isLocal = !onApprove && !onDeny;

  const approve = () => {
    if (isLocal) setLocalDecision({ state, value: "approved" });
    else onApprove?.();
  };

  const deny = () => {
    if (isLocal) setLocalDecision({ state, value: "denied" });
    else onDeny?.();
  };

  const showProgress = state === "thinking" || state === "tool";

  return (
    <div
      data-testid={compact ? undefined : "agent-run-card"}
      data-state={state}
      className={cn(
        "rounded-2xl border border-border bg-card shadow-sm",
        compact ? "p-4" : "p-5",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-xl text-sm font-semibold ring-1",
              tone.bg,
              tone.text,
              tone.ring,
            )}
          >
            {name.charAt(0)}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name}</p>
            <p className="truncate text-xs text-muted-foreground">{role}</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          {exampleTag && (
            <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
              示例数据
            </span>
          )}
          <AgentStatusPill state={state} size={compact ? "sm" : "md"} />
        </div>
      </div>

      {task && !compact && (
        <p className="mt-3 truncate text-xs text-muted-foreground">任务：{task}</p>
      )}

      {(stepTitle || stepDetail) && (
        <div className="relative mt-3 overflow-hidden rounded-xl bg-muted/50 p-3">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={`${state}-${stepTitle}`}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              {stepTitle && <p className="text-sm font-medium">{stepTitle}</p>}
              {stepDetail && (
                <p
                  className={cn(
                    "mt-0.5 text-xs text-muted-foreground",
                    tool && "font-mono",
                  )}
                >
                  {stepDetail}
                </p>
              )}
              {tool && (
                <span className="mt-1.5 inline-flex items-center gap-1 rounded-md bg-background/60 px-1.5 py-0.5 text-[10px] text-muted-foreground ring-1 ring-border">
                  <Wrench size={12} aria-hidden="true" />
                  tool: {tool}
                </span>
              )}
            </motion.div>
          </AnimatePresence>

          {showProgress && <IndeterminateBar barClass={tone.bar} />}
        </div>
      )}

      <AnimatePresence initial={false}>
        {state === "approval" && (
          <motion.div
            key="approval"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div
              className={cn(
                "mt-3 rounded-xl p-3 ring-1",
                TONE_CLASSES.amber.bg,
                TONE_CLASSES.amber.ring,
              )}
            >
              <p
                className={cn(
                  "flex items-center gap-1.5 text-sm font-medium",
                  TONE_CLASSES.amber.text,
                )}
              >
                <ShieldAlert size={14} aria-hidden="true" />
                这一步需要你的批准
              </p>
              {stepDetail && (
                <p className="mt-1 text-xs text-muted-foreground">{stepDetail}</p>
              )}

              {isLocal && decision ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  {decision === "approved" ? "已批准（仅本地状态）" : "已拒绝（仅本地状态）"}
                </p>
              ) : (
                <div className="mt-2 flex gap-2">
                  <Button size="sm" onClick={approve} aria-label={`批准 ${name} 的请求`}>
                    <Check size={14} aria-hidden="true" />
                    批准
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={deny}
                    aria-label={`拒绝 ${name} 的请求`}
                  >
                    <X size={14} aria-hidden="true" />
                    拒绝
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {state === "done" && (
        <p className={cn("mt-3 flex items-center gap-1.5 text-xs", TONE_CLASSES.emerald.text)}>
          <CheckCircle2 size={14} aria-hidden="true" />
          完成
        </p>
      )}

      {state === "error" && (
        <p className={cn("mt-3 flex items-start gap-1.5 text-xs", TONE_CLASSES.rose.text)}>
          <AlertTriangle size={14} aria-hidden="true" className="mt-px shrink-0" />
          <span>运行中断</span>
        </p>
      )}

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground tabular-nums">
        <span className="flex items-center gap-1">
          <Timer size={12} aria-hidden="true" />
          用时 {formatElapsed(elapsedMs)}
        </span>
        <span className="flex items-center gap-1">
          <Coins size={12} aria-hidden="true" />
          {creditsUsed} 积分
        </span>
      </div>

      {footer}
    </div>
  );
}
