import { useEffect, useRef, useState } from "react";

import { drawCap, growCap, prefersReducedMotion } from "@/lib/initialis";
import type { CapSettings } from "@/lib/initialis";
import { cn } from "@/lib/utils";

export type CapCanvasProps = {
  settings: CapSettings;
  size: number;
  animate?: boolean;
  replayKey?: number;
  className?: string;
  label: string;
  onDrawn?: (dataUrl: string) => void;
};

/** Debounce before a redraw, so dragging a slider never queues up renders. */
const DEBOUNCE_MS = 120;
/** Grow-in duration, in seconds, when `animate` is on. */
const GROW_SECONDS = 2.4;
/** Enter easing token from the design system. */
const ENTER_EASE = "cubic-bezier(0.32,0.72,0,1)";

/** Device pixel ratio, capped at 2 (1 during build/prerender). */
function pixelRatio(): number {
  if (typeof window === "undefined") return 1;
  const ratio = window.devicePixelRatio || 1;
  return Math.min(2, Math.max(1, ratio));
}

export function CapCanvas({
  settings,
  size,
  animate = false,
  replayKey = 0,
  className,
  label,
  onDrawn,
}: CapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** Monotonic guard: a result may only paint if it still owns this number. */
  const seqRef = useRef(0);

  const settingsRef = useRef<CapSettings>(settings);
  const onDrawnRef = useRef<((dataUrl: string) => void) | undefined>(onDrawn);

  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep the latest props reachable from the drawing effect without making the
  // effect re-run on every new object/callback identity.
  useEffect(() => {
    settingsRef.current = settings;
    onDrawnRef.current = onDrawn;
  });

  const settingsKey = JSON.stringify(settings);
  const pixelSize = Math.max(1, Math.round(size * pixelRatio()));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;

    const seq = (seqRef.current += 1);
    const currentSettings = settingsRef.current;
    const currentSize = Math.max(1, Math.round(size * pixelRatio()));

    setError(null);

    const timer = window.setTimeout(() => {
      const run =
        animate && !prefersReducedMotion()
          ? growCap(canvas, currentSettings, { size: currentSize, seconds: GROW_SECONDS })
          : drawCap(canvas, currentSettings, { size: currentSize });

      run
        .then(() => {
          if (seq !== seqRef.current) return;
          setHasDrawn(true);
          try {
            onDrawnRef.current?.(canvas.toDataURL("image/png"));
          } catch {
            // Exporting is best-effort; the cap itself is already drawn.
          }
        })
        .catch((cause: unknown) => {
          if (seq !== seqRef.current) return;
          setError(cause instanceof Error ? cause.message : String(cause));
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      // Invalidate anything still in flight (also covers unmount). Never
      // `loseContext` — the canvas is reused across renders.
      seqRef.current += 1;
    };
  }, [settingsKey, size, replayKey, animate]);

  return (
    <div className={cn("flex items-center justify-center", className)} style={{ width: size, height: size }}>
      <canvas
        ref={canvasRef}
        width={pixelSize}
        height={pixelSize}
        role="img"
        aria-label={label}
        className={cn(
          "block transition-opacity duration-200 outline outline-1 -outline-offset-1 outline-black/10 dark:outline-white/10",
          error !== null && "hidden",
        )}
        style={{
          width: size,
          height: size,
          opacity: hasDrawn ? 1 : 0.4,
          transitionTimingFunction: ENTER_EASE,
        }}
      />
      {error !== null ? (
        <p className="px-2 text-center text-[13px] text-muted-foreground text-pretty">{error}</p>
      ) : null}
    </div>
  );
}
