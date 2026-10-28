import { useState } from "react";
import {
  DitherShader,
  cssColor,
  type DitherColor,
  type DitherMatrix,
} from "@/lib/dither";
import { DEFAULT_PRESET_ID, PRESET_FIELDS } from "@/lib/fields";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const SWATCHES: DitherColor[] = ["ink", "blue", "purple", "green", "orange", "pink"];
const MATRICES: DitherMatrix[] = ["bayer2", "bayer4", "bayer8", "blue-noise"];

function Control({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format?: (n: number) => string;
  onChange: (n: number) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label className="text-xs font-normal text-muted-foreground">{label}</Label>
        <span className="text-xs tabular-nums">{format ? format(value) : value}</span>
      </div>
      <Slider
        value={[value]}
        min={min}
        max={max}
        step={step}
        onValueChange={(v) => onChange(v[0])}
      />
    </div>
  );
}

export function FieldPlayground({
  animate = true,
  className,
}: {
  animate?: boolean;
  className?: string;
}) {
  const initial = PRESET_FIELDS.find((p) => p.id === DEFAULT_PRESET_ID) ?? PRESET_FIELDS[0];

  const [presetId, setPresetId] = useState(initial.id);
  const [draft, setDraft] = useState(initial.glsl);
  const [compiledGlsl, setCompiledGlsl] = useState(initial.glsl);
  const [scale, setScale] = useState(1.5);
  const [intensity, setIntensity] = useState(1);
  const [speed, setSpeed] = useState(1);
  const [cell, setCell] = useState(3);
  const [levels, setLevels] = useState(17);
  const [matrix, setMatrix] = useState<DitherMatrix>("bayer4");
  const [colour, setColour] = useState<DitherColor>("ink");

  const preset = PRESET_FIELDS.find((p) => p.id === presetId) ?? initial;

  return (
    <section data-testid="playground" className={cn("w-full", className)}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="relative h-[360px] overflow-hidden rounded-2xl border border-border bg-background">
            <DitherShader
              key={compiledGlsl}
              field={compiledGlsl}
              uniforms={{ fieldScale: scale, fieldIntensity: intensity }}
              matrix={matrix}
              cell={cell}
              levels={levels}
              speed={speed}
              animate={animate}
              stillTime={6}
              palette={["--dither-paper", colour]}
              className="absolute inset-0"
              data-testid="playground-shader"
            />
            <div className="pointer-events-none absolute right-3 bottom-3 rounded-full bg-background/80 px-2.5 py-1 text-[11px] tabular-nums text-muted-foreground backdrop-blur">
              {matrix} · cell {cell}px · {levels} 级
            </div>
          </div>

          <div
            role="group"
            aria-label="预设场"
            className="mt-4 flex flex-wrap gap-1 rounded-xl border border-border bg-muted/40 p-1"
          >
            {PRESET_FIELDS.map((p) => (
              <button
                key={p.id}
                type="button"
                aria-pressed={p.id === presetId}
                data-testid={`preset-${p.id}`}
                onClick={() => {
                  setPresetId(p.id);
                  setDraft(p.glsl);
                  setCompiledGlsl(p.glsl);
                }}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs transition-colors",
                  p.id === presetId
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{preset.description}</p>
        </div>

        <div className="space-y-4 rounded-2xl border border-border bg-card p-4">
          <Control
            label="缩放 scale"
            value={scale}
            min={0.5}
            max={4}
            step={0.1}
            format={(n) => n.toFixed(1)}
            onChange={setScale}
          />
          <Control
            label="强度 intensity"
            value={intensity}
            min={0}
            max={1.5}
            step={0.05}
            format={(n) => n.toFixed(2)}
            onChange={setIntensity}
          />
          <Control
            label="速度 speed"
            value={speed}
            min={0}
            max={3}
            step={0.1}
            format={(n) => n.toFixed(1)}
            onChange={setSpeed}
          />
          <Control label="格子 cell" value={cell} min={2} max={8} step={1} onChange={setCell} />
          <Control label="色阶 levels" value={levels} min={2} max={17} step={1} onChange={setLevels} />

          <div className="space-y-2">
            <Label className="text-xs font-normal text-muted-foreground">矩阵 matrix</Label>
            <Select value={matrix} onValueChange={(v) => setMatrix(v as DitherMatrix)}>
              <SelectTrigger className="w-full" aria-label="矩阵 matrix">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATRICES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-normal text-muted-foreground">颜色</Label>
            <div className="flex gap-2">
              {SWATCHES.map((name) => (
                <button
                  key={name}
                  type="button"
                  aria-label={`颜色 ${name}`}
                  aria-pressed={colour === name}
                  onClick={() => setColour(name)}
                  className={cn(
                    "size-5 rounded-full transition-shadow",
                    colour === name &&
                      "ring-2 ring-ring ring-offset-2 ring-offset-background",
                  )}
                  style={{ backgroundColor: cssColor(name) }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          spellCheck={false}
          data-testid="glsl-editor"
          aria-label="GLSL field"
          className="h-56 w-full rounded-xl border border-border bg-muted/40 p-3 font-mono text-xs"
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            data-testid="apply-glsl"
            onClick={() => setCompiledGlsl(draft)}
          >
            应用
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setDraft(preset.glsl)}>
            还原
          </Button>
          {draft !== compiledGlsl && <Badge variant="secondary">未应用</Badge>}
        </div>
        <p className="text-xs text-muted-foreground">
          返回 0–1 的色调：0 是纸，1 是墨。可用 uniform：fieldScale、fieldIntensity；内置 fbm / snoise /
          hash21。编译失败时引擎保留后备画面并在控制台报错。
        </p>
      </div>
    </section>
  );
}
