// Showcase inspired by shadcn-labs/pdfcn (MIT). https://github.com/shadcn-labs/pdfcn

export const PDF_API: string =
  (import.meta.env.VITE_PDF_API as string | undefined) ||
  "https://pdfcn-pdf.liyishan.workers.dev";

export const PDF_MAX_BYTES = 2 * 1024 * 1024;

const FONT_MAX_BYTES = 300 * 1024;

/** Cache of in-flight/complete font inlining, keyed by absolute URL. */
const fontCache = new Map<string, Promise<string | null>>();

export function pdfFilename(blockId: string, themeId: string): string {
  return `${blockId}-${themeId}.pdf`;
}

export function findPdfPage(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="pdf-page"]');
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** The renderer blocks all network requests, so inline same-origin fonts as data: URLs. */
function inlineFontUrl(raw: string, base: string): Promise<string | null> {
  let absolute: URL;
  try {
    absolute = new URL(raw, base);
  } catch {
    return Promise.resolve(null);
  }

  if (absolute.origin !== location.origin) {
    return Promise.resolve(null);
  }

  const cached = fontCache.get(absolute.href);
  if (cached) {
    return cached;
  }

  const pending = (async (): Promise<string | null> => {
    try {
      const res = await fetch(absolute.href, { mode: "cors" });
      if (!res.ok) {
        return null;
      }
      const blob = await res.blob();
      if (blob.size > FONT_MAX_BYTES) {
        return null;
      }
      return await blobToDataUrl(blob);
    } catch {
      return null;
    }
  })();

  fontCache.set(absolute.href, pending);
  return pending;
}

const FONT_URL_RE = /url\(\s*(['"]?)([^'")]+)\1\s*\)/g;

/** Rewrite every `url(...)` in a `@font-face` rule, or return null to drop the rule. */
async function rewriteFontFace(rule: CSSFontFaceRule, base: string): Promise<string | null> {
  const text = rule.cssText;
  const matches = Array.from(text.matchAll(FONT_URL_RE));

  let result = "";
  let cursor = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const raw = match[2];
    const inlined = raw.startsWith("data:") ? raw : await inlineFontUrl(raw, base);
    if (inlined === null) {
      return null;
    }
    result += text.slice(cursor, start) + `url("${inlined}")`;
    cursor = start + match[0].length;
  }

  result += text.slice(cursor);
  return result;
}

async function collectCss(): Promise<string> {
  const parts: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList;
    try {
      rules = sheet.cssRules;
    } catch {
      // Cross-origin stylesheet — not readable, skip it.
      continue;
    }

    const base = sheet.href ?? document.baseURI;

    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSFontFaceRule) {
        const rewritten = await rewriteFontFace(rule, base);
        if (rewritten !== null) {
          parts.push(rewritten);
        }
      } else {
        parts.push(rule.cssText);
      }
    }
  }

  return parts.join("\n");
}

export async function buildPageHtml(pageEl: HTMLElement, title: string): Promise<string> {
  const cs = getComputedStyle(pageEl);
  const bg = cs.backgroundColor;
  const fg = cs.color;
  const font = cs.fontFamily;

  const clone = pageEl.cloneNode(true) as HTMLElement;
  const css = await collectCss();

  const printCss =
    "@page{size:A4;margin:0}" +
    `html,body{margin:0;padding:0;background:${bg};color:${fg};}` +
    `body{font-family:${font};-webkit-print-color-adjust:exact;print-color-adjust:exact;}` +
    ".pdf-page{width:210mm!important;max-width:none!important;min-height:0!important;margin:0!important;box-shadow:none!important;border:0!important;border-radius:0!important;}" +
    "tr,li,.break-inside-avoid{break-inside:avoid;}";

  // Cloudflare's Chromium does not paint @page backgrounds, so html/body carry the theme
  // background and the page margin is 0 — that fills every PDF page edge to edge.
  // Do NOT copy the `dark` class from <html>: document colours come only from the pdf theme.
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(
    title,
  )}</title><style>${css}</style><style>${printCss}</style></head><body>${clone.outerHTML}</body></html>`;
}

function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Wait `ms`, rejecting with the abort reason if `signal` fires first. */
function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }

    let timer: ReturnType<typeof setTimeout>;
    const onAbort = () => {
      clearTimeout(timer);
      reject(signal?.reason);
    };

    timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, ms);

    signal?.addEventListener("abort", onAbort, { once: true });
  });
}

export type ExportPdfOptions = {
  pageEl: HTMLElement;
  blockId: string;
  themeId: string;
  signal?: AbortSignal;
  onStatus?: (message: string) => void;
};

export async function exportPdf(options: ExportPdfOptions): Promise<string> {
  const { pageEl, blockId, themeId, signal, onStatus } = options;

  const filename = pdfFilename(blockId, themeId);
  const html = await buildPageHtml(pageEl, filename.replace(/\.pdf$/, ""));
  const body = JSON.stringify({ html, filename });

  if (new TextEncoder().encode(body).byteLength > PDF_MAX_BYTES) {
    throw new Error("Document too large for PDF export (2 MB cap)");
  }

  onStatus?.("Rendering PDF…");

  const MAX_ATTEMPTS = 3;
  let res: Response | undefined;

  try {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      res = await fetch(`${PDF_API}/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        signal,
      });

      // Only a busy renderer is worth retrying; the last attempt falls through
      // to the regular error handling below.
      if (res.status !== 503 || attempt === MAX_ATTEMPTS) {
        break;
      }

      const header = Number.parseFloat(res.headers.get("Retry-After") ?? "");
      const seconds = Math.min(20, Math.max(3, Number.isFinite(header) && header > 0 ? header : 10));
      onStatus?.(`Renderer busy — retrying in ${seconds}s…`);
      await delay(seconds * 1000, signal);
    }
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }
    if (error instanceof TypeError) {
      throw new Error("Could not reach the PDF service — check your connection and retry");
    }
    throw error;
  }

  if (!res) {
    throw new Error("PDF export failed: no response from renderer");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limited — try again in a minute");
    }

    if (res.status === 413) {
      throw new Error("Document too large for PDF export (2 MB cap)");
    }

    let message: string | undefined;
    try {
      const payload = (await res.json()) as { error?: string };
      message = payload.error;
    } catch {
      message = undefined;
    }

    throw new Error(`PDF export failed (${res.status}): ${message ?? res.statusText}`);
  }

  const contentType = res.headers.get("Content-Type") ?? "";
  if (!contentType.includes("application/pdf")) {
    throw new Error("PDF service returned an unexpected response");
  }

  download(await res.blob(), filename);
  return filename;
}
