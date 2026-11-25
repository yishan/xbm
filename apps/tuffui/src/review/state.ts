export type Accent = "blue" | "green" | "orange" | "pink";
export type Base = "neutral" | "cool" | "warm" | "sage";
export type Density = "compact" | "comfortable";
export type Dir = "ltr" | "rtl";

export type ReviewState = {
  accent: Accent;
  base: Base;
  duration: number;
  bounce: number;
  density: Density;
  dir: Dir;
  speed: number;
  failure: number;
  caseId: string;
};

export const DEFAULTS: ReviewState = {
  accent: "blue",
  base: "neutral",
  duration: 200,
  bounce: 0,
  density: "comfortable",
  dir: "ltr",
  speed: 1,
  failure: 20,
  caseId: "",
};

export const ACCENTS: readonly Accent[] = ["blue", "green", "orange", "pink"];
export const BASES: readonly Base[] = ["neutral", "cool", "warm", "sage"];

export const ACCENT_HUE: Record<Accent, number> = {
  blue: 252,
  green: 150,
  orange: 50,
  pink: 350,
};

export const BASE_TOKENS: Record<Base, { h: number; c: number }> = {
  neutral: { h: 286, c: 0.003 },
  cool: { h: 250, c: 0.012 },
  warm: { h: 70, c: 0.012 },
  sage: { h: 150, c: 0.01 },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function snap(value: number, step: number): number {
  return Math.round(value / step) * step;
}

function parseNum(
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
  step: number,
): number {
  if (raw === null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n)) return fallback;
  const clamped = clamp(n, min, max);
  const snapped = snap(clamped, step);
  const decimals = step < 1 ? 4 : 0;
  return Number(snapped.toFixed(decimals));
}

export function parseHash(hash: string): ReviewState {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);

  const accent = params.get("a");
  const base = params.get("b");
  const duration = params.get("d");
  const bounce = params.get("bo");
  const density = params.get("den");
  const dir = params.get("dir");
  const speed = params.get("sp");
  const failure = params.get("f");
  const caseId = params.get("c");

  const validAccent = ACCENTS.includes(accent as Accent)
    ? (accent as Accent)
    : DEFAULTS.accent;
  const validBase = BASES.includes(base as Base)
    ? (base as Base)
    : DEFAULTS.base;
  const validDensity = density === "compact" || density === "comfortable"
    ? density
    : DEFAULTS.density;
  const validDir = dir === "ltr" || dir === "rtl"
    ? dir
    : DEFAULTS.dir;

  const validatedCaseId = caseId !== null && /^c\d{2}$/.test(caseId)
    ? caseId
    : DEFAULTS.caseId;

  return {
    accent: validAccent,
    base: validBase,
    duration: parseNum(duration, DEFAULTS.duration, 0, 400, 10),
    bounce: parseNum(bounce, DEFAULTS.bounce, 0, 0.3, 0.05),
    density: validDensity,
    dir: validDir,
    speed: parseNum(speed, DEFAULTS.speed, 0.5, 4, 0.5),
    failure: parseNum(failure, DEFAULTS.failure, 0, 60, 5),
    caseId: validatedCaseId,
  };
}

export function toHash(s: ReviewState): string {
  const params = new URLSearchParams();

  if (s.accent !== DEFAULTS.accent) params.set("a", s.accent);
  if (s.base !== DEFAULTS.base) params.set("b", s.base);
  if (s.duration !== DEFAULTS.duration) params.set("d", String(s.duration));
  if (s.bounce !== DEFAULTS.bounce) params.set("bo", String(s.bounce));
  if (s.density !== DEFAULTS.density) params.set("den", s.density);
  if (s.dir !== DEFAULTS.dir) params.set("dir", s.dir);
  if (s.speed !== DEFAULTS.speed) params.set("sp", String(s.speed));
  if (s.failure !== DEFAULTS.failure) params.set("f", String(s.failure));
  if (s.caseId !== DEFAULTS.caseId) params.set("c", s.caseId);

  const qs = params.toString();
  return qs ? `#${qs}` : "";
}
