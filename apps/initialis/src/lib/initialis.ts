/**
 * Typed bridge to the vendored INITIĀLIS build served from `public/initialis/`.
 *
 * The vendored files are plain ES modules served as static assets, so they are
 * imported lazily with `import()` and only when the page really needs a cap.
 * Everything is memoised: the four modules are fetched once, the font list once.
 * Nothing here may assume absolute "/initialis/..." URLs — the app can be served
 * from a sub-path, hence `import.meta.env.BASE_URL`.
 */

export type CapSettings = Record<string, string | number | boolean>;

export type ParamDef = {
  key: string;
  section: string;
  stage: string;
  def: unknown;
  spec: unknown;
  label: string;
  group: string | null;
  when: ((settings: CapSettings) => boolean) | null;
};

export type FontInfo = {
  id: string;
  name: string;
  family: string;
  group: string;
  caps: boolean;
};

/** A paper name/colour, or `false` for a transparent background. */
export type Paper = string | boolean;

export type DrawOptions = { size?: number; paper?: Paper };
export type GrowOptions = DrawOptions & { seconds?: number; fps?: number };
export type RenderOptions = { size: number; paper?: Paper };

/* -------------------------------------------------------------------------- */
/* Minimal shapes of the vendored modules (they ship no types of their own)    */
/* -------------------------------------------------------------------------- */

interface InitialisModule {
  draw(canvas: HTMLCanvasElement, settings: CapSettings, options?: DrawOptions): Promise<HTMLCanvasElement>;
  grow(canvas: HTMLCanvasElement, settings: CapSettings, options?: GrowOptions): Promise<HTMLCanvasElement>;
  render(settings: CapSettings, options: RenderOptions): Promise<ImageBitmap>;
  random(seed: number): Promise<CapSettings>;
  settings(settings: CapSettings): Promise<CapSettings>;
}

interface ParamsModule {
  PARAMS: ParamDef[];
  DEFAULTS: CapSettings;
  SECTIONS: Array<{ id: string; name: string }>;
}

interface StylesModule {
  mutate(P: CapSettings, amount: number, sectionIds: string[], seed: number, fonts: FontInfo[]): CapSettings;
  PALETTES: Array<{ name: string }>;
}

interface FontsModule {
  fontList(): Promise<FontInfo[]>;
}

/* -------------------------------------------------------------------------- */
/* Lazy, memoised loading                                                      */
/* -------------------------------------------------------------------------- */

const base = `${import.meta.env.BASE_URL}initialis/`;

const ERR_NO_WEBGL2 =
  "这个浏览器不支持在 Worker 里用 WebGL2，换最新的 Chrome、Edge、Firefox 或 Safari 17+ 再试。";
const ERR_NOT_LOADED = "INITIĀLIS 还没加载，请先调用 loadInitialis()。";
const ERR_NO_2D = "无法创建 2D 画布，PNG 导出失败。";

let loadPromise: Promise<void> | null = null;
let modLib: InitialisModule | null = null;
let modParams: ParamsModule | null = null;
let modStyles: StylesModule | null = null;
let modFonts: FontsModule | null = null;
let fontsPromise: Promise<FontInfo[]> | null = null;

function supportsWorkerWebgl2(): boolean {
  if (typeof OffscreenCanvas === "undefined") return false;
  try {
    return new OffscreenCanvas(1, 1).getContext("webgl2") !== null;
  } catch {
    return false;
  }
}

function loaded<T>(value: T | null): T {
  if (value === null) throw new Error(ERR_NOT_LOADED);
  return value;
}

/** Loads all four vendored modules. Safe to call as often as you like. */
export function loadInitialis(): Promise<void> {
  if (loadPromise !== null) return loadPromise;

  const pending = (async (): Promise<void> => {
    if (!supportsWorkerWebgl2()) throw new Error(ERR_NO_WEBGL2);

    const [lib, params, styles, fonts] = (await Promise.all([
      import(/* @vite-ignore */ `${base}lib/initialis.js`),
      import(/* @vite-ignore */ `${base}render/src/params.js`),
      import(/* @vite-ignore */ `${base}render/src/styles.js`),
      import(/* @vite-ignore */ `${base}render/src/fonts.js`),
    ])) as [InitialisModule, ParamsModule, StylesModule, FontsModule];

    modLib = lib;
    modParams = params;
    modStyles = styles;
    modFonts = fonts;
  })();

  loadPromise = pending;
  // Never cache a rejection forever: a transient failure must be retryable.
  pending.catch(() => {
    if (loadPromise === pending) loadPromise = null;
  });

  return pending;
}

/* -------------------------------------------------------------------------- */
/* Drawing                                                                     */
/* -------------------------------------------------------------------------- */

/** Draws once. A newer draw/grow on the same canvas stops the previous one. */
export async function drawCap(
  canvas: HTMLCanvasElement,
  settings: CapSettings,
  options?: DrawOptions,
): Promise<HTMLCanvasElement> {
  await loadInitialis();
  return loaded(modLib).draw(canvas, settings, options);
}

/** Draws the grow-in animation (static draw when reduced motion is requested). */
export async function growCap(
  canvas: HTMLCanvasElement,
  settings: CapSettings,
  options?: GrowOptions,
): Promise<HTMLCanvasElement> {
  await loadInitialis();
  return loaded(modLib).grow(canvas, settings, options);
}

/** Off-screen render (e.g. for export). Remember to `close()` the bitmap. */
export async function renderCap(settings: CapSettings, options: RenderOptions): Promise<ImageBitmap> {
  await loadInitialis();
  return loaded(modLib).render(settings, options);
}

/** A randomised, fully-populated settings object. */
export async function randomCap(seed: number): Promise<CapSettings> {
  await loadInitialis();
  return loaded(modLib).random(seed);
}

/** Fills in every default so the result can be fed straight to draw/render. */
export async function fullSettings(settings: CapSettings): Promise<CapSettings> {
  await loadInitialis();
  return loaded(modLib).settings(settings);
}

/* -------------------------------------------------------------------------- */
/* Introspection                                                               */
/* -------------------------------------------------------------------------- */

export async function getParams(): Promise<ParamDef[]> {
  await loadInitialis();
  return [...loaded(modParams).PARAMS];
}

export async function getDefaults(): Promise<CapSettings> {
  await loadInitialis();
  return { ...loaded(modParams).DEFAULTS };
}

/** Every bundled font (including display fonts without caps). Cached. */
export function getFonts(): Promise<FontInfo[]> {
  if (fontsPromise === null) {
    const pending = loadInitialis()
      .then(() => loaded(modFonts).fontList())
      .then((list) => (Array.isArray(list) ? list : []));

    fontsPromise = pending;
    pending.catch(() => {
      if (fontsPromise === pending) fontsPromise = null;
    });
  }
  return fontsPromise.then((list) => [...list]);
}

/** Randomises the given sections only; returns full settings. */
export async function mutateCap(P: CapSettings, amount: number, seed: number): Promise<CapSettings> {
  await loadInitialis();
  const styles = loaded(modStyles);
  const sectionIds = loaded(modParams).SECTIONS.map((section) => section.id);
  const fonts = await getFonts();
  const amount01 = Number.isFinite(amount) ? Math.min(1, Math.max(0, amount)) : 0;
  const full = await loaded(modLib).settings(P);
  return styles.mutate(full, amount01, sectionIds, seed, fonts);
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                     */
/* -------------------------------------------------------------------------- */

/** Only the keys whose value differs from the defaults (for export / copy). */
export function diffFromDefaults(P: CapSettings, defaults: CapSettings): CapSettings {
  const out: CapSettings = {};
  for (const [key, value] of Object.entries(P)) {
    if (defaults[key] !== value) out[key] = value;
  }
  return out;
}

/** Renders a cap off-screen and encodes it as a PNG blob. */
export async function capToPngBlob(settings: CapSettings, options: RenderOptions): Promise<Blob> {
  const bitmap = await renderCap(settings, options);
  try {
    const width = Math.max(1, bitmap.width);
    const height = Math.max(1, bitmap.height);

    if (typeof OffscreenCanvas !== "undefined") {
      const offscreen = new OffscreenCanvas(width, height);
      const ctx = offscreen.getContext("2d");
      if (!ctx) throw new Error(ERR_NO_2D);
      ctx.drawImage(bitmap, 0, 0);
      return await offscreen.convertToBlob({ type: "image/png" });
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error(ERR_NO_2D);
    ctx.drawImage(bitmap, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("PNG 导出失败，请重试。");
    return blob;
  } finally {
    bitmap.close();
  }
}

/** Safe `prefers-reduced-motion` lookup (no `window` during build/prerender). */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
