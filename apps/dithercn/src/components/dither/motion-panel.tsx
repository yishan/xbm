import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DitherShader, usePrefersReducedMotion } from "@/lib/dither";
import { MINI_FIELD } from "@/lib/fields";
import { cn } from "@/lib/utils";

const pill =
  "absolute left-2 top-2 rounded-full border border-border bg-background/80 px-2 py-0.5 text-[11px] text-muted-foreground backdrop-blur";

const panel = "relative h-40 overflow-hidden rounded-xl border border-border bg-background";

export function MotionPanel({
  forcedStill,
  onForcedStillChange,
  className,
}: {
  forcedStill: boolean;
  onForcedStillChange: (v: boolean) => void;
  className?: string;
}) {
  const osReduced = usePrefersReducedMotion();
  const liveRef = useRef<HTMLDivElement>(null);
  const [engineState, setEngineState] = useState("fallback");

  useEffect(() => {
    const el = liveRef.current;
    if (!el) return;

    const read = () => {
      const next = el.dataset.state;
      if (next) setEngineState(next);
    };

    const observer = new MutationObserver(read);
    observer.observe(el, { attributes: true, attributeFilter: ["data-state"] });
    // Initial value, read after the effect body rather than during it.
    queueMicrotask(read);

    return () => observer.disconnect();
  }, []);

  return (
    <Card data-testid="motion-panel" className={cn("overflow-hidden", className)}>
      <CardHeader>
        <CardTitle>动态与减少动态</CardTitle>
        <CardDescription>
          引擎自带：离开视口或切到后台就暂停；系统开启「减少动态」时只画 stillTime 那一帧。下面左边是动画，右边是减少动态的用户看到的静止帧。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge data-testid="os-reduced-motion">
            系统 prefers-reduced-motion：{osReduced ? "开" : "关"}
          </Badge>
          <Badge>页面强制静止：{forcedStill ? "开" : "关"}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="force-still"
            data-testid="force-still"
            aria-label="整页强制静止帧"
            checked={forcedStill}
            onCheckedChange={onForcedStillChange}
          />
          <Label htmlFor="force-still">整页强制静止（模拟减少动态）</Label>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className={panel}>
            <DitherShader
              ref={liveRef}
              field={MINI_FIELD}
              animate={!forcedStill}
              cell={4}
              matrix="bayer4"
              className="absolute inset-0"
            />
            <span className={pill}>动画{forcedStill ? " · 已暂停" : ""}</span>
          </div>

          <div className={panel}>
            <DitherShader
              field={MINI_FIELD}
              animate={false}
              stillTime={3}
              cell={4}
              matrix="bayer4"
              className="absolute inset-0"
            />
            <span className={pill}>静止帧 stillTime=3s</span>
          </div>
        </div>

        <p
          aria-live="polite"
          data-testid="engine-state"
          className="font-mono text-xs text-muted-foreground tabular-nums"
        >
          引擎状态 data-state = {engineState}
        </p>
      </CardContent>
    </Card>
  );
}
