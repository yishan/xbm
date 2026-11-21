import { CONTACT_IDS } from "./data";

export type ThemeName = "mono" | "sodium" | "ion" | "ember";
export type AlertLevel = "none" | "caution" | "red";
export type MotionPref = "full" | "subtle" | "off";
export type Hull = "corvette" | "frigate" | "freighter" | "swarm";

export type HudState = {
  theme: ThemeName;
  alert: AlertLevel;
  motion: MotionPref;
  signal: number;
  link: boolean;
  hull: number;
  model: Hull;
  warp: number;
  planet: number;
  cells: number;
  gap: number;
  target: string;
};

export const DEFAULTS: HudState = {
  theme: "mono",
  alert: "none",
  motion: "full",
  signal: 15,
  link: false,
  hull: 100,
  model: "frigate",
  warp: 0,
  planet: 0,
  cells: 20,
  gap: 2,
  target: "warden",
};

export const THEMES: readonly ThemeName[] = ["mono", "sodium", "ion", "ember"];
export const ALERTS: readonly AlertLevel[] = ["none", "caution", "red"];
export const MOTIONS: readonly MotionPref[] = ["full", "subtle", "off"];
export const HULLS: readonly Hull[] = ["corvette", "frigate", "freighter", "swarm"];

export function effectiveSignal(s: HudState): number {
  const raw = s.link ? 100 - s.hull : s.signal;
  return Math.max(0, Math.min(100, raw));
}

function parseNumber(raw: string | null, min: number, max: number, fallback: number): number {
  if (raw === null || raw.trim() === "") return fallback;
  const n = Number(raw);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, Math.round(n)));
}

export function parseHash(hash: string): HudState {
  const result: HudState = { ...DEFAULTS };
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!raw) return result;

  let params: URLSearchParams;
  try {
    params = new URLSearchParams(raw);
  } catch {
    return result;
  }

  const theme = params.get("t");
  if (theme && (THEMES as readonly string[]).includes(theme)) result.theme = theme as ThemeName;

  const alert = params.get("a");
  if (alert && (ALERTS as readonly string[]).includes(alert)) result.alert = alert as AlertLevel;

  const motion = params.get("m");
  if (motion && (MOTIONS as readonly string[]).includes(motion)) result.motion = motion as MotionPref;

  result.signal = parseNumber(params.get("d"), 0, 100, DEFAULTS.signal);

  const link = params.get("l");
  if (link !== null) {
    if (link === "1" || link === "true") result.link = true;
    else if (link === "0" || link === "false") result.link = false;
  }

  result.hull = parseNumber(params.get("h"), 0, 100, DEFAULTS.hull);

  const model = params.get("k");
  if (model && (HULLS as readonly string[]).includes(model)) result.model = model as Hull;

  result.warp = parseNumber(params.get("w"), 0, 100, DEFAULTS.warp);
  result.planet = parseNumber(params.get("p"), 0, 100, DEFAULTS.planet);
  result.cells = parseNumber(params.get("c"), 4, 40, DEFAULTS.cells);
  result.gap = parseNumber(params.get("g"), 0, 6, DEFAULTS.gap);

  const target = params.get("s");
  if (target && CONTACT_IDS.includes(target)) result.target = target;

  return result;
}

export function toHash(s: HudState): string {
  const params = new URLSearchParams();
  if (s.theme !== DEFAULTS.theme) params.set("t", s.theme);
  if (s.alert !== DEFAULTS.alert) params.set("a", s.alert);
  if (s.motion !== DEFAULTS.motion) params.set("m", s.motion);
  if (s.signal !== DEFAULTS.signal) params.set("d", String(s.signal));
  if (s.link !== DEFAULTS.link) params.set("l", s.link ? "1" : "0");
  if (s.hull !== DEFAULTS.hull) params.set("h", String(s.hull));
  if (s.model !== DEFAULTS.model) params.set("k", s.model);
  if (s.warp !== DEFAULTS.warp) params.set("w", String(s.warp));
  if (s.planet !== DEFAULTS.planet) params.set("p", String(s.planet));
  if (s.cells !== DEFAULTS.cells) params.set("c", String(s.cells));
  if (s.gap !== DEFAULTS.gap) params.set("g", String(s.gap));
  if (s.target !== DEFAULTS.target) params.set("s", s.target);
  const qs = params.toString();
  return qs ? "#" + qs : "";
}

function fmt01(value: number): string {
  const clamped = Math.max(0, Math.min(1, value));
  return String(Number(clamped.toFixed(2)));
}

export function toJsx(s: HudState): string {
  const dist = fmt01(effectiveSignal(s) / 100);
  const warp = fmt01(s.warp / 100);
  const body = fmt01(s.planet / 100);
  const integrity = fmt01(s.hull / 100);

  const alertPart = s.alert !== "none" ? ` alert="${s.alert}"` : "";
  const bodyPart = s.planet !== 0 ? ` body={${body}}` : "";

  const lines = [
    `<MonohudProvider theme="${s.theme}" motion="${s.motion}" distortion={${dist}}${alertPart}>`,
    `  <Starfield warp={${warp}}${bodyPart} />`,
    `  <Hologram model="${s.model}" label="Ship hull" integrity={${integrity}} />`,
    `  <Meter label="Hull" value={${s.hull}} cells={${s.cells}} gap={${s.gap}} />`,
    `</MonohudProvider>`,
  ];

  return lines.join("\n") + "\n";
}
