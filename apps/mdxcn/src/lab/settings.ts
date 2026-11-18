import { SAMPLES } from "@/lab/samples";
import type { GraphFrame } from "@/registry/default/graph-frame/graph-frame";

export type FigureId = (typeof SAMPLES)[number]["id"];
export type AccentId = "theme" | "blue" | "cyan" | "mint" | "green" | "orange" | "pink" | "purple";
export type Density = "compact" | "regular" | "roomy";
export type FigureFont = "mono" | "sans";
export type View = "react" | "ascii";

export type Settings = {
  accent: AccentId;
  frame: GraphFrame;
  density: Density;
  font: FigureFont;
  speed: number;
  view: View;
};

export const DEFAULT_SETTINGS: Settings = {
  accent: "blue",
  frame: "box",
  density: "regular",
  font: "mono",
  speed: 1,
  view: "react",
};

export const ACCENTS: { id: AccentId; label: string; swatch: string }[] = [
  { id: "theme", label: "Theme", swatch: "var(--foreground)" },
  { id: "blue", label: "Blue", swatch: "oklch(0.6 0.16 255)" },
  { id: "cyan", label: "Cyan", swatch: "oklch(0.62 0.1 210)" },
  { id: "mint", label: "Mint", swatch: "oklch(0.66 0.14 163)" },
  { id: "green", label: "Green", swatch: "oklch(0.62 0.14 145)" },
  { id: "orange", label: "Orange", swatch: "oklch(0.68 0.16 55)" },
  { id: "pink", label: "Pink", swatch: "oklch(0.64 0.17 8)" },
  { id: "purple", label: "Purple", swatch: "oklch(0.6 0.16 300)" },
];

export const SPEED_MIN = 0.25;
export const SPEED_MAX = 2;
export const SPEED_STEP = 0.25;

const VALID_FRAMES: GraphFrame[] = ["box", "corners", "rule", "none"];
const VALID_DENSITIES: Density[] = ["compact", "regular", "roomy"];
const VALID_FONTS: FigureFont[] = ["mono", "sans"];
const VALID_VIEWS: View[] = ["react", "ascii"];

function isFigureId(value: string | null): value is FigureId {
  return SAMPLES.some((sample) => sample.id === value);
}

function isAccentId(value: string | null): value is AccentId {
  return ACCENTS.some((accent) => accent.id === value);
}

function parseSpeed(value: string | null): number {
  const parsed = value === null || value.trim() === "" ? NaN : Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_SETTINGS.speed;
  const stepped = Math.round(parsed / SPEED_STEP) * SPEED_STEP;
  return Math.min(SPEED_MAX, Math.max(SPEED_MIN, stepped));
}

export function readHash(): { figure: FigureId; source: string | null; settings: Settings } {
  const params = new URLSearchParams(window.location.hash.slice(1));

  const figureParam = params.get("f");
  const figure: FigureId = isFigureId(figureParam) ? figureParam : "flow";

  const sourceParam = params.get("src");
  const source = sourceParam ?? null;

  const accentParam = params.get("a");
  const frameParam = params.get("fr");
  const densityParam = params.get("d");
  const fontParam = params.get("t");
  const speedParam = params.get("s");
  const viewParam = params.get("v");

  const settings: Settings = {
    accent: isAccentId(accentParam) ? accentParam : DEFAULT_SETTINGS.accent,
    frame: VALID_FRAMES.includes(frameParam as GraphFrame)
      ? (frameParam as GraphFrame)
      : DEFAULT_SETTINGS.frame,
    density: VALID_DENSITIES.includes(densityParam as Density)
      ? (densityParam as Density)
      : DEFAULT_SETTINGS.density,
    font: VALID_FONTS.includes(fontParam as FigureFont)
      ? (fontParam as FigureFont)
      : DEFAULT_SETTINGS.font,
    speed: parseSpeed(speedParam),
    view: VALID_VIEWS.includes(viewParam as View)
      ? (viewParam as View)
      : DEFAULT_SETTINGS.view,
  };

  return { figure, source, settings };
}

export function writeHash(
  figure: FigureId,
  source: string | null,
  settings: Settings,
): void {
  const params = new URLSearchParams();
  params.set("f", figure);
  params.set("a", settings.accent);
  params.set("fr", settings.frame);
  params.set("d", settings.density);
  params.set("t", settings.font);
  params.set("s", String(settings.speed));
  params.set("v", settings.view);

  if (source !== null) {
    params.set("src", source);
  }

  history.replaceState(null, "", `#${params.toString()}`);
}

export function withFrame(source: string, frame: GraphFrame): string {
  if (frame === "box") return source;

  const match = source.match(/^(\s*<[A-Z][A-Za-z0-9]*)/);
  if (!match) return source;

  const prefix = match[0];
  const rest = source.slice(prefix.length);
  const gtIndex = rest.indexOf(">");

  if (gtIndex === -1) return source;
  if (/\sframe=/.test(rest.slice(0, gtIndex))) return source;

  return `${prefix} frame="${frame}"${rest}`;
}
