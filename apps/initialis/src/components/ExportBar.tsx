import { useCallback, useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { capToPngBlob, diffFromDefaults, fullSettings, getDefaults } from "@/lib/initialis";
import type { CapSettings } from "@/lib/initialis";

const SIZES = [512, 1024, 2048] as const;

type Size = (typeof SIZES)[number];

const STATUS_MS = 2000;

function errorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) return error.message;
  if (typeof error === "string" && error.trim().length > 0) return error;
  return fallback;
}

/** Keeps the download name readable and filesystem-safe. */
function fileSlug(settings: CapSettings): string {
  const raw = typeof settings.text === "string" ? settings.text.trim() : "";
  const slug = raw.replace(/[^A-Za-z0-9]/g, "").slice(0, 8);
  return slug.length > 0 ? slug.toLowerCase() : "cap";
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = "noopener";
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Give the browser a moment to start the download before releasing the URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ExportBar({ settings }: { settings: CapSettings }) {
  const [transparent, setTransparent] = useState(false);
  const [size, setSize] = useState<Size>(1024);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const statusTimer = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    };
  }, []);

  const announce = useCallback((message: string) => {
    setStatus(message);
    if (statusTimer.current !== null) window.clearTimeout(statusTimer.current);
    statusTimer.current = window.setTimeout(() => {
      statusTimer.current = null;
      setStatus(null);
    }, STATUS_MS);
  }, []);

  const settingsJson = useCallback(async (): Promise<string> => {
    const full = await fullSettings(settings);
    const defaults = await getDefaults();
    return JSON.stringify(diffFromDefaults(full, defaults), null, 2);
  }, [settings]);

  async function handleDownloadPng() {
    if (busy) return;
    setBusy(true);
    try {
      const full = await fullSettings(settings);
      const blob = await capToPngBlob(full, transparent ? { size, paper: false } : { size });
      downloadBlob(blob, `initialis-${fileSlug(full)}-${size}.png`);
      announce("已下载");
    } catch (error) {
      announce(errorMessage(error, "导出失败，请重试。"));
    } finally {
      setBusy(false);
    }
  }

  async function handleCopy() {
    if (busy) return;
    setBusy(true);
    try {
      const text = await settingsJson();
      if (typeof navigator === "undefined" || navigator.clipboard === undefined) {
        throw new Error("这个浏览器不支持复制，请改用「下载 JSON」。");
      }
      await navigator.clipboard.writeText(text);
      announce("已复制");
    } catch (error) {
      announce(errorMessage(error, "复制失败，请重试。"));
    } finally {
      setBusy(false);
    }
  }

  async function handleDownloadJson() {
    if (busy) return;
    setBusy(true);
    try {
      const text = await settingsJson();
      downloadBlob(new Blob([text], { type: "application/json" }), "initialis-settings.json");
      announce("已下载设置");
    } catch (error) {
      announce(errorMessage(error, "导出失败，请重试。"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor="export-transparent" className="text-[13px]">
          透明背景
        </Label>
        <Switch
          id="export-transparent"
          checked={transparent}
          onCheckedChange={setTransparent}
          disabled={busy}
        />
      </div>

      <div className="flex items-center justify-between gap-3">
        <span className="text-[13px] text-muted-foreground">尺寸</span>
        <div role="group" aria-label="导出尺寸" className="flex items-center gap-1">
          {SIZES.map((value) => (
            <Button
              key={value}
              type="button"
              variant={value === size ? "default" : "outline"}
              aria-pressed={value === size}
              onClick={() => setSize(value)}
              disabled={busy}
              className="h-8 min-w-12 px-2.5 text-[13px] tabular-nums transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96] pointer-coarse:h-11"
            >
              {value}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          onClick={handleDownloadPng}
          disabled={busy}
          className="transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96]"
        >
          下载 PNG
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleCopy}
          disabled={busy}
          className="transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96]"
        >
          复制设置
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleDownloadJson}
          disabled={busy}
          className="transition-[transform,background-color,color,border-color] duration-150 ease-out active:scale-[0.96]"
        >
          下载 JSON
        </Button>
      </div>

      <p
        role="status"
        aria-live="polite"
        className="min-h-5 text-[13px] text-muted-foreground text-pretty"
      >
        {status ?? ""}
      </p>
    </div>
  );
}
