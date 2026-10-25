import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { SHARED_POOL, SPLIT_POOLS, TONE_CLASSES, TWO_WALLET_NOTE, USAGE_BY_BOT } from "@/lib/agent";

export type CreditsMeterProps = {
  /** Credits used by the live scripted run (added on top of the example data). */
  runCredits?: number;
  exampleTag?: boolean;
  className?: string;
};

type Mode = "shared" | "split";

const MODES: { id: Mode; label: string }[] = [
  { id: "shared", label: "统一额度" },
  { id: "split", label: "分开额度" },
];

const NOTE_BODY = TWO_WALLET_NOTE.replace(/^两个钱包的问题：/, "");
const SPRING = { type: "spring", stiffness: 120, damping: 20 } as const;
const pct = (value: number, total: number) => `${Math.min(100, (value / total) * 100)}%`;

export function CreditsMeter({ runCredits = 0, exampleTag = true, className }: CreditsMeterProps) {
  const [mode, setMode] = useState<Mode>("shared");

  const sharedUsed = SHARED_POOL.used + runCredits;
  const sharedRemaining = Math.max(0, SHARED_POOL.total - sharedUsed);

  const split = SPLIT_POOLS.map((pool, index) => {
    const used = Math.min(pool.total, pool.used + (index === 1 ? runCredits : 0));
    return { ...pool, used, remaining: pool.total - used };
  });
  const assistantRemaining = split[1]?.remaining ?? 0;
  const chatPool = split[0];

  return (
    <section
      data-testid="credits-meter"
      className={cn("rounded-2xl border border-border bg-card p-5 text-foreground", className)}
    >
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">CreditsMeter · 积分用量</h3>
        {exampleTag && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">示例数据</span>
        )}
      </div>

      <div role="group" aria-label="额度模式" className="mt-4 flex rounded-lg bg-muted p-1">
        {MODES.map((item) => (
          <button
            key={item.id}
            type="button"
            aria-pressed={mode === item.id}
            onClick={() => setMode(item.id)}
            className={cn(
              "relative flex-1 rounded-md px-3 py-1 text-xs font-medium transition-colors",
              mode === item.id ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {mode === item.id && (
              <motion.span
                layoutId="credits-mode"
                className="absolute inset-0 rounded-md bg-background shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{item.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mode}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18 }}
          className="mt-4"
        >
          {mode === "shared" ? (
            <div>
              <div className="flex items-baseline justify-between gap-2">
                <div role="status" aria-live="polite" className="text-2xl font-semibold tabular-nums">
                  {sharedUsed}
                  <span className="text-base font-normal text-muted-foreground"> / {SHARED_POOL.total}</span>
                </div>
                <span className="text-xs tabular-nums text-muted-foreground">剩余 {sharedRemaining}</span>
              </div>

              <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-muted">
                {USAGE_BY_BOT.map((bot) => (
                  <motion.div
                    key={bot.name}
                    className={cn("h-full shrink-0", TONE_CLASSES[bot.tone].bar)}
                    initial={{ width: 0 }}
                    animate={{ width: pct(bot.credits, SHARED_POOL.total) }}
                    transition={SPRING}
                  />
                ))}
                {runCredits > 0 && (
                  <motion.div
                    className={cn("h-full shrink-0", TONE_CLASSES.neutral.bar)}
                    initial={{ width: 0 }}
                    animate={{ width: pct(runCredits, SHARED_POOL.total) }}
                    transition={SPRING}
                  />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                {USAGE_BY_BOT.map((bot) => (
                  <span key={bot.name} className="inline-flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", TONE_CLASSES[bot.tone].dot)} />
                    {bot.name}
                    <span className="tabular-nums text-foreground/70">{bot.credits}</span>
                  </span>
                ))}
                {runCredits > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <span className={cn("h-2 w-2 rounded-full", TONE_CLASSES.neutral.dot)} />
                    本次运行
                    <span className="tabular-nums text-foreground/70">+{runCredits}</span>
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{SHARED_POOL.note}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {split.map((pool) => (
                <div key={pool.id}>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-medium">{pool.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {pool.used}/{pool.total} · 剩余 {pool.remaining}
                    </span>
                  </div>
                  <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className={cn("h-full rounded-full", TONE_CLASSES[pool.tone].bar)}
                      initial={{ width: 0 }}
                      animate={{ width: pct(pool.used, pool.total) }}
                      transition={SPRING}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{pool.note}</p>
                  {pool.id === chatPool.id && pool.used / pool.total >= 0.8 && (
                    <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
                      <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      <span>
                        对话额度快用完了，但助理额度还剩{" "}
                        <span className="tabular-nums">{assistantRemaining}</span>
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-4 flex gap-2 rounded-xl bg-muted/50 p-3 text-xs text-muted-foreground">
        <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <p>
          <span className="font-semibold text-foreground">两个钱包的问题</span>：{NOTE_BODY}
        </p>
      </div>
    </section>
  );
}
