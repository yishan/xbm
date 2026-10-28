import { Badge } from "@/components/ui/badge";
import { DitherShader } from "@/lib/dither";
import { HERO_FIELD } from "@/lib/fields";
import { cn } from "@/lib/utils";

export type HeroFieldProps = {
  animate?: boolean;
  className?: string;
};

const LINK_CLASS =
  "inline-flex h-8 items-center rounded-lg border border-border bg-background/80 px-3 text-sm backdrop-blur hover:bg-muted";

export function HeroField({ animate = true, className }: HeroFieldProps) {
  return (
    <div
      className={cn(
        "relative h-[420px] w-full overflow-hidden rounded-3xl border border-border bg-background sm:h-[460px]",
        className
      )}
      data-testid="hero"
    >
      <DitherShader
        field={HERO_FIELD}
        uniforms={{ heroIntensity: 1.0 }}
        matrix="bayer4"
        cell={3}
        speed={1}
        animate={animate}
        stillTime={18}
        fallback={
          <div className="absolute inset-0 bg-linear-to-bl from-dither-ink/25 via-transparent to-transparent" />
        }
        className="absolute inset-0"
        data-testid="hero-shader"
      />
      <div className="relative z-10 flex h-full items-center p-6 sm:p-10">
        <div className="flex w-full max-w-lg flex-col gap-4 rounded-2xl border border-border/60 bg-background/80 p-6 shadow-sm backdrop-blur-[2px] sm:p-8">
        <Badge variant="outline" className="w-fit">
          dither engine + agent skill
        </Badge>
        <h1 className="text-5xl font-semibold tracking-tight text-foreground sm:text-6xl">
          dithercn
        </h1>
        <p className="text-base text-muted-foreground">
          一个给 shadcn/ui
          用的抖动（dither）引擎：WebGL 场、SVG 填充、图片抖动和导出，再加一份教编程
          agent 写任意 dither 的 skill。
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <a
            href="https://dithercn.dev"
            target="_blank"
            rel="noreferrer"
            className={LINK_CLASS}
          >
            dithercn.dev ↗
          </a>
          <a
            href="https://github.com/opencoredev/dithercn"
            target="_blank"
            rel="noreferrer"
            className={LINK_CLASS}
          >
            GitHub ↗
          </a>
        </div>
        </div>
      </div>
      <div className="absolute right-4 bottom-4 z-10 rounded-full border border-border bg-background/80 px-2.5 py-1 text-[11px] text-muted-foreground backdrop-blur">
        {"DitherShader · Bayer 4×4 · "}
        {animate ? "动态" : "静止帧"}
      </div>
    </div>
  );
}
