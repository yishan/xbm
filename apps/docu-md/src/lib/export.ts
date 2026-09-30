// Showcase UI inspired by docu.md (https://docu.md/). Re-implemented with a permissive stack.
// Do not vendor GPLv3 engines from markdown-viewer.

export const PDF_API: string =
  (import.meta.env.VITE_PDF_API as string | undefined) ||
  "https://docu-md-pdf.liyishan.workers.dev";

const PDF_MAX_HTML_CHARS = 2_000_000;

const PRINT_CSS = `html,body{margin:0;background:var(--background);} body{font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact;} article{max-width:none!important;margin:0!important;padding:0!important;} svg{max-width:100%;height:auto;} pre,table,figure,svg,blockquote{break-inside:avoid;} h1,h2,h3{break-after:avoid;}`;

export function findExportRoot(): HTMLElement | null {
  return document.querySelector<HTMLElement>("[data-export-root]");
}

function collectCss(): string {
  const parts: string[] = [];

  for (const sheet of Array.from(document.styleSheets)) {
    try {
      for (const rule of Array.from(sheet.cssRules)) {
        parts.push(rule.cssText);
      }
    } catch {
      // Cross-origin stylesheet — not readable, skip it.
    }
  }

  // @font-face would be blocked inside the renderer; fall back to system fonts.
  return parts.join("\n").replace(/@font-face\s*\{[^}]*\}/g, "");
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** The PDF renderer blocks all network requests, so inline <img> sources as data: URLs (best effort). */
async function inlineImages(root: HTMLElement): Promise<HTMLElement> {
  const clone = root.cloneNode(true) as HTMLElement;
  const imgs = Array.from(clone.querySelectorAll("img")).filter((img) => !img.src.startsWith("data:"));
  await Promise.all(
    imgs.map(async (img) => {
      try {
        const res = await fetch(img.src, { mode: "cors" });
        if (!res.ok) return;
        const blob = await res.blob();
        if (blob.size > 256 * 1024) return;
        img.src = await blobToDataUrl(blob);
      } catch {
        // leave as-is; the renderer will show the alt text
      }
    }),
  );
  return clone;
}

export async function buildStandaloneHtml(liveRoot: HTMLElement, title: string): Promise<string> {
  const root = await inlineImages(liveRoot);
  const css = collectCss();
  const htmlClass = document.documentElement.className;
  const theme = document.documentElement.getAttribute("data-theme") ?? "";
  // Paint the page margins in the theme colour too (CSS vars don't resolve inside @page).
  let pageBg = "#ffffff";
  for (let el: HTMLElement | null = liveRoot; el; el = el.parentElement) {
    const bg = getComputedStyle(el).backgroundColor;
    if (bg && bg !== "transparent" && bg !== "rgba(0, 0, 0, 0)") {
      pageBg = bg;
      break;
    }
  }
  const pageCss = `@page{size:A4;margin:16mm 14mm;background:${pageBg};}`;

  return `<!doctype html><html lang="en" class="${escapeHtml(
    htmlClass,
  )}" data-theme="${escapeHtml(theme)}"><head><meta charset="utf-8"><title>${escapeHtml(
    title,
  )}</title><style>${css}</style><style>${pageCss}${PRINT_CSS}</style></head><body class="bg-background text-foreground"><article class="${escapeHtml(
    root.className,
  )}">${root.innerHTML}</article></body></html>`;
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

export function slugify(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "document";
}

export async function exportHtml(title: string): Promise<void> {
  const root = findExportRoot();
  if (!root) {
    throw new Error("Open Split or Preview view to export");
  }

  const html = await buildStandaloneHtml(root, title);
  download(new Blob([html], { type: "text/html" }), `${slugify(title)}.html`);
}

export async function exportPdf(
  title: string,
  signal?: AbortSignal,
  onStatus?: (message: string) => void,
): Promise<void> {
  const root = findExportRoot();
  if (!root) {
    throw new Error("Open Split or Preview view to export");
  }

  const html = await buildStandaloneHtml(root, title);
  const filename = `${slugify(title)}.pdf`;

  if (html.length > PDF_MAX_HTML_CHARS) {
    throw new Error("Document too large for PDF export (2 MB cap)");
  }

  const MAX_ATTEMPTS = 3;
  let res: Response | undefined;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    res = await fetch(`${PDF_API}/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ html, filename }),
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

  if (!res) {
    throw new Error("PDF export failed: no response from renderer");
  }

  if (!res.ok) {
    if (res.status === 429) {
      throw new Error("Rate limited — try again in a minute");
    }

    let message: string | undefined;
    try {
      const payload = (await res.json()) as { error?: string };
      message = payload.error;
    } catch {
      message = undefined;
    }

    throw new Error(
      `PDF export failed (${res.status}): ${message ?? res.statusText}`,
    );
  }

  download(await res.blob(), filename);
}
