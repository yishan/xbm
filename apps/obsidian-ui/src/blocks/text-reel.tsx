// Text Reel — flowing typographic stream with scroll-driven velocity.
// Inspired by ObsidianUI (obsidianui.dev, MIT). Re-implemented from scratch.
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export interface TextReelProps {
  words?: string[];
  prefix?: string;
  fontSize?: string;
  className?: string;
  reducedMotion?: boolean;
  baseSpeed?: number;
}

const DEFAULT_WORDS = ["Create", "Explore", "Build", "Ship", "Iterate", "Design", "Launch"];
const LINE_HEIGHT = 1.1;
const WINDOW_LINES = 3;
const MAX_VELOCITY = 1800;
const DECAY_RATE = 1.8;
const SPEED_UPDATE_INTERVAL = 100;

const DEFAULT_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function TextReel({
  words = DEFAULT_WORDS,
  prefix = "Let’s",
  fontSize = "clamp(2.25rem, 6vw, 4.5rem)",
  className,
  reducedMotion = DEFAULT_REDUCED_MOTION,
  baseSpeed = 30,
}: TextReelProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const clipParentRef = useRef<HTMLDivElement>(null);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const speedBarRef = useRef<HTMLDivElement>(null);
  const speedTextRef = useRef<HTMLSpanElement>(null);

  const wordList = words;
  const totalCopies = 3;
  const repeatedWords = Array.from({ length: totalCopies }, () => wordList).flat();

  useEffect(() => {
    const track = trackRef.current;
    const clipParent = clipParentRef.current;
    if (!track || !clipParent || wordList.length === 0) return;

    const els = wordRefs.current;
    const totalWords = wordList.length * totalCopies;
    if (els.length !== totalWords) return;

    const base = Math.abs(baseSpeed);
    const velocityDirection = reducedMotion ? 0 : -1;
    let velocity = reducedMotion ? 0 : -base;
    let lastDirectionSign = -1;
    let activeIndex = -1;
    let lastSpeedUpdateTime = 0;

    const getLineHeightPx = () => {
      const style = window.getComputedStyle(track);
      return parseFloat(style.fontSize) * LINE_HEIGHT;
    };

    let lineHeightPx = getLineHeightPx();
    let setHeight = lineHeightPx * wordList.length;
    let wrapRange: [number, number] = [-setHeight, 0];
    let y = 0;

    const quickSetY = gsap.quickSetter(track, "y", "px");
    const wrapY = (value: number) => gsap.utils.wrap(wrapRange[0], wrapRange[1], value);

    const updateHighlight = () => {
      const windowHeight = lineHeightPx * WINDOW_LINES;
      const windowCenter = windowHeight / 2;
      let nearestIndex = -1;
      let nearestDistance = Infinity;

      for (let i = 0; i < els.length; i++) {
        const el = els[i];
        if (!el) continue;

        const wordCenter = y + i * lineHeightPx + lineHeightPx / 2;
        const distance = Math.abs(wordCenter - windowCenter);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }

        const opacity = 0.25 + 0.75 * Math.exp(-distance * 0.8);
        el.style.opacity = String(Math.min(1, Math.max(0.25, opacity)));
      }

      if (nearestIndex !== activeIndex) {
        if (activeIndex !== -1 && els[activeIndex]) {
          const prevEl = els[activeIndex]!;
          prevEl.style.backgroundImage = "none";
          prevEl.style.webkitBackgroundClip = "border-box";
          prevEl.style.backgroundClip = "border-box";
          prevEl.style.color = "#ffffff";
        }

        if (nearestIndex !== -1) {
          const activeEl = els[nearestIndex]!;
          activeEl.style.backgroundImage =
            "linear-gradient(to right, rgb(139, 92, 246), rgb(14, 165, 233))";
          activeEl.style.webkitBackgroundClip = "text";
          activeEl.style.backgroundClip = "text";
          activeEl.style.color = "transparent";
        }

        activeIndex = nearestIndex;
      }
    };

    const updateReadout = () => {
      if (!speedBarRef.current || !speedTextRef.current) return;
      const abs = Math.abs(velocity);
      const pct = Math.min(100, (abs / MAX_VELOCITY) * 100);
      speedBarRef.current.style.width = `${pct}%`;
      const dir = velocity < 0 ? "↑" : velocity > 0 ? "↓" : "";
      speedTextRef.current.textContent = `${dir} ${Math.round(abs)} px/s`;
    };

    const ticker = (_time: number, deltaTime: number) => {
      const dt = Math.min(deltaTime, 0.1);
      const target = lastDirectionSign * base;
      const decay = 1 - Math.exp(-dt * DECAY_RATE);
      velocity += (target - velocity) * decay;

      y += velocity * dt;
      y = wrapY(y);
      quickSetY(y);
      updateHighlight();

      const now = performance.now();
      if (now - lastSpeedUpdateTime >= SPEED_UPDATE_INTERVAL) {
        lastSpeedUpdateTime = now;
        updateReadout();
      }
    };

    const applyImpulse = (delta: number) => {
      const impulse = -delta * 6;
      velocity += impulse;
      if (velocity > MAX_VELOCITY) velocity = MAX_VELOCITY;
      if (velocity < -MAX_VELOCITY) velocity = -MAX_VELOCITY;
      if (Math.abs(velocity) > 1) {
        lastDirectionSign = Math.sign(velocity) || lastDirectionSign;
      }
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();

      if (reducedMotion) {
        const step = -Math.sign(e.deltaY) * lineHeightPx;
        y += step;
        y = wrapY(y);
        quickSetY(y);
        updateHighlight();
      } else {
        applyImpulse(e.deltaY);
        lastSpeedUpdateTime = 0;
        updateReadout();
      }
    };

    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      if (reducedMotion) return;
      const currentY = window.scrollY;
      const delta = currentY - lastScrollY;
      if (Math.abs(delta) > 0) {
        applyImpulse(delta);
      }
      lastScrollY = currentY;
      updateReadout();
    };

    const handleResize = () => {
      lineHeightPx = getLineHeightPx();
      setHeight = lineHeightPx * wordList.length;
      wrapRange = [-setHeight, 0];
      y = gsap.utils.wrap(wrapRange[0], wrapRange[1], y);
      quickSetY(y);
      updateHighlight();
      updateReadout();
    };

    clipParent.addEventListener("wheel", handleWheel, { passive: false });

    if (!reducedMotion) {
      gsap.ticker.add(ticker);
      window.addEventListener("scroll", handleScroll, { passive: true });
      updateReadout();
    } else {
      quickSetY(y);
      updateHighlight();
      updateReadout();
    }

    window.addEventListener("resize", handleResize);

    return () => {
      if (!reducedMotion) {
        gsap.ticker.remove(ticker);
        window.removeEventListener("scroll", handleScroll);
      }
      clipParent.removeEventListener("wheel", handleWheel);
      window.removeEventListener("resize", handleResize);
    };
  }, [wordList, totalCopies, baseSpeed, reducedMotion, fontSize]);

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      <div
        ref={clipParentRef}
        data-testid="text-reel"
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 25%, black 75%, transparent)",
          height: `${WINDOW_LINES * LINE_HEIGHT}em`,
        }}
      >
        <div className="flex items-center gap-4" style={{ fontSize }}>
          <span className="text-zinc-500">{prefix}</span>
          <div
            className="relative overflow-hidden"
            style={{ height: `${WINDOW_LINES * LINE_HEIGHT}em` }}
          >
            <div
              ref={trackRef}
              className="will-change-transform"
              style={{ lineHeight: LINE_HEIGHT }}
            >
              {repeatedWords.map((word, i) => (
                <span
                  key={`${word}-${i}`}
                  ref={(el) => {
                    wordRefs.current[i] = el;
                  }}
                  className="block font-semibold tracking-tight text-white"
                  style={{ opacity: 0.25 }}
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex w-full max-w-xs items-center gap-3">
        <div className="h-1 w-24 overflow-hidden rounded-full bg-white/10">
          <div
            ref={speedBarRef}
            className="h-full rounded-full bg-violet-500"
            style={{ width: "0%" }}
          />
        </div>
        <span ref={speedTextRef} className="text-xs tabular-nums text-zinc-500">
          0 px/s
        </span>
      </div>
    </div>
  );
}
