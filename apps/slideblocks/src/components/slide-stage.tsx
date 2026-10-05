// SlideBlocks-style layout, inspired by UniUni2000/slideblocks-skill (MIT).
import { useLayoutEffect, useRef, useState, type ReactNode } from "react";

export function SlideStage({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      setSize({ width: rect.width, height: rect.height });
    };

    measure();

    const observer = new ResizeObserver(() => {
      measure();
    });
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const scale = size ? Math.min(size.width / 1280, size.height / 720) : 0;

  return (
    <div
      ref={ref}
      className="relative h-full w-full overflow-hidden"
      data-testid="slide-stage"
    >
      {size ? (
        <div
          className="absolute rounded-[18px] overflow-hidden"
          style={{
            width: 1280,
            height: 720,
            left: (size.width - 1280 * scale) / 2,
            top: (size.height - 720 * scale) / 2,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            boxShadow: "var(--sb-shadow)",
            outline: "1px solid var(--border)",
          }}
        >
          {children}
        </div>
      ) : null}
    </div>
  );
}

export function SlideThumb({ children, width }: { children: ReactNode; width: number }) {
  return (
    <div
      style={{ width, height: (width * 720) / 1280 }}
      className="relative overflow-hidden rounded-[10px]"
    >
      <div
        className="pointer-events-none"
        style={{
          width: 1280,
          height: 720,
          transform: `scale(${width / 1280})`,
          transformOrigin: "top left",
        }}
        aria-hidden
        inert
      >
        {children}
      </div>
    </div>
  );
}
