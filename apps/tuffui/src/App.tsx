import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { MotionConfig } from "motion/react";
import { cn } from "@/lib/utils";
import { setMotionTokens } from "@/lib/motion-tokens";
import { EvalResults } from "@/components/ui/eval-results";
import { ToolApprovalQueue } from "@/components/ui/tool-approval-queue";
import { CheckpointTimeline } from "@/components/ui/checkpoint-timeline";
import { Toaster, toast } from "@/components/ui/toast-stack";
import { useHashState, useMediaQuery, useTheme, useTicker } from "./review/prefs";
import { ACCENT_HUE, BASE_TOKENS } from "./review/state";
import {
  buildCases,
  buildMetrics,
  traceFor,
  APPROVALS,
  CHECKPOINTS,
  SUITE,
  LABEL,
  BASELINE_PASS_RATE,
} from "./review/data";
import { DecisionPanel, gatesFor } from "./review/Decision";
import type { Decision } from "./review/Decision";
import { Deck } from "./review/Deck";
import { TopBar } from "./review/TopBar";
import { CasePanel } from "./review/CasePanel";

export default function App() {
  const [state, set, reset] = useHashState();
  const [dark, toggleTheme] = useTheme();

  // Reduced motion zeroes the shared tokens, so TUFFUI fades stop too.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  setMotionTokens({ durationMs: reduceMotion ? 0 : state.duration, bounce: state.bounce });

  const [runIndex, setRunIndex] = useState<number | null>(null);
  const [runKey, setRunKey] = useState(0);
  const [reviewed, setReviewed] = useState<Set<string>>(() => new Set());
  const [decision, setDecision] = useState<Decision>("pending");
  const [approvals, setApprovals] = useState(APPROVALS);
  const [checkpoints, setCheckpoints] = useState(CHECKPOINTS);
  const [resetKey, setResetKey] = useState(0);

  const tickAccum = useRef(0);

  useLayoutEffect(() => {
    const root = document.documentElement.style;
    root.setProperty("--accent-h", String(ACCENT_HUE[state.accent]));
    root.setProperty("--base-h", String(BASE_TOKENS[state.base].h));
    root.setProperty("--base-c", String(BASE_TOKENS[state.base].c));
  }, [state.accent, state.base]);

  const cases = useMemo(() => buildCases(state.failure), [state.failure]);
  const metrics = useMemo(() => buildMetrics(cases), [cases]);

  const passRate = useMemo(() => {
    const passing = cases.filter(
      (c) => c.status === "pass" || c.status === "improved",
    ).length;
    return cases.length ? passing / cases.length : 0;
  }, [cases]);

  const regressed = useMemo(
    () => cases.filter((c) => c.status === "regressed").length,
    [cases],
  );

  const pendingApprovals = approvals.filter(
    (a) => a.status === undefined || a.status === "pending",
  ).length;

  const reviewTargetIds = useMemo(() => {
    const failing = cases.filter(
      (c) => c.status === "fail" || c.status === "regressed",
    );
    return failing.slice(0, 3).map((c) => c.id);
  }, [cases]);

  const reviewedCount = useMemo(
    () => reviewTargetIds.filter((id) => reviewed.has(id)).length,
    [reviewTargetIds, reviewed],
  );

  const gates = gatesFor({
    passRate,
    regressed,
    pendingApprovals,
    reviewed: reviewedCount,
    reviewTarget: reviewTargetIds.length,
  });

  const shownCases = useMemo(() => {
    if (runIndex === null) return cases;

    return cases.map((c, index) => {
      if (index < runIndex) return c;
      if (index === runIndex) {
        return { ...c, status: "running" as const, score: undefined };
      }
      return { ...c, status: "pending" as const, score: undefined };
    });
  }, [cases, runIndex]);

  const selected = cases.find((c) => c.id === state.caseId) ?? cases[0];

  const spans = useMemo(() => traceFor(selected), [selected]);

  const threshold = 350 / state.speed;

  useTicker(runIndex !== null, (dt) => {
    tickAccum.current += dt;
    if (tickAccum.current >= threshold) {
      tickAccum.current = 0;
      setRunIndex((prev) => (prev === null ? null : prev + 1));
    }
  });

  useEffect(() => {
    if (runIndex !== null && runIndex >= cases.length) {
      setRunIndex(null);
      setRunKey((k) => k + 1);
    }
  }, [runIndex, cases.length]);

  useEffect(() => {
    setReviewed(new Set());
    setDecision("pending");
  }, [state.failure]);

  useEffect(() => {
    if (decision === "shipped" && gates.some((gate) => !gate.ok)) {
      setDecision("pending");
    }
  }, [decision, gates]);

  const markReviewed = (id: string) => {
    setReviewed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  };

  const onRerun = () => {
    tickAccum.current = 0;
    setRunIndex(0);
    setRunKey((k) => k + 1);
    setReviewed(new Set());
    setDecision("pending");
  };

  const onCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Copy failed");
    }
  };

  const onReset = () => {
    reset();
    setApprovals(APPROVALS);
    setCheckpoints(CHECKPOINTS);
    setDecision("pending");
    setReviewed(new Set());
    setRunIndex(null);
    setRunKey(0);
    setResetKey((k) => k + 1);
  };

  const gap = state.density === "compact" ? "gap-3" : "gap-5";

  return (
    <MotionConfig reducedMotion="user">
      <Toaster position="bottom-center" />
      <div className="min-h-dvh bg-background text-foreground">
        <div
          dir={state.dir}
          data-density={state.density}
          className={cn(
            "mx-auto flex w-full max-w-[1320px] flex-col px-4 pt-6 pb-20 sm:px-6",
            gap,
          )}
        >
          <TopBar
            decision={decision}
            dark={dark}
            onToggleTheme={toggleTheme}
            onRerun={onRerun}
            running={runIndex !== null}
            onCopyLink={onCopyLink}
            onReset={onReset}
          />

          <Deck state={state} set={set} />

          <div
            className={cn(
              "grid items-start lg:grid-cols-[minmax(0,500px)_minmax(0,1fr)]",
              gap,
            )}
          >
            <EvalResults
              data={{
                suite: SUITE,
                label: LABEL,
                cases: shownCases,
                baselinePassRate: BASELINE_PASS_RATE,
                metrics,
              }}
              view="grid"
              selectedId={selected.id}
              onSelectCase={(c) => {
                set({ caseId: c.id });
                markReviewed(c.id);
              }}
              className="max-w-none"
            />

            <CasePanel
              testCase={selected}
              spans={spans}
              speed={state.speed}
              runKey={runKey}
            />
          </div>

          <div
            className={cn(
              "grid items-start md:grid-cols-2 xl:grid-cols-3",
              gap,
            )}
          >
            <ToolApprovalQueue
              key={`approvals-${resetKey}`}
              data={approvals}
              layout="grouped"
              onDecide={(reqs, decision) =>
                setApprovals((list) =>
                  list.map((r) =>
                    reqs.some((q) => q.id === r.id)
                      ? { ...r, status: decision }
                      : r,
                  ),
                )
              }
              onUndo={(req) =>
                setApprovals((list) =>
                  list.map((r) =>
                    r.id === req.id ? { ...r, status: "pending" } : r,
                  ),
                )
              }
              className="max-w-none"
            />

            <CheckpointTimeline
              key={`checkpoints-${resetKey}`}
              data={checkpoints}
              variant="timeline"
              onRestore={(cp) =>
                setCheckpoints((list) =>
                  list.slice(0, list.findIndex((x) => x.id === cp.id) + 1),
                )
              }
              className="max-w-none"
            />

            <div className="md:col-span-2 xl:col-span-1">
              <DecisionPanel
                gates={gates}
                decision={decision}
                onDecide={setDecision}
                running={runIndex !== null}
              />
            </div>
          </div>

          <footer className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>示例数据</span>
            <span aria-hidden>·</span>
            <a
              className="underline decoration-from-font underline-offset-2 hover:text-foreground"
              href="https://github.com/yurigdesigner/tuffui"
            >
              TUFFUI
            </a>
            <span>MIT</span>
          </footer>
        </div>
      </div>
    </MotionConfig>
  );
}
