import { useEffect, useState } from "react";
import { Play } from "@phosphor-icons/react";
import { RunTrace } from "@/components/ui/run-trace";
import type { TraceSpan } from "@/components/ui/run-trace";
import type { EvalCase } from "@/components/ui/eval-results";
import {
  Shell,
  ShellHeader,
} from "@/components/ui/surface";
import { StatusPill } from "@/components/ui/status-pill";
import { Segmented } from "@/components/ui/segmented-control";
import { IconButton } from "@/components/ui/action-button";
import { useMediaQuery, useTicker } from "./prefs";
import { traceLength } from "./data";

export function CasePanel({
  testCase,
  spans,
  speed,
  runKey,
}: {
  testCase: EvalCase;
  spans: TraceSpan[];
  speed: number;
  runKey: number;
}) {
  const total = traceLength(spans);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState<"flame" | "breakdown">("flame");

  useMediaQuery("(prefers-reduced-motion: reduce)");

  useEffect(() => {
    setElapsed(0);
    setPlaying(true);
  }, [testCase.id, runKey]);

  useEffect(() => {
    if (elapsed >= total) {
      setPlaying(false);
    }
  }, [elapsed, total]);

  useTicker(playing, (dt) => {
    setElapsed((e) => Math.min(total, e + dt * speed));
  });

  const visibleSpans = spans
    .filter((span) => span.startMs <= elapsed)
    .map((span) => {
      if (span.endMs !== undefined && span.endMs > elapsed) {
        return { ...span, endMs: undefined };
      }
      return span;
    });

  const status = testCase.status;
  const tone =
    status === "regressed"
      ? "warning"
      : status === "fail"
        ? "negative"
        : status === "pass"
          ? "positive"
          : status === "improved"
            ? "brand"
            : "neutral";
  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <Shell>
      <ShellHeader
        as="h2"
        title={testCase.name}
        aside={<StatusPill tone={tone}>{statusText}</StatusPill>}
      />
      <div className="flex items-center justify-between gap-2 px-2 pb-1.5">
        <Segmented
          label="Trace view"
          value={view}
          onValueChange={(value) =>
            setView(value as "flame" | "breakdown")
          }
          options={[
            { value: "flame", label: "Flame" },
            { value: "breakdown", label: "Breakdown" },
          ]}
        />
        <IconButton
          icon={Play}
          label="Replay run"
          disabled={playing}
          onClick={() => {
            setElapsed(0);
            setPlaying(true);
          }}
          type="button"
          tooltip={true}
          className="pointer-coarse:size-11"
        />
      </div>
      <RunTrace
        data={{ spans: visibleSpans, elapsedMs: Math.round(elapsed) }}
        view={view}
        className="max-w-none"
      />
    </Shell>
  );
}
