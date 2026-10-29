import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import earthrise from "@/assets/earthrise.jpg";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { DITHER_METHODS, ditherImage, useDitherColors, type ImagePalette } from "@/lib/dither";
import { download, toPNG, toSVG } from "@/lib/dither/export";
import { cn } from "@/lib/utils";

type DitherMethod = (typeof DITHER_METHODS)[number];

/** Paper, ink, then the two extra tones used by the 彩色 switch (one stable identity for the hook). */
const IMAGE_COLORS = ["--dither-paper", "--dither-ink", "--dither-color-blue", "--dither-color-orange"];

export function ImageDither({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastImageData = useRef<ImageData | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const colors = useDitherColors(canvasRef, IMAGE_COLORS); // [paper, ink, blue, orange]

  const [src, setSrc] = useState(earthrise);
  const [method, setMethod] = useState<DitherMethod>("atkinson");
  const [threshold, setThreshold] = useState(0.5);
  const [cell, setCell] = useState(3);
  const [invert, setInvert] = useState(false);
  const [colour, setColour] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [gridSize, setGridSize] = useState("");
  const [status, setStatus] = useState("");

  // Revoke the user's object URL when the card goes away.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || !colors) {
      return;
    }
    let cancelled = false;
    const [paper, ink] = colors;
    const palette = (colour && colors.length >= 4 ? colors : [paper, ink]).map(
      (colour): [number, number, number] => [colour[0], colour[1], colour[2]],
    );

    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => {
      if (cancelled) {
        return;
      }
      const frameWidth = canvas.parentElement?.clientWidth || 480;
      const width = Math.min(320, Math.max(40, Math.round(frameWidth / cell)));
      const height = Math.max(1, Math.round((width * image.height) / image.width));
      canvas.width = width;
      canvas.height = height;
      context.drawImage(image, 0, 0, width, height);
      const data = context.getImageData(0, 0, width, height);
      if (invert) {
        const pixels = data.data;
        for (let i = 0; i < pixels.length; i += 4) {
          pixels[i] = 255 - pixels[i];
          pixels[i + 1] = 255 - pixels[i + 1];
          pixels[i + 2] = 255 - pixels[i + 2];
        }
      }
      const dithered = ditherImage(data, { method, palette: palette as unknown as ImagePalette, threshold });
      context.putImageData(dithered, 0, 0);
      lastImageData.current = dithered;
      setGridSize(`${width}×${height}`);
    };
    image.src = src;

    return () => {
      cancelled = true;
    };
  }, [src, method, threshold, cell, invert, colour, colors]);

  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) {
      return;
    }
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setSrc(url);
  };

  const exportPng = async () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const blob = await toPNG(canvas, { scale: cell });
    download({ data: blob, filename: "dithercn-earthrise.png", type: "image/png" });
    setStatus(`已导出 PNG · ${gridSize} 格`);
  };

  const exportSvg = () => {
    const data = lastImageData.current;
    if (!data) {
      return;
    }
    const svg = toSVG(data, { cell });
    download({ data: svg, filename: "dithercn-earthrise.svg", type: "image/svg+xml" });
    setStatus(`已导出 SVG · ${(new Blob([svg]).size / 1024).toFixed(1)} KB`);
  };

  return (
    <section
      className={cn("rounded-2xl border border-border bg-card p-4 sm:p-6", className)}
      data-testid="image-dither"
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-medium">图片抖动 ImageDither</h2>
        <span className="rounded-full border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground">
          示例数据
        </span>
      </div>

      <div className="grid gap-6 md:grid-cols-[260px_1fr]">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>算法 method</Label>
            <Select value={method} onValueChange={(value) => setMethod(value as DitherMethod)}>
              <SelectTrigger className="w-full" data-testid="image-method" aria-label="抖动算法">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DITHER_METHODS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>阈值 threshold</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{threshold.toFixed(2)}</span>
            </div>
            <Slider
              value={[threshold]}
              onValueChange={(value) => setThreshold(value[0])}
              min={0.2}
              max={0.8}
              step={0.01}
              aria-label="阈值"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2">
              <Label>格子 cell</Label>
              <span className="text-xs text-muted-foreground tabular-nums">{cell}px</span>
            </div>
            <Slider
              value={[cell]}
              onValueChange={(value) => setCell(value[0])}
              min={2}
              max={8}
              step={1}
              aria-label="格子大小"
            />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="image-invert">反相</Label>
            <Switch id="image-invert" checked={invert} onCheckedChange={setInvert} />
          </div>

          <div className="flex items-center justify-between gap-2">
            <Label htmlFor="image-colour">彩色</Label>
            <Switch id="image-colour" checked={colour} onCheckedChange={setColour} />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="image-upload"
              onClick={() => fileRef.current?.click()}
            >
              换一张图片
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              aria-label="选择图片"
              onChange={handleFile}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="export-png"
              disabled={!gridSize}
              onClick={exportPng}
            >
              下载 PNG
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-testid="export-svg"
              disabled={!gridSize}
              onClick={exportSvg}
            >
              下载 SVG
            </Button>
          </div>

          <p className="min-h-4 text-xs text-muted-foreground" aria-live="polite" data-testid="export-status">
            {status}
          </p>
        </div>

        <div className="space-y-3">
          <div className="relative overflow-hidden rounded-xl border border-border bg-background">
            <canvas
              ref={canvasRef}
              role="img"
              aria-label="抖动后的图片"
              className="block w-full [image-rendering:pixelated]"
            />
            {showOriginal ? (
              <img
                src={src}
                alt="原始图片"
                className="absolute inset-0 h-full w-full bg-background object-contain"
              />
            ) : null}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-muted-foreground">
              {method} · {gridSize || "—"} 格 · 示例图片：NASA Earthrise（公有领域）
            </p>
            <Button
              type="button"
              variant={showOriginal ? "secondary" : "outline"}
              size="xs"
              aria-pressed={showOriginal}
              onClick={() => setShowOriginal((prev) => !prev)}
            >
              对比原图
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
