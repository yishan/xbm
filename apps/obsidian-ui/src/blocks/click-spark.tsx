// Click Spark — a canvas-based spark burst that follows clicks/pointerdown.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.
import { useCallback, useEffect, useRef } from "react";
import type { ReactNode, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

export interface ClickSparkProps {
  children?: ReactNode;
  className?: string;
  sparkColor?: string;
  sparkSize?: number;
  sparkRadius?: number;
  sparkCount?: number;
  duration?: number;
  reducedMotion?: boolean;
  extraScale?: number;
  onSpark?: (x: number, y: number) => void;
}

type Burst = {
  x: number;
  y: number;
  start: number;
  angleOffset: number;
  color: string;
  count: number;
  sparkSize: number;
  sparkRadius: number;
  duration: number;
  extraScale: number;
};

type Ring = {
  x: number;
  y: number;
  expires: number;
};

export function ClickSpark({
  children,
  className,
  sparkColor = "#e4e4e7",
  sparkSize = 12,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 420,
  reducedMotion,
  extraScale = 1,
  onSpark,
}: ClickSparkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const dprRef = useRef(1);
  const rafRef = useRef<number | null>(null);
  const burstsRef = useRef<Burst[]>([]);
  const ringsRef = useRef<Ring[]>([]);
  const timeoutsRef = useRef<Set<number>>(new Set());

  const sparkColorRef = useRef(sparkColor);
  const sparkSizeRef = useRef(sparkSize);
  const sparkRadiusRef = useRef(sparkRadius);
  const sparkCountRef = useRef(sparkCount);
  const durationRef = useRef(duration);
  const extraScaleRef = useRef(extraScale);
  const onSparkRef = useRef(onSpark);
  const reducedMotionRef = useRef(false);

  sparkColorRef.current = sparkColor;
  sparkSizeRef.current = sparkSize;
  sparkRadiusRef.current = sparkRadius;
  sparkCountRef.current = sparkCount;
  durationRef.current = duration;
  extraScaleRef.current = extraScale;
  onSparkRef.current = onSpark;

  const resolvedReducedMotion =
    reducedMotion ??
    (typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  reducedMotionRef.current = resolvedReducedMotion;

  const drawNormal = useCallback((now: number) => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = dprRef.current;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const bursts = burstsRef.current;
    for (let i = bursts.length - 1; i >= 0; i--) {
      const burst = bursts[i];
      const t = (now - burst.start) / burst.duration;
      if (t >= 1) {
        bursts.splice(i, 1);
        continue;
      }

      const ease = 1 - Math.pow(1 - t, 3);
      const maxTravel = burst.sparkRadius * 1.6 * burst.extraScale;
      const d = maxTravel * ease;
      const len = burst.sparkSize * (1 - t) * burst.extraScale;

      ctx.beginPath();
      for (let j = 0; j < burst.count; j++) {
        const angle = burst.angleOffset + (j / burst.count) * Math.PI * 2;
        const x1 = burst.x + Math.cos(angle) * d;
        const y1 = burst.y + Math.sin(angle) * d;
        const x2 = burst.x + Math.cos(angle) * (d + len);
        const y2 = burst.y + Math.sin(angle) * (d + len);
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
      }
      ctx.strokeStyle = burst.color;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.stroke();

      const ringRadius = burst.sparkRadius * 1.6 * ease * burst.extraScale;
      const ringAlpha = 0.35 * (1 - t);
      ctx.beginPath();
      ctx.arc(burst.x, burst.y, ringRadius, 0, Math.PI * 2);
      ctx.strokeStyle = burst.color;
      ctx.globalAlpha = ringAlpha;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, []);

  const drawReducedRings = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;

    const dpr = dprRef.current;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    for (const ring of ringsRef.current) {
      ctx.beginPath();
      ctx.arc(ring.x, ring.y, sparkRadiusRef.current * extraScaleRef.current, 0, Math.PI * 2);
      ctx.strokeStyle = sparkColorRef.current;
      ctx.globalAlpha = 0.35;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }, []);

  function tick(now: number) {
    drawNormal(now);
    if (burstsRef.current.length > 0) {
      rafRef.current = requestAnimationFrame(tick);
    } else {
      rafRef.current = null;
    }
  }

  function startAnimation() {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(tick);
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onSparkRef.current?.(x, y);

    if (reducedMotionRef.current) {
      const ring: Ring = { x, y, expires: performance.now() + 250 };
      ringsRef.current.push(ring);
      drawReducedRings();

      const timeout = window.setTimeout(() => {
        ringsRef.current = ringsRef.current.filter((r) => r !== ring);
        drawReducedRings();
        timeoutsRef.current.delete(timeout);
      }, 250);
      timeoutsRef.current.add(timeout);
    } else {
      const burst: Burst = {
        x,
        y,
        start: performance.now(),
        angleOffset: Math.random() * Math.PI * 2,
        color: sparkColorRef.current,
        count: sparkCountRef.current,
        sparkSize: sparkSizeRef.current,
        sparkRadius: sparkRadiusRef.current,
        duration: durationRef.current,
        extraScale: extraScaleRef.current,
      };
      burstsRef.current.push(burst);
      startAnimation();
    }
  }

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctxRef.current = ctx;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      dprRef.current = dpr;
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      if (reducedMotionRef.current) {
        drawReducedRings();
      } else {
        drawNormal(performance.now());
      }
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current.clear();
    };
  }, [drawNormal, drawReducedRings]);

  return (
    <div
      ref={containerRef}
      onPointerDown={handlePointerDown}
      className={cn("relative", className)}
      style={{ touchAction: "none" }}
    >
      {children}
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      />
    </div>
  );
}
