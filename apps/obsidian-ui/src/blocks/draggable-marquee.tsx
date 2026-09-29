// Draggable Marquee — a draggable, auto-scrolling horizontal marquee with momentum and arrow keys.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.

import { useLayoutEffect, useRef } from "react";
import type { PointerEvent as ReactPointerEvent, KeyboardEvent as ReactKeyboardEvent } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export type MarqueeItem = {
  id: number;
  title: string;
  subtitle: string;
  from: string;
  to: string;
};

export type DraggableMarqueeProps = {
  items?: MarqueeItem[];
  className?: string;
  reducedMotion?: boolean;
  speed?: number;
};

const DEFAULT_ITEMS: MarqueeItem[] = [
  { id: 1, title: "Obsidian", subtitle: "Volcanic glass", from: "#1e1b2e", to: "#0f0f0f" },
  { id: 2, title: "Basalt", subtitle: "Dark rock", from: "#3b3b46", to: "#141416" },
  { id: 3, title: "Aurora", subtitle: "Polar light", from: "#00f5a0", to: "#00d9f5" },
  { id: 4, title: "Nebula", subtitle: "Stellar cloud", from: "#c471f5", to: "#fa71cd" },
  { id: 5, title: "Ember", subtitle: "Burning ember", from: "#ff4d4d", to: "#f9cb28" },
  { id: 6, title: "Glacier", subtitle: "Frozen crystal", from: "#a1c4fd", to: "#c2e9fb" },
  { id: 7, title: "Quartz", subtitle: "Clear gem", from: "#e0c3fc", to: "#8ec5fc" },
  { id: 8, title: "Onyx", subtitle: "Black stone", from: "#232526", to: "#414345" },
];

export function DraggableMarquee({
  items = DEFAULT_ITEMS,
  className,
  reducedMotion,
  speed = 40,
}: DraggableMarqueeProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const setWidthRef = useRef(0);
  const posRef = useRef(0);
  const velocityRef = useRef(0);
  const hoverRef = useRef(false);
  const reducedRef = useRef(
    reducedMotion ??
      (typeof window !== "undefined" &&
        window.matchMedia?.("(prefers-reduced-motion: reduce)").matches),
  );
  const baseSpeedRef = useRef(-speed);
  const draggingRef = useRef(false);
  const lastPointerXRef = useRef(0);
  const lastPointerTimeRef = useRef(0);
  const pointerVelocityRef = useRef(0);

  useLayoutEffect(() => {
    reducedRef.current = reducedMotion ?? false;
  }, [reducedMotion]);

  useLayoutEffect(() => {
    baseSpeedRef.current = -speed;
  }, [speed]);

  useLayoutEffect(() => {
    const track = trackRef.current;
    const set = setRef.current;
    if (!track || !set) return;

    const setter = gsap.quickSetter(track, "x", "px");

    const measure = () => {
      setWidthRef.current = set.offsetWidth;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(set);

    const ticker = (_time: number, deltaTime: number) => {
      if (setWidthRef.current <= 0) return;
      if (draggingRef.current) return;

      const target = reducedRef.current ? 0 : hoverRef.current ? -12 : baseSpeedRef.current;
      velocityRef.current = gsap.utils.interpolate(
        velocityRef.current,
        target,
        1 - Math.exp(-deltaTime * 2.5),
      );

      posRef.current = gsap.utils.wrap(
        -setWidthRef.current,
        0,
        posRef.current + velocityRef.current * deltaTime,
      );
      setter(posRef.current, "px");
    };

    gsap.ticker.add(ticker);

    return () => {
      gsap.ticker.remove(ticker);
      ro.disconnect();
    };
  }, []);

  const setTrackX = () => {
    if (trackRef.current) {
      gsap.set(trackRef.current, { x: posRef.current });
    }
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    draggingRef.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    lastPointerXRef.current = e.clientX;
    lastPointerTimeRef.current = performance.now();
    pointerVelocityRef.current = 0;
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;

    const currentX = e.clientX;
    const dx = currentX - lastPointerXRef.current;
    lastPointerXRef.current = currentX;
    posRef.current += dx;
    setTrackX();

    const now = performance.now();
    const dt = Math.max(now - lastPointerTimeRef.current, 1);
    lastPointerTimeRef.current = now;
    const instantVelocity = dx / (dt / 1000);
    pointerVelocityRef.current = gsap.utils.clamp(-2500, 2500, instantVelocity);
  };

  const endDrag = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    velocityRef.current = pointerVelocityRef.current;
    pointerVelocityRef.current = 0;
  };

  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
    e.preventDefault();

    if (reducedRef.current) {
      const step = setWidthRef.current > 0 ? setWidthRef.current / items.length : 216;
      const direction = e.key === "ArrowLeft" ? -1 : 1;
      posRef.current = gsap.utils.wrap(
        -setWidthRef.current,
        0,
        posRef.current + direction * step,
      );
      setTrackX();
    } else {
      if (e.key === "ArrowLeft") velocityRef.current += -600;
      else velocityRef.current += 600;
    }
  };

  const renderCard = (item: MarqueeItem, prefix: string) => (
    <div
      key={`${prefix}-${item.id}`}
      className="relative h-[260px] w-[200px] flex-none overflow-hidden rounded-3xl border border-white/10 shadow-xl select-none"
      style={{ background: `linear-gradient(135deg, ${item.from}, ${item.to})` }}
      draggable={false}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-4 left-4">
        <div className="text-lg font-semibold text-white">{item.title}</div>
        <div className="text-sm text-white/70">{item.subtitle}</div>
      </div>
      <div className="absolute right-3 top-3 text-[10px] font-medium tracking-widest text-white/50">
        {String(item.id).padStart(2, "0")}
      </div>
    </div>
  );

  return (
    <div
      ref={viewportRef}
      className={cn(
        "relative flex items-center overflow-hidden touch-none select-none cursor-grab active:cursor-grabbing",
        className,
      )}
      style={{
        maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
      }}
      data-testid="marquee"
      tabIndex={0}
      role="group"
      aria-label="Draggable marquee of gradient cards"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      onKeyDown={handleKeyDown}
    >
      <div ref={trackRef} className="flex w-max" draggable={false}>
        <div ref={setRef} className="flex gap-4 pr-4">
          {items.map((item) => renderCard(item, "a"))}
        </div>
        <div className="flex gap-4 pr-4" aria-hidden="true">
          {items.map((item) => renderCard(item, "b"))}
        </div>
      </div>
    </div>
  );
}
