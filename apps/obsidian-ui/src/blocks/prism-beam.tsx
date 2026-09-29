// Prism Beam — drag to aim a light beam through a glass prism; it disperses into a spectrum (Canvas 2D).
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type Point = { x: number; y: number };

type Edge = {
  start: Point;
  end: Point;
  normal: Point;
};

const add = (a: Point, b: Point): Point => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a: Point, b: Point): Point => ({ x: a.x - b.x, y: a.y - b.y });
const scale = (a: Point, s: number): Point => ({ x: a.x * s, y: a.y * s });
const dot = (a: Point, b: Point): number => a.x * b.x + a.y * b.y;
const cross = (a: Point, b: Point): number => a.x * b.y - a.y * b.x;

const normalize = (a: Point): Point => {
  const length = Math.hypot(a.x, a.y);
  return length < 1e-9 ? { x: 0, y: 0 } : { x: a.x / length, y: a.y / length };
};

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const clampPoint = (point: Point, w: number, h: number): Point => ({
  x: clamp(point.x, 0, w),
  y: clamp(point.y, 0, h),
});

const buildEdges = (vertices: Point[], cx: number, cy: number): Edge[] => {
  return [
    {
      start: vertices[0],
      end: vertices[1],
      normal: normalize({
        x: (vertices[0].x + vertices[1].x) / 2 - cx,
        y: (vertices[0].y + vertices[1].y) / 2 - cy,
      }),
    },
    {
      start: vertices[1],
      end: vertices[2],
      normal: normalize({
        x: (vertices[1].x + vertices[2].x) / 2 - cx,
        y: (vertices[1].y + vertices[2].y) / 2 - cy,
      }),
    },
    {
      start: vertices[2],
      end: vertices[0],
      normal: normalize({
        x: (vertices[2].x + vertices[0].x) / 2 - cx,
        y: (vertices[2].y + vertices[0].y) / 2 - cy,
      }),
    },
  ];
};

const intersectRayEdges = (
  origin: Point,
  dir: Point,
  edges: Edge[],
  ignoreIndex = -1,
): { t: number; point: Point; edgeIndex: number } | null => {
  let bestT = Number.POSITIVE_INFINITY;
  let bestPoint: Point | null = null;
  let bestEdgeIndex = -1;

  for (let i = 0; i < edges.length; i++) {
    if (i === ignoreIndex) continue;

    const edge = edges[i];
    const edgeVec = sub(edge.end, edge.start);
    const q = sub(edge.start, origin);
    const denom = cross(dir, edgeVec);

    if (Math.abs(denom) < 1e-9) continue;

    const t = cross(q, edgeVec) / denom;

    if (t <= 0 || t >= bestT) continue;

    const point = add(origin, scale(dir, t));
    const edgeLengthSq = dot(edgeVec, edgeVec);
    const projection = dot(sub(point, edge.start), edgeVec) / edgeLengthSq;

    if (projection < -1e-6 || projection > 1 + 1e-6) continue;

    bestT = t;
    bestPoint = point;
    bestEdgeIndex = i;
  }

  if (!bestPoint || bestEdgeIndex === -1) return null;

  return { t: bestT, point: bestPoint, edgeIndex: bestEdgeIndex };
};

const refractEnter = (dir: Point, normal: Point, ior: number): Point | null => {
  const cosI = -dot(dir, normal);
  const eta = 1 / ior;
  const sin2 = eta * eta * (1 - cosI * cosI);

  if (sin2 > 1) return null;

  const cosR = Math.sqrt(1 - sin2);
  const refracted = add(scale(dir, eta), scale(normal, eta * cosI - cosR));
  const length = Math.hypot(refracted.x, refracted.y);

  return length < 1e-9 ? null : { x: refracted.x / length, y: refracted.y / length };
};

const refractExit = (dir: Point, normal: Point, ior: number): Point | null => {
  const cosI = dot(dir, normal);
  const eta = ior;
  const sin2 = eta * eta * (1 - cosI * cosI);

  if (sin2 > 1) return null;

  const cosR = Math.sqrt(1 - sin2);
  const refracted = add(scale(dir, eta), scale(normal, eta * cosI - cosR));
  const length = Math.hypot(refracted.x, refracted.y);

  return length < 1e-9 ? null : { x: refracted.x / length, y: refracted.y / length };
};

const drawRay = (
  ctx: CanvasRenderingContext2D,
  p1: Point,
  p2: Point,
  glowColor: string,
  coreColor: string,
  glowWidth = 10,
  coreWidth = 1.5,
) => {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.shadowBlur = 16;
  ctx.shadowColor = glowColor;
  ctx.strokeStyle = glowColor;
  ctx.lineWidth = glowWidth;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();

  ctx.shadowBlur = 0;
  ctx.strokeStyle = coreColor;
  ctx.lineWidth = coreWidth;
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.restore();
};

const drawScene = (
  ctx: CanvasRenderingContext2D,
  state: { w: number; h: number },
  aim: Point,
  prismScale: number,
) => {
  const { w, h } = state;

  ctx.clearRect(0, 0, w, h);

  const backgroundGradient = ctx.createRadialGradient(
    w / 2,
    h / 2,
    0,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.9,
  );
  backgroundGradient.addColorStop(0, "rgba(88, 28, 135, 0.30)");
  backgroundGradient.addColorStop(1, "#09090b");

  ctx.fillStyle = backgroundGradient;
  ctx.fillRect(0, 0, w, h);

  const side = Math.min(w, h) * prismScale;
  const triHeight = (side * Math.sqrt(3)) / 2;
  const cx = w / 2;
  const cy = h / 2;

  const apex: Point = { x: cx, y: cy - (2 * triHeight) / 3 };
  const bottomLeft: Point = { x: cx - side / 2, y: cy + triHeight / 3 };
  const bottomRight: Point = { x: cx + side / 2, y: cy + triHeight / 3 };
  const vertices = [apex, bottomLeft, bottomRight];
  const edges = buildEdges(vertices, cx, cy);

  ctx.beginPath();
  ctx.moveTo(apex.x, apex.y);
  ctx.lineTo(bottomLeft.x, bottomLeft.y);
  ctx.lineTo(bottomRight.x, bottomRight.y);
  ctx.closePath();
  ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
  ctx.fill();
  ctx.strokeStyle = "rgba(255, 255, 255, 0.4)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const highlight = ctx.createLinearGradient(apex.x, apex.y, cx, cy + triHeight / 3);
  highlight.addColorStop(0, "rgba(255, 255, 255, 0.18)");
  highlight.addColorStop(1, "rgba(255, 255, 255, 0.02)");
  ctx.fillStyle = highlight;
  ctx.fill();

  const source: Point = { x: w * 0.04, y: h * 0.5 };
  const rawDirection = normalize({ x: aim.x - source.x, y: aim.y - source.y });
  const direction: Point =
    rawDirection.x === 0 && rawDirection.y === 0 ? { x: 1, y: 0 } : rawDirection;

  const entry = intersectRayEdges(source, direction, edges);

  if (!entry) {
    drawRay(
      ctx,
      source,
      { x: source.x + direction.x * 2000, y: source.y + direction.y * 2000 },
      "rgba(255,255,255,0.18)",
      "rgba(255,255,255,0.95)",
      12,
      2.5,
    );
    return;
  }

  const entryPoint = entry.point;
  const entryNormal = edges[entry.edgeIndex].normal;

  drawRay(
    ctx,
    source,
    entryPoint,
    "rgba(255,255,255,0.18)",
    "rgba(255,255,255,0.95)",
    12,
    2.5,
  );

  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.shadowBlur = 18;
  ctx.shadowColor = "white";
  ctx.beginPath();
  ctx.arc(entryPoint.x, entryPoint.y, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  const colors = ["#ff3b3b", "#ff8a00", "#ffd400", "#3dff6e", "#22d3ee", "#3b82f6", "#a855f7"];
  const iors = [1.28, 1.31, 1.34, 1.37, 1.4, 1.43, 1.46];

  colors.forEach((color, index) => {
    const ior = iors[index];

    const insideDir = refractEnter(direction, entryNormal, ior);
    if (!insideDir) return;

    const insideOrigin = add(entryPoint, scale(insideDir, 0.1));
    const exit = intersectRayEdges(insideOrigin, insideDir, edges, entry.edgeIndex);

    if (!exit) return;

    const exitPoint = exit.point;
    const exitNormal = edges[exit.edgeIndex].normal;
    const exitDir = refractExit(insideDir, exitNormal, ior);

    if (!exitDir) return;

    drawRay(
      ctx,
      entryPoint,
      exitPoint,
      "rgba(255,255,255,0.14)",
      "rgba(255,255,255,0.7)",
      5,
      1.0,
    );

    drawRay(
      ctx,
      exitPoint,
      { x: exitPoint.x + exitDir.x * 2000, y: exitPoint.y + exitDir.y * 2000 },
      color,
      color,
      6,
      1.5,
    );
  });
};

export interface PrismBeamProps {
  className?: string;
  reducedMotion?: boolean;
  prismScale?: number;
}

export function PrismBeam({
  className,
  reducedMotion = false,
  prismScale = 0.55,
}: PrismBeamProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const aimRef = useRef<Point>({ x: 0, y: 0 });
  const baseAimRef = useRef<Point>({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const sweepActiveRef = useRef(false);
  const holdUntilRef = useRef(0);
  const sweepStartRef = useRef(0);
  const didInitRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;

    if (!canvas || !wrapper) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const state = { w: 0, h: 0 };

    const initSize = () => {
      const rect = wrapper.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      state.w = rect.width;
      state.h = rect.height;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawStatic = () => {
      drawScene(ctx, state, aimRef.current, prismScale);
    };

    const drawFrame = (now: number) => {
      if (!reducedMotion) {
        if (isDraggingRef.current) {
          // Keep user's drag target.
        } else if (now < holdUntilRef.current) {
          // Hold the user's aim for 3 seconds after release.
        } else {
          if (!sweepActiveRef.current) {
            sweepActiveRef.current = true;
            baseAimRef.current = { ...aimRef.current };
            sweepStartRef.current = now;
          }

          const t = (now - sweepStartRef.current) / 1000;
          const amplitude = Math.min(state.w, state.h) * 0.06;
          const x = baseAimRef.current.x + amplitude * Math.sin(t * ((Math.PI * 2) / 6));
          const y = baseAimRef.current.y + amplitude * Math.cos(t * ((Math.PI * 2) / 8));

          aimRef.current = {
            x: clamp(x, 0, state.w),
            y: clamp(y, 0, state.h),
          };
        }
      }

      drawScene(ctx, state, aimRef.current, prismScale);
    };

    let rafId: number | null = null;

    const loop = (now: number) => {
      drawFrame(now);
      rafId = requestAnimationFrame(loop);
    };

    const startLoop = () => {
      if (reducedMotion || rafId !== null) return;
      rafId = requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    initSize();

    if (!didInitRef.current) {
      didInitRef.current = true;
      aimRef.current = { x: state.w / 2, y: state.h / 2 };
      baseAimRef.current = { ...aimRef.current };
      sweepActiveRef.current = !reducedMotion;
      sweepStartRef.current = performance.now();
    } else {
      aimRef.current = {
        x: clamp(aimRef.current.x, 0, state.w),
        y: clamp(aimRef.current.y, 0, state.h),
      };
      baseAimRef.current = { ...aimRef.current };
    }

    if (reducedMotion) {
      drawStatic();
    } else {
      startLoop();
    }

    const getPoint = (event: PointerEvent): Point => {
      const rect = wrapper.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    };

    const handlePointerDown = (event: PointerEvent) => {
      event.preventDefault();
      wrapper.setPointerCapture?.(event.pointerId);
      isDraggingRef.current = true;
      aimRef.current = clampPoint(getPoint(event), state.w, state.h);
      sweepActiveRef.current = false;
      holdUntilRef.current = 0;

      if (reducedMotion) drawStatic();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;

      aimRef.current = clampPoint(getPoint(event), state.w, state.h);

      if (reducedMotion) drawStatic();
    };

    const handlePointerUp = (event: PointerEvent) => {
      if (!isDraggingRef.current) return;

      isDraggingRef.current = false;
      holdUntilRef.current = performance.now() + 3000;
      sweepActiveRef.current = false;
      baseAimRef.current = { ...aimRef.current };

      try {
        wrapper.releasePointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }

      if (reducedMotion) drawStatic();
    };

    const handlePointerCancel = (event: PointerEvent) => {
      isDraggingRef.current = false;
      holdUntilRef.current = performance.now() + 3000;
      sweepActiveRef.current = false;
      baseAimRef.current = { ...aimRef.current };

      try {
        wrapper.releasePointerCapture?.(event.pointerId);
      } catch {
        // Pointer capture may already be released.
      }

      if (reducedMotion) drawStatic();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;

      event.preventDefault();

      const delta = event.key === "ArrowUp" ? -12 : 12;
      const nextY = clamp(aimRef.current.y + delta, 0, state.h);

      aimRef.current = { ...aimRef.current, y: nextY };
      holdUntilRef.current = performance.now() + 3000;
      sweepActiveRef.current = false;
      baseAimRef.current = { ...aimRef.current };

      if (reducedMotion) drawStatic();
    };

    wrapper.addEventListener("pointerdown", handlePointerDown);
    wrapper.addEventListener("pointermove", handlePointerMove);
    wrapper.addEventListener("pointerup", handlePointerUp);
    wrapper.addEventListener("pointercancel", handlePointerCancel);
    wrapper.addEventListener("keydown", handleKeyDown);

    const resizeObserver = new ResizeObserver(() => {
      initSize();

      aimRef.current = {
        x: clamp(aimRef.current.x, 0, state.w),
        y: clamp(aimRef.current.y, 0, state.h),
      };

      if (reducedMotion) drawStatic();
    });

    resizeObserver.observe(wrapper);

    const intersectionObserver = new IntersectionObserver((entries) => {
      const [entry] = entries;

      if (!entry) return;

      if (entry.isIntersecting) {
        startLoop();
      } else {
        stopLoop();
      }
    });

    intersectionObserver.observe(wrapper);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();

      wrapper.removeEventListener("pointerdown", handlePointerDown);
      wrapper.removeEventListener("pointermove", handlePointerMove);
      wrapper.removeEventListener("pointerup", handlePointerUp);
      wrapper.removeEventListener("pointercancel", handlePointerCancel);
      wrapper.removeEventListener("keydown", handleKeyDown);
    };
  }, [prismScale, reducedMotion]);

  return (
    <div
      ref={wrapperRef}
      tabIndex={0}
      className={cn(
        "relative h-full w-full overflow-hidden rounded-3xl border border-white/10 bg-zinc-950 focus:outline-none",
        className,
      )}
      data-testid="prism-canvas"
      style={{ touchAction: "none" }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Light beam refracting through a prism"
      />
      <p className="pointer-events-none absolute bottom-3 left-4 text-xs text-zinc-500">
        drag to aim the beam
      </p>
    </div>
  );
}
